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
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;
const AUTH_DIRS = {
  dental_reviews: "dental_reviews",
};

app.use(cors());
app.use(bodyParser.json());

let sockets = {}; // Store active socket sessions
let campaigns = {}; // Store active campaigns

// Function to start a WhatsApp session
const startSock = async (account) => {
  if (!AUTH_DIRS[account]) {
    console.log(`Invalid account: ${account}`);
    return;
  }

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
        console.log(`Session logged out for ${account}.`);
        sockets[account] = null;
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);
};

// Function to stop a WhatsApp session
const stopSock = (account) => {
  if (!sockets[account]) {
    console.log(`Session for ${account} is not running.`);
    return false;
  }

  console.log(`Stopping WhatsApp session for ${account}`);
  sockets[account].end(); // Close the socket connection
  sockets[account] = null; // Remove from active sessions
  return true;
};

// API to schedule a message drip campaign
app.post("/schedule-campaign/:account", async (req, res) => {
  const { account } = req.params;
  const { batchSize, timeout, randomDelay, template, contacts, imageUrl } =
    req.body;

  if (!batchSize || !timeout || !template || !contacts?.length) {
    return res.status(400).json({ error: "Missing required parameters." });
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
  };

  await startSock(account);
  processCampaign(campaignId);
  res.status(200).json({ message: "Campaign scheduled", campaignId });
});

// API to schedule a message drip campaign at a specific date and time
/*
app.post("/schedule-campaign/:account", async (req, res) => {
    const { account } = req.params;
    const { batchSize, timeout, randomDelay, template, contacts, imageUrl, datetime } =
      req.body;
  
    if (!batchSize || !timeout || !template || !contacts?.length || !datetime) {
      return res.status(400).json({ error: "Missing required parameters." });
    }
  
    // Parse the datetime from the request
    const scheduleTime = new Date(datetime);
    if (isNaN(scheduleTime)) {
      return res.status(400).json({ error: "Invalid date/time format." });
    }
  
    // Validate that the datetime is in the future
    if (scheduleTime <= new Date()) {
      return res.status(400).json({ error: "Scheduled time must be in the future." });
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
      scheduleTime, // Store the scheduled time in the campaign object
    };
  
    await startSock(account);
  
    // Schedule the campaign to run at the specified time
    schedule.scheduleJob(scheduleTime, async () => {
      console.log(`Campaign ${campaignId} is starting at ${scheduleTime}`);
      await processCampaign(campaignId);
    });
  
    res.status(200).json({ message: "Campaign scheduled", campaignId });
  });

*/

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

  const job = schedule.scheduleJob(`*/${timeout} * * * * *`, async function () {
    if (index >= contacts.length) {
      job.cancel();
      campaigns[campaignId].status = "completed";
      stopSock(account);
      console.log(`Campaign ${campaignId} completed.`);
      return;
    }

    const batch = contacts.slice(index, index + batchSize);
    console.log(
      `Campaign ${campaignId}: Sending batch of ${batch.length} messages`
    );

    for (const contact of batch) {
      const personalizedMessage = template.replace(/\{name\}/g, contact.name);
      const personalizedImage = imageUrl
        ? imageUrl.replace(/\{name\}/g, contact.name)
        : null;
      const delay = getRandomDelay(randomDelay);
      console.log(
        `Campaign ${campaignId}: Sending message to ${contact.phone} with ${delay}ms delay`
      );
      await sendMessage(
        account,
        contact.phone,
        personalizedMessage,
        personalizedImage
      );
      await new Promise((r) => setTimeout(r, delay));
    }

    index += batchSize;

    if (index < contacts.length) {
      console.log(
        `Campaign ${campaignId}: Waiting for next batch with ${
          timeout * 1000
        }ms delay`
      );
    }
  });
}

function getRandomDelay([min, max]) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function sendMessage(account, phone, message, image) {
  if (!sockets[account]) return;
  const jid = `${phone}@s.whatsapp.net`;
  const payload = image
    ? { image: { url: image }, caption: message }
    : { text: message };
  await sockets[account].sendMessage(jid, payload);
}

// API to get campaign status
app.get("/campaign-status/:campaignId", (req, res) => {
  const { campaignId } = req.params;
  if (!campaigns[campaignId])
    return res.status(404).json({ error: "Campaign not found." });
  res.json({ campaignId, status: campaigns[campaignId].status });
});

// API to stop a running or scheduled campaign
app.post("/stop-campaign/:campaignId", (req, res) => {
  const { campaignId } = req.params;

  // Check if the campaign exists
  const campaign = campaigns[campaignId];
  if (!campaign) {
    return res.status(404).json({ error: "Campaign not found." });
  }

  // Cancel the scheduled job if it exists
  if (campaign.status === "scheduled") {
    const job = schedule.scheduledJobs[campaignId];
    if (job) {
      job.cancel();
      console.log(`Campaign ${campaignId}: Job canceled.`);
    }
  }

  // Update campaign status
  campaigns[campaignId].status = "stopped";

  // Disconnect WhatsApp session if necessary
  stopSock(campaign.account);

  res
    .status(200)
    .json({ message: `Campaign ${campaignId} stopped successfully.` });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
