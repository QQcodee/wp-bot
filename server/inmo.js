require("dotenv").config();

const sharp = require("sharp");
const fileType = require("file-type");
const mime = require("mime-types");

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
const axios = require("axios");
const socketIo = require("socket.io");

const fs = require("fs-extra");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const { downloadMediaMessage } = require("@whiskeysockets/baileys");

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL_BOT;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY_BOT;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const server = http.createServer(app);

// Set up CORS for Express API
const corsOptions = {
  origin: "*", // This allows all origins
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOptions)); // Allow CORS for Express API

// Initialize Socket.IO with CORS configuration
const io = socketIo(server, {
  cors: {
    origin: "*", // This allows all origins
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

const convertToCompatibleImage = async (url) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const mimeType = response.headers["content-type"];
  const originalBuffer = response.data;

  // Lista de tipos a convertir
  const convertList = [
    "image/heic",
    "image/heif",
    "image/webp",
    "image/tiff",
    "image/bmp",
    "image/svg+xml",
    "image/gif",
  ];

  if (convertList.includes(mimeType)) {
    let image = sharp(originalBuffer).rotate();

    // Para GIF, tomamos solo el primer frame
    if (mimeType === "image/gif") {
      image = image.webp({ lossless: true }).toBuffer();
      return {
        buffer: await image,
        mimetype: "image/webp",
      };
    }

    // Convertimos a JPEG (salvo BMP → PNG)
    const output = await image
      .toFormat(mimeType === "image/bmp" ? "png" : "jpeg")
      .toBuffer();

    return {
      buffer: output,
      mimetype: mimeType === "image/bmp" ? "image/png" : "image/jpeg",
    };
  }

  // Si ya es compatible, lo enviamos como está
  return { buffer: originalBuffer, mimetype: mimeType };
};

//SEND INFO ON SOCKET CONECT
io.on("connection", (socket) => {
  console.log("a user connected");
  io.emit(
    "campaigns",
    Object.entries(campaigns).map(([id, campaign]) => ({ id, ...campaign })),
  );
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  io.emit(
    "sockets",
    Object.entries(sockets).map(([account, socketObj]) => ({
      account,
      socket: socketObj?.sock?.user || null,
      webhookUrl: socketObj?.webhookUrl || null,
    })),
  );
});

// Start WP Sockets function

const messageQueues = new Map(); // jid => [text messages]
const timers = new Map(); // jid => timeout ID
const INACTIVITY_DELAY = 10000; // 10 seconds

const messageStore = new Map(); // key: message ID, value: full message object

const startSock = async (account, webhookUrl = null, groupListener = null) => {
  if (!AUTH_DIRS[account]) {
    console.log(`Invalid account: ${account}`);
    return { error: "Invalid account" };
  }

  if (sockets[account]) {
    console.log(`Session for ${account} is already running.`);
    return { message: "Session already running" };
  }

  console.log(`Starting WhatsApp session for ${account}`);
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIRS[account]);
  const sock = makeWASocket({
    auth: state,
    getMessage: async (key) => {
      const stored = messageStore.get(key.id);
      return stored?.message || undefined;
    },
  });

  // Store socket and webhook together

  sockets[account] = { sock, webhookUrl };

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
        DisconnectReason[reason] || reason,
      );
      sockets[account] = null;
    }

    // Emit to frontend with webhook info
    io.emit(
      "sockets",
      Object.entries(sockets).map(([account, socketObj]) => ({
        account,
        socket: socketObj?.sock?.user || null,
        webhookUrl: socketObj?.webhookUrl || null,
      })),
    );
  });

  // Send messages to webhook if provided
  if (webhookUrl) {
    sock.ev.on("messages.upsert", async ({ type, messages }) => {
      if (type !== "notify") return;

      for (const message of messages) {
        if (message.message) {
          messageStore.set(message.key.id, message);

          // Delete from memory after 60 seconds
          setTimeout(() => {
            messageStore.delete(message.key.id);
          }, 60 * 1000);
        }

        if (message.key.fromMe) continue; // 🛑 Ignore messages sent by yourself

        const jid = message.key.remoteJid;
        const timestamp = message.messageTimestamp || Date.now();
        const content = message.message;

        if (!content) continue;

        // ✅ Handle voice messages immediately
        if (content?.audioMessage?.ptt) {
          try {
            const buffer = await downloadMediaMessage(
              message,
              "buffer",
              {},
              { logger: console, reuploadRequest: sock.updateMediaMessage },
            );

            const fileName = `voice_${Date.now()}.ogg`;
            const audioBase64 = buffer.toString("base64");

            await axios.post(webhookUrl, {
              sender: jid,
              timestamp,
              type: "voice",
              filename: fileName,
              audioBase64,
            });
          } catch (err) {
            console.error("Error sending voice message:", err.message);
          }

          continue; // skip text batching
        }

        // ✅ Handle text batching (including replies)
        const text =
          content?.conversation ||
          content?.extendedTextMessage?.text ||
          content?.imageMessage?.caption ||
          "[Unsupported text content]";

        if (!text) continue;

        // Optional: Extract quoted message (if reply)
        const contextInfo = content?.extendedTextMessage?.contextInfo;
        const quoted = contextInfo?.quotedMessage;

        let originalText = null;

        if (quoted) {
          originalText =
            quoted?.conversation ||
            quoted?.extendedTextMessage?.text ||
            quoted?.imageMessage?.caption ||
            "[Unsupported original message]";
        }

        if (!messageQueues.has(jid)) {
          messageQueues.set(jid, []);
        }

        messageQueues.get(jid).push({
          timestamp,
          content: text,
          ...(originalText && { repliedTo: originalText }), // include only if reply
        });

        // Reset batching timer
        if (timers.has(jid)) {
          clearTimeout(timers.get(jid));
        }

        timers.set(
          jid,
          setTimeout(async () => {
            const messagesToSend = messageQueues.get(jid);
            messageQueues.delete(jid);
            timers.delete(jid);

            try {
              await axios.post(webhookUrl, {
                sender: jid,
                type: "batch",
                messages: messagesToSend,
              });
            } catch (err) {
              console.error("Error sending text message batch:", err.message);
            }
          }, INACTIVITY_DELAY),
        );
      }
    });
  }

  if (groupListener) {
    sock.ev.on("group-participants.update", async (update) => {
      const { id, participants, action } = update;

      if (action === "add") {
        console.log(`New participant(s) added to group ${id}:`, participants);

        for (const participant of participants) {
          // Send a private message (1-on-1 chat)
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await sock.sendMessage(participant, {
            text: `👋 Bienvenido al grupo gracias por unirte😊`,
            linkPreview: false,
          });
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await sock.sendMessage(participant, {
            image: { url: "https://img1.niftyimages.com/vmjh/hi57/ns9p" },
            caption: "Este es un ejemplo",
            linkPreview: false,
          });
        }
      }
    });
  }

  sock.ev.on("creds.update", saveCreds);
  return { message: "Session started" };
};

// Stop a WhatsApp session function

const stopSock = (account) => {
  const socketObj = sockets[account];

  if (!socketObj || !socketObj.sock) {
    console.log(`Session for ${account} is not running.`);
    return false;
  }

  console.log(`Stopping WhatsApp session for ${account}`);
  io.emit("sessionDisconnected", account);

  socketObj.sock.end(); // <-- Call .end() on the sock inside the object
  delete sockets[account]; // <-- Delete the socket object

  return true;
};

const sendMessage = async (account, phone, message, image, check = false) => {
  const socketObj = sockets[account];
  if (!socketObj || !socketObj.sock) return { error: "Session not found" };

  const sock = socketObj.sock;
  const jid = `${phone}@s.whatsapp.net`;

  if (check) {
    const isRegistered = await sock.onWhatsApp(phone);
    if (!isRegistered || isRegistered.length === 0) {
      return {
        error: `The phone number ${phone} is not registered on WhatsApp.`,
      };
    }
  }

  const payload = image
    ? { image: { url: image }, caption: message }
    : { text: message };

  await sock.sendMessage(jid, payload, { linkPreview: false });
  return { message: `Message sent to ${phone}` };
};

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
    checkRegistered,
  } = campaign;
  let index = 0;

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
        checkRegistered,
      );

      progress++;

      if (campaigns[campaignId]) {
        campaigns[campaignId].progress = (index + progress) / contacts.length;
        campaigns[campaignId].current = index + progress;
        io.emit("campaignsProgress", {
          campaignId,
          progress: campaigns[campaignId].progress,
          current: campaigns[campaignId].current,
          status: "active",
          lastPhone: contact.phone,
        });
      } else {
        console.log(
          `Campaign ${campaignId} no longer exists. Stopping updates.`,
        );
        return;
      }

      await new Promise((r) => setTimeout(r, delay));
    }

    index += batchSize;

    if (index < contacts.length) {
      console.log(
        `Campaign ${campaignId}: Waiting for next batch with ${
          timeout * 1000
        }ms delay`,
      );
      io.emit("campaignsStatus", { campaignId, status: "paused" });
      setTimeout(() => {
        if (campaigns[campaignId]) {
          sendBatchMessages();
          io.emit("campaignsStatus", { campaignId, status: "active" });
        } else {
          console.log(
            `Campaign ${campaignId} has been stopped. No further batches.`,
          );
        }
      }, timeout * 1000);
    } else {
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

  sendBatchMessages();
}

function getRandomDelay([min, max]) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Start a WhatsApp session API
// "id": "120363399228518783@g.us",
app.post("/start/:account", async (req, res) => {
  const { account } = req.params;
  const { webhookUrl, groupListener } = req.body;
  const result = await startSock(account, webhookUrl, groupListener);
  res.json(result);
});

// Stop a WhatsApp session API
app.post("/stop/:account", (req, res) => {
  const { account } = req.params;

  if (!AUTH_DIRS[account]) {
    return res.status(400).json({ error: "Invalid account name." });
  }

  if (stopSock(account)) {
    res.status(200).json({ message: `Session stopped for ${account}.` });
    io.emit("sessionDisconnected", account);
    io.emit(
      "sockets",
      Object.entries(sockets).map(([account, socketObj]) => ({
        account,
        socket: socketObj?.sock?.user || null,
        webhookUrl: socketObj?.webhookUrl || null,
      })),
    );
  } else {
    res.status(400).json({ error: `Session for ${account} is not running.` });
  }
});

app.post("/send-message/:account", async (req, res) => {
  const { account } = req.params;
  const { jid, message, images } = req.body;

  if (!AUTH_DIRS[account]) {
    return res.status(400).json({ error: "Invalid account name." });
  }

  if (!jid || (!message && (!images || images.length === 0))) {
    return res.status(400).json({ error: "Invalid request parameters." });
  }

  const sock = sockets[account]?.sock;
  if (!sock) {
    return res
      .status(500)
      .json({ error: `WhatsApp session for ${account} is not active.` });
  }

  try {
    if (message) {
      await sock.sendMessage(jid, { text: message }, { linkPreview: false });
    }

    if (Array.isArray(images)) {
      for (const imgUrl of images) {
        try {
          const { buffer, mimetype } = await convertToCompatibleImage(imgUrl);

          await sock.sendMessage(jid, {
            image: buffer,
            mimetype,
          });
        } catch (err) {
          console.warn(`Error processing image: ${imgUrl}`, err.message);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Message${images ? " and images" : ""} sent successfully from ${account}.`,
    });
  } catch (error) {
    console.error(`Error sending message from ${account}:`, error);
    res.status(500).json({ error: `Failed to send message from ${account}.` });
  }
});

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
    checkRegistered,
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
    checkRegistered,
  };

  const startSockTime = new Date(scheduleTime.getTime() - 10000);
  schedule.scheduleJob(startSockTime, async () => {
    console.log(`Starting WhatsApp session for campaign ${campaignId}`);
    await startSock(account);
  });

  schedule.scheduleJob(scheduleTime, async () => {
    console.log(`Campaign ${campaignId} is starting at ${scheduleTime}`);
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

async function uploadFolder(bucketName, localFolderPath, remoteFolderPath) {
  try {
    if (!bucketName || !localFolderPath || !remoteFolderPath) {
      return {
        success: false,
        message:
          "Bucket name, local folder path, and remote folder path are required.",
      };
    }

    const files = await fs.readdir(localFolderPath);
    if (files.length === 0) {
      return {
        success: false,
        message: "No files found in the local folder.",
      };
    }

    for (const file of files) {
      const localFilePath = path.join(localFolderPath, file);
      const remoteFilePath = `${remoteFolderPath}/${file}`;

      const fileBuffer = await fs.readFile(localFilePath);
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(remoteFilePath, fileBuffer, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error(`Error uploading ${file}:`, error);
        continue;
      }

      console.log(`Uploaded ${file} to ${remoteFilePath}`);
    }

    return {
      success: true,
      message: "Folder uploaded successfully.",
      remotePath: remoteFolderPath,
    };
  } catch (err) {
    console.error("Error uploading folder:", err);
    return { success: false, message: err.message };
  }
}

// API Endpoint to trigger the upload
app.post("/upload-auth", async (req, res) => {
  const { bucket, localFolder, remoteFolder } = req.body;
  const result = await uploadFolder(bucket, localFolder, remoteFolder);
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

// Get all groups for an account
app.get("/groups/:account", async (req, res) => {
  const { account } = req.params;
  const socketObj = sockets[account];

  if (!socketObj || !socketObj.sock) {
    return res
      .status(400)
      .json({ error: "WhatsApp session not found for this account." });
  }

  try {
    const groupsMetadata = await socketObj.sock.groupFetchAllParticipating();
    const groups = Object.values(groupsMetadata).map((group) => ({
      id: group.id,
      name: group.subject,
      size: group.size,
    }));

    res.json({ groups });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ error: "Failed to fetch groups." });
  }
});

// Get participants from a specific group
app.get("/groups/:account/:jid/participants", async (req, res) => {
  const { account, jid } = req.params;
  const socketObj = sockets[account];

  if (!socketObj || !socketObj.sock) {
    return res
      .status(400)
      .json({ error: "WhatsApp session not found for this account." });
  }

  try {
    const metadata = await socketObj.sock.groupMetadata(jid);
    const participants = metadata.participants.map((p) => ({
      id: p.id,
      isAdmin: p.admin || false,
    }));

    res.json({
      group: metadata.subject,
      participants,
    });
  } catch (error) {
    console.error("Error fetching group participants:", error);
    res.status(500).json({ error: "Failed to fetch participants." });
  }
});

app.post("/clear-auth", async (req, res) => {
  const { folder } = req.body;
  if (!folder) return res.status(400).json({ error: "Folder is required" });

  const folderPath = getRootFolder(folder);

  try {
    // 1. Delete local folder
    await fs.remove(folderPath);

    // 2. Delete all files inside the remote folder in Supabase
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(folder, { limit: 100 });

    if (listError) throw listError;

    if (files.length > 0) {
      const filePaths = files.map((f) => `${folder}/${f.name}`);
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(filePaths);
      if (deleteError) throw deleteError;
    }

    // 3. Remove from local AUTH_DIRS map
    delete AUTH_DIRS[folder];

    // 4. Refresh folder list from Supabase
    await listFoldersOnLoad(BUCKET_NAME);

    res.status(200).json({
      success: true,
      message: `Cleared local and remote data for '${folder}'`,
      authDirs: AUTH_DIRS,
    });
  } catch (err) {
    console.error("Clear error:", err.message);
    res.status(500).json({ error: "Failed to clear folder." });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
