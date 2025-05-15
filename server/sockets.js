require("dotenv").config();
const sharp = require("sharp");
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

const fs = require("fs-extra");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
//const AUTH_DIRS = {
// dental_reviews: "dental_reviews",
// dental_reviews2: "6145288262",
//};
const AUTH_DIRS = {};

app.use(bodyParser.json());

let sockets = {}; // Active WhatsApp sessions
let campaigns = {}; // Scheduled and running campaigns

// Log active campaigns every 30 seconds
//schedule.scheduleJob("*/30 * * * * *", () => {
// console.log("Active campaigns:");
// console.log(`  - ${Object.keys(campaigns).join(", ")}`);
//});

io.on("connection", (socket) => {
  console.log("a user connected");
  io.emit(
    "campaigns",
    Object.entries(campaigns).map(([id, campaign]) => ({ id, ...campaign })),
  );
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

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
      io.emit("sessionConnected", account);
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log(
        `WhatsApp session closed for ${account}:`,
        DisconnectReason[reason] || reason,
      );

      sockets[account] = null; // Clear the session

      if (reason === DisconnectReason.loggedOut) {
        console.log(`Session logged out for ${account}.`);
      } else {
        console.log(`Session closed. No reconnection will be attempted.`);
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
  io.emit("sessionDisconnected", account);
  sockets[account].end();
  sockets[account] = null;
  return true;
};

// API to schedule a campaign at a specific date and time
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
  if (isNaN(scheduleTime)) {
    return res.status(400).json({ error: "Invalid date/time format." });
  }

  if (scheduleTime <= new Date()) {
    return res
      .status(400)
      .json({ error: "Scheduled time must be in the future." });
  }

  const campaignId = uuidv4();
  campaigns[campaignId] = {
    id: campaignId,
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
    current: 0,
  };

  // Schedule the campaign messages at the specified time
  const startSockTime = new Date(scheduleTime.getTime() - 10000);
  schedule.scheduleJob(startSockTime, async () => {
    console.log(`Starting WhatsApp session for campaign ${campaignId}`);
    await startSock(account);
  });

  schedule.scheduleJob(scheduleTime, async () => {
    console.log(`Campaign ${campaignId} is starting at ${scheduleTime}`);

    // Process and send messages
    await processCampaign(campaignId);
  });

  res
    .status(200)
    .json({ ...campaigns[campaignId], message: "Campaign scheduled" });

  io.emit(
    "campaigns",
    Object.entries(campaigns).map(([id, campaign]) => ({ id, ...campaign })),
  );
});

// Function to process the campaign when scheduled
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

  // Function to process and send a batch of messages
  const sendBatchMessages = async () => {
    const batch = contacts.slice(index, index + batchSize);

    if (batch.length === 0) {
      if (campaigns[campaignId]) {
        campaigns[campaignId].status = "completed";
        console.log(`Campaign ${campaignId} completed.`);
        stopSock(account);
        delete campaigns[campaignId];

        io.emit("campaignsStatus", { campaignId, status: "completed" });
        io.emit(
          "campaigns",
          Object.entries(campaigns).map(([id, campaign]) => ({
            id,
            ...campaign,
          })),
        );
      }
      return;
    }

    console.log(
      `Campaign ${campaignId}: Sending batch of ${batch.length} messages`,
    );

    let progress = 0;
    for (const contact of batch) {
      if (!campaigns[campaignId]) {
        console.log(`Campaign ${campaignId} was stopped. Exiting.`);
        return;
      }

      const personalizedMessage = template.replace(/\{name\}/g, contact.name);
      const personalizedImage = imageUrl
        ? imageUrl.replace(/\{name\}/g, contact.name)
        : null;
      const delay = getRandomDelay(randomDelay);
      console.log(
        `Campaign ${campaignId}: Sending message to ${contact.phone} with ${delay}ms delay`,
      );

      await sendMessage(
        account,
        contact.phone,
        personalizedMessage,
        personalizedImage,
      );

      progress++;

      if (campaigns[campaignId]) {
        // Check again before updating progress
        campaigns[campaignId].progress = (index + progress) / contacts.length;
        campaigns[campaignId].current = index + progress;
        io.emit("campaignsProgress", {
          campaignId,
          progress: campaigns[campaignId].progress,
          current: campaigns[campaignId].current,
          lastPhone: contact.phone,
        });
      } else {
        console.log(
          `Campaign ${campaignId} no longer exists. Stopping updates.`,
        );
        return;
      }

      await new Promise((r) => setTimeout(r, delay)); // Delay between sending each message
    }

    // Update the index to the next batch
    index += batchSize;

    // Schedule the next batch with the timeout delay
    if (index < contacts.length) {
      console.log(
        `Campaign ${campaignId}: Waiting for next batch with ${
          timeout * 1000
        }ms delay`,
      );
      setTimeout(() => {
        if (campaigns[campaignId]) {
          sendBatchMessages();
          io.emit("campaignsStatus", { campaignId, status: "waiting" });
        } else {
          console.log(
            `Campaign ${campaignId} has been stopped. No further batches.`,
          );
        }
      }, timeout * 1000); // Delay between batches
    } else {
      // Stop the sock after the last batch
      if (campaigns[campaignId]) {
        stopSock(account);
        delete campaigns[campaignId];
        io.emit("campaignsStatus", { campaignId, status: "completed" });
        io.emit(
          "campaigns",
          Object.entries(campaigns).map(([id, campaign]) => ({
            id,
            ...campaign,
          })),
        );
      }
    }
  };

  // Start sending the first batch
  sendBatchMessages();
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

  await sockets[account].sendMessage(jid, payload, { linkPreview: false });

  //io.emit("message-sent", { account, phone });
}

/*
async function sendMessage(account, phone, message, image) {
  if (!sockets[account]) return;

  const jid = `${phone}@s.whatsapp.net`;

  // Check if the phone number is registered on WhatsApp
  const isRegistered = await sockets[account].onWhatsApp(phone);

  if (!isRegistered || isRegistered.length === 0) {
    console.log(`The phone number ${phone} is not registered on WhatsApp.`);
    return;
  }

  const payload = image
    ? { image: { url: image }, caption: message }
    : { text: message };

  await sockets[account].sendMessage(jid, payload, { linkPreview: false });

  console.log(`Message sent to ${phone}`);
}

*/

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
  const campaign = campaigns[campaignId];

  if (!campaign) {
    return res.status(404).json({ error: "Campaign not found." });
  }

  if (campaign.status === "scheduled") {
    const job = schedule.scheduledJobs[campaignId];
    if (job) {
      job.cancel();
      console.log(`Campaign ${campaignId}: Job canceled.`);
    }
  }

  campaigns[campaignId].status = "stopped";
  stopSock(campaign.account);
  delete campaigns[campaignId];

  io.emit("campaignsStatus", { campaignId, status: "stopped" });
  io.emit(
    "campaigns",
    Object.entries(campaigns).map(([id, campaign]) => ({ id, ...campaign })),
  );

  res
    .status(200)
    .json({ message: `Campaign ${campaignId} stopped successfully.` });
});

app.post("/send-message/:account", async (req, res) => {
  const { account } = req.params;
  const { phone, message, image } = req.body;

  if (!AUTH_DIRS[account]) {
    return res.status(400).json({ error: "Invalid account name." });
  }
  if (!phone || (!message && !image)) {
    return res.status(400).json({ error: "Invalid request parameters." });
  }
  if (!sockets[account]) {
    return res
      .status(500)
      .json({ error: `WhatsApp session for ${account} is not active.` });
  }

  try {
    const jid = `${phone}@s.whatsapp.net`;
    const payload = image
      ? { image: { url: image }, caption: message }
      : { text: message };
    await sockets[account].sendMessage(jid, payload, { linkPreview: false });

    res.status(200).json({
      success: true,
      message: `Message sent successfully from ${account}.`,
    });
  } catch (error) {
    console.error(`Error sending message from ${account}:`, error);
    res.status(500).json({ error: `Failed to send message from ${account}.` });
  }
});

app.post("/start/:account", async (req, res) => {
  const { account } = req.params;

  if (!AUTH_DIRS[account]) {
    return res.status(400).json({ error: "Invalid account name." });
  }

  await startSock(account);

  res.status(200).json({ message: `Session started for ${account}.` });
  io.emit("sessionConnected", account);
});

// API to stop a specific WhatsApp session
app.post("/stop/:account", (req, res) => {
  const { account } = req.params;

  if (!AUTH_DIRS[account]) {
    return res.status(400).json({ error: "Invalid account name." });
  }

  if (stopSock(account)) {
    res.status(200).json({ message: `Session stopped for ${account}.` });
    io.emit("sessionDisconnected", account);
  } else {
    res.status(400).json({ error: `Session for ${account} is not running.` });
  }
});

function getRootFolder(folder) {
  return path.join(process.cwd(), folder);
}

async function downloadFolder(bucketName, folderPath) {
  try {
    if (!bucketName || !folderPath) {
      return {
        success: false,
        message: "Bucket name and folder path are required.",
      };
    }

    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath, { limit: 100 });

    if (error) throw error;
    if (!data || data.length === 0) {
      return {
        success: false,
        message: "No files found in the Supabase folder.",
      };
    }

    const LOCAL_FOLDER = getRootFolder(folderPath);
    await fs.ensureDir(LOCAL_FOLDER); // Ensure the folder exists

    for (const file of data) {
      const filePath = `${folderPath}/${file.name}`;
      const { data: fileData, error: downloadError } = await supabase.storage
        .from(bucketName)
        .download(filePath);

      if (downloadError) {
        console.error(`Error downloading ${filePath}:`, downloadError);
        continue;
      }

      const localFilePath = path.join(LOCAL_FOLDER, file.name);
      await fs.writeFile(
        localFilePath,
        Buffer.from(await fileData.arrayBuffer()),
      );
      console.log(`Downloaded ${filePath} to ${localFilePath}`);
    }

    return {
      success: true,
      message: "Folder downloaded successfully.",
      path: LOCAL_FOLDER,
    };
  } catch (err) {
    console.error("Error downloading folder:", err);
    return { success: false, message: err.message };
  }
}

// API Endpoint to trigger the download
app.post("/download-auth", async (req, res) => {
  const { bucket, folder } = req.body;
  const result = await downloadFolder(bucket, folder);
  res.json(result);
});

app.post("/list-folders", async (req, res) => {
  const { bucket } = req.body;

  try {
    const { data, error } = await supabase.storage.from(bucket).list("", {
      limit: 100,
      offset: 0,
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Extract unique folder names
    const folders = [...new Set(data.map((file) => file.name.split("/")[0]))];

    // Update AUTH_DIRS dynamically
    folders.forEach((folder) => {
      AUTH_DIRS[folder] = folder; // Set folder name as the key & value
    });

    console.log("Updated AUTH_DIRS:", AUTH_DIRS); // Debugging output

    res.json({ folders, authDirs: AUTH_DIRS });
  } catch (err) {
    console.error("Error listing folders:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function listFoldersOnLoad(bucket) {
  try {
    const { data, error } = await supabase.storage.from(bucket).list("", {
      limit: 100,
      offset: 0,
    });

    if (error) {
      throw new Error(error.message);
    }

    const folders = [...new Set(data.map((file) => file.name.split("/")[0]))];

    folders.forEach((folder) => {
      AUTH_DIRS[folder] = folder;
    });

    console.log("Updated AUTH_DIRS:", AUTH_DIRS);
  } catch (err) {
    console.error("Error listing folders:", err.message);
  }
}
const BUCKET_NAME = "whatsapp-sessions"; // Replace with your actual bucket name
listFoldersOnLoad(BUCKET_NAME);

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
