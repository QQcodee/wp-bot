require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  },
});

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const PORT = process.env.PORT || 3001;
const AUTH_DIR = "6145288262"; // Directory for storing auth state

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(bodyParser.json());

let sock = null; // Single session instance

// Start a WhatsApp session
const startSock = async () => {
  console.log("Starting WhatsApp session");

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  sock = makeWASocket({ auth: state });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("QR code generated");
      const qrCodeData = await qrcode.toDataURL(qr);
      io.emit("qr", qrCodeData); // Send QR code to WebSocket clients
    }

    if (connection === "open") {
      console.log("WhatsApp session connected");

      io.emit("qrDone", true);
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log(
        "WhatsApp session closed:",
        DisconnectReason[reason] || reason,
      );

      if (reason === DisconnectReason.loggedOut) {
        console.log("Session logged out. Cleaning up...");
        sock = null;
      } else {
        console.log("Reconnecting...");

        await startSock();
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);
  return sock;
};

startSock();

// Connect to the WhatsApp session
app.post("/connect", async (req, res) => {
  if (sock?.user?.id) {
    console.log("Session is already active.", sock.user.id);

    return res
      .status(200)
      .json({ message: "Session is already active.", phone: sock.user.id });
  }

  try {
    await startSock();
    res.status(200).json({ message: "WhatsApp session started." });
  } catch (error) {
    console.error("Error starting WhatsApp session:", error.message);
    res.status(500).json({ error: "Failed to start WhatsApp session." });
  }
});

async function delayWithProgress(duration) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = duration - elapsed;
      currentProgress.remainingWait = remaining > 0 ? remaining : 0;
      io.emit("message-progress", currentProgress);
      if (remaining <= 0) {
        clearInterval(interval);
        // Remove the remainingWait property once done if desired
        delete currentProgress.remainingWait;
        resolve();
      }
      if (cancelSending) {
        clearInterval(interval);
        reject(new Error("Batch sending canceled."));
      }
    }, 1000); // update every second
  });
}

// Send messages to multiple contacts
let cancelSending = false; // Flag to cancel sending

// Endpoint to cancel message sending

// Track current state
let currentProgress = {
  total: 0,
  completed: 0,
  current: null,
  status: "idle", // idle, sending, canceled
  minDelay: 8000,
  maxDelay: 15000,
};

let currentMessage = "";
let contacts = []; // Stores uploaded contacts

// Fetch current sending status
app.get("/status", (req, res) => {
  res.status(200).json({
    progress: currentProgress,
    message: currentMessage,
    contacts: contacts, // Return the uploaded contacts
    status: currentProgress.status, // 'idle', 'sending', 'canceled'
    minDelay: currentProgress.minDelay,
    maxDelay: currentProgress.maxDelay,
  });
});

app.post("/cancel-sending", (req, res) => {
  cancelSending = true;
  contacts = [];
  currentMessage = "";
  currentProgress = {
    total: 0,
    completed: 0,
    current: null,
    status: "canceled", // idle, sending, canceled
    minDelay: 8000,
    maxDelay: 15000,
  };
  res.status(200).json({ success: true, message: "Batch sending canceled." });
});

// Send messages to multiple contacts
app.post("/send-messages", async (req, res) => {
  const {
    contacts: uploadedContacts,
    message,
    image,
    minDelay,
    maxDelay,
  } = req.body;

  if (!uploadedContacts || (!message && !image) || minDelay > maxDelay) {
    return res.status(400).json({ error: "Invalid request parameters." });
  }

  if (!sock) {
    return res.status(404).json({ error: "WhatsApp session is not active." });
  }

  try {
    cancelSending = false; // Reset the cancel flag before starting
    const delays = uploadedContacts.map(
      () => Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay,
    );

    currentMessage = message;
    contacts = uploadedContacts;
    currentProgress = {
      total: uploadedContacts.length,
      completed: 0,
      current: null,
      status: "sending",
      minDelay: minDelay,
      maxDelay: maxDelay,
      batch: 0,
    };

    const BATCH_SIZE = 2; // Number of contacts per batch
    const HOUR_IN_MS = 60 * 10 * 1000; // 1 hour in milliseconds

    // Split contacts into batches
    const contactBatches = [];
    for (let i = 0; i < uploadedContacts.length; i += BATCH_SIZE) {
      contactBatches.push(uploadedContacts.slice(i, i + BATCH_SIZE));
    }

    for (const [batchIndex, batch] of contactBatches.entries()) {
      if (cancelSending) {
        currentProgress.status = "canceled";
        io.emit("message-progress", currentProgress);
        return res.status(200).json({
          success: true,
          message: "Batch sending canceled.",
          progress: currentProgress,
        });
      }

      for (const [index, contact] of batch.entries()) {
        if (cancelSending) {
          currentProgress.status = "canceled";
          io.emit("message-progress", currentProgress);
          return res.status(200).json({
            success: true,
            message: "Batch sending canceled.",
            progress: currentProgress,
          });
        }

        const personalizedMessage = message.replace("{name}", contact.name);
        const jid = `${contact.phone}@s.whatsapp.net`;

        try {
          const payload = {};
          if (image) {
            const imageUrl = image.replace("{name}", contact.name);
            payload.image = { url: imageUrl };
            if (personalizedMessage) {
              payload.caption = personalizedMessage;
            }
          } else {
            payload.text = personalizedMessage;
          }

          await sock.sendMessage(jid, payload);

          currentProgress.completed++;
          currentProgress.current = contact.phone;
          currentProgress.batch = batchIndex + 1;
          io.emit("message-progress", currentProgress);
        } catch (error) {
          console.error(`Error sending message to ${contact.phone}:`, error);
          io.emit("message-progress", {
            ...currentProgress,
            error: true,
            current: contact.phone,
          });
        }

        // Delay between messages
        await new Promise((resolve) => setTimeout(resolve, delays[index]));
      }

      // Delay between batches, updating the remaining wait time in progress
      if (batchIndex < contactBatches.length - 1) {
        await delayWithProgress(HOUR_IN_MS);
      }
    }

    currentProgress = {
      total: 0,
      completed: 0,
      current: null,
      status: "idle",
      minDelay: 5000,
      maxDelay: 6000,
    };
    contacts = []; // Clear the uploaded contacts after sending
    currentMessage = "";

    res.status(200).json({ success: true, message: "All messages sent." });
  } catch (error) {
    console.error("Error in sending messages:", error);
    res.status(500).json({ error: "Failed to send messages." });
  }
});

// Reset the session
app.post("/reset", async (req, res) => {
  if (sock) {
    sock = null;
  }

  require("fs").rmSync(AUTH_DIR, { recursive: true, force: true });
  console.log("WhatsApp session reset. Restarting...");

  try {
    await startSock();
    res.status(200).json({ message: "WhatsApp session reset and restarted." });
  } catch (error) {
    console.error("Error resetting WhatsApp session:", error.message);
    res.status(500).json({ error: "Failed to reset WhatsApp session." });
  }
});

app.post("/fetch-chats", async (req, res) => {
  const { jid, count } = req.body; // JID of the contact/group, count of messages to fetch

  if (!jid) {
    return res.status(400).json({ error: "JID is required to fetch chats." });
  }

  if (!sock) {
    return res.status(404).json({ error: "WhatsApp session is not active." });
  }

  try {
    // Fetch messages using the Baileys message store
    const messages = await sock.fetchMessagesFromWA(jid, count || 20, null);
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Failed to fetch chats." });
  }
});

// WebSocket connection
io.on("connection", (socket) => {
  console.log("Client connected to WebSocket");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
