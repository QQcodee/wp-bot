require("dotenv").config();

const express = require("express");
const http = require("http");
const { v4: uuidv4 } = require("uuid");
const schedule = require("node-schedule");
const {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const bodyParser = require("body-parser");
const cors = require("cors");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);

// Set up CORS for Express API
const corsOptions = {
  origin: "http://localhost:3000", // Replace with your frontend URL
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOptions)); // Allow CORS for Express API

// Initialize Socket.IO with CORS configuration
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with your frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});
const PORT = process.env.PORT || 3001;
const AUTH_DIRS = { dental_reviews: "dental_reviews" };

app.use(bodyParser.json());

let sockets = {}; // Active WhatsApp sessions
let campaigns = {}; // Scheduled and running campaigns

// Start a WhatsApp session
const startSock = async (account) => {
  if (!AUTH_DIRS[account]) return;

  if (sockets[account]) {
    console.log(`Session for ${account} is already running.`);
    return;
  }

  console.log(`Starting WhatsApp session for ${account}`);
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIRS[account]);
  const sock = makeWASocket({ auth: state });
  sockets[account] = sock;

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(`Scan QR code for ${account}:`);
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log(`WhatsApp session connected for ${account}`);
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log(
        `WhatsApp session closed for ${account}:`,
        DisconnectReason[reason] || reason
      );

      if (reason === DisconnectReason.loggedOut) {
        sockets[account] = null;
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);
};

// Stop a WhatsApp session
const stopSock = (account) => {
  if (!sockets[account]) return false;

  console.log(`Stopping WhatsApp session for ${account}`);
  sockets[account].end();
  sockets[account] = null;
  return true;
};

// When a new campaign is scheduled, broadcast the updated list
app.post("/schedule-campaign/:account", async (req, res) => {
  const { account } = req.params;
  const {
    batchSize,
    timeout,
    randomDelay,
    template,
    contacts,
    imageUrl,
    datetime,
  } = req.body;

  if (!batchSize || !timeout || !template || !contacts?.length || !datetime) {
    return res.status(400).json({ error: "Missing required parameters." });
  }

  const scheduleTime = new Date(datetime);
  if (isNaN(scheduleTime) || scheduleTime <= new Date()) {
    return res.status(400).json({ error: "Invalid or past date/time." });
  }

  const campaignId = uuidv4();
  campaigns[campaignId] = {
    account,
    batchSize,
    timeout,
    randomDelay,
    template,
    contacts,
    imageUrl,
    status: "scheduled",
    scheduleTime,
    progress: 0,
  };

  // Emit the updated campaigns list to all clients
  io.emit("campaigns", campaigns); // Emit updated campaigns to all connected clients

  // Schedule the job for the campaign
  schedule.scheduleJob(scheduleTime, async () => {
    console.log(`Campaign ${campaignId} is starting`);
    await startSock(account);
    await processCampaign(campaignId);
  });

  res.status(200).json({ message: "Campaign scheduled", campaignId });
});

// Process campaign
async function processCampaign(campaignId) {
  const campaign = campaigns[campaignId];
  if (!campaign) return;

  let {
    batchSize,
    timeout,
    randomDelay,
    template,
    contacts,
    imageUrl,
    account,
  } = campaign;
  let index = 0;

  campaigns[campaignId].status = "running";
  io.emit("update", { campaignId, status: "running" });

  const job = schedule.scheduleJob(`*/${timeout} * * * * *`, async function () {
    if (index >= contacts.length) {
      job.cancel();
      campaigns[campaignId].status = "completed";
      campaigns[campaignId].progress = 100;
      io.emit("update", {
        campaignId,
        status: "completed",
        progress: 100,
      });
      stopSock(account);
      return;
    }

    const batch = contacts.slice(index, index + batchSize);
    for (const contact of batch) {
      const personalizedMessage = template.replace(/\{name\}/g, contact.name);
      const personalizedImage = imageUrl
        ? imageUrl.replace(/\{name\}/g, contact.name)
        : null;
      const delay = getRandomDelay(randomDelay);

      await sendMessage(
        account,
        contact.phone,
        personalizedMessage,
        personalizedImage
      );
      await new Promise((r) => setTimeout(r, delay));
    }

    index += batchSize;
    campaigns[campaignId].progress = Math.round(
      (index / contacts.length) * 100
    );
    io.emit("update", {
      campaignId,
      progress: campaigns[campaignId].progress,
    });
  });
}

// Get random delay
function getRandomDelay([min, max]) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Send a WhatsApp message
async function sendMessage(account, phone, message, image) {
  if (!sockets[account]) return;
  const jid = `${phone}@s.whatsapp.net`;
  const payload = image
    ? { image: { url: image }, caption: message }
    : { text: message };
  await sockets[account].sendMessage(jid, payload);
}

// Get campaign status
app.get("/campaign-status/:campaignId", (req, res) => {
  const { campaignId } = req.params;
  if (!campaigns[campaignId])
    return res.status(404).json({ error: "Campaign not found." });
  res.json({
    campaignId,
    status: campaigns[campaignId].status,
    progress: campaigns[campaignId].progress,
  });
});

//Get status on loading client

app.get("/status", (req, res) => {
  res.status(200).json({
    campaigns: campaigns,
  });
});

// Stop a campaign
app.post("/stop-campaign/:campaignId", (req, res) => {
  const { campaignId } = req.params;
  const campaign = campaigns[campaignId];

  if (!campaign) return res.status(404).json({ error: "Campaign not found." });

  if (campaign.status === "scheduled") {
    const job = schedule.scheduledJobs[campaignId];
    if (job) job.cancel();
  }

  campaigns[campaignId].status = "stopped";
  campaigns[campaignId].progress = 0;
  stopSock(campaign.account);

  io.emit("update", {
    campaignId,
    status: "stopped",
    progress: 0,
  });

  res.status(200).json({ message: `Campaign ${campaignId} stopped.` });
});

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
