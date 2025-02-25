require("dotenv").config();

const express = require("express");
const http = require("http");
const {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;
const AUTH_DIR = "dr_cristina";
const AUTH_DIR_SECOND_ACCOUNT = "baileys_auth";

app.use(cors());
app.use(bodyParser.json());

let sock = null;

// Start WhatsApp session
const startSock = async () => {
  console.log("Starting WhatsApp session");
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  sock = makeWASocket({ auth: state });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("Scan the QR code below to log in:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("WhatsApp session connected.");
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log(
        "WhatsApp session closed:",
        DisconnectReason[reason] || reason
      );
      if (reason === DisconnectReason.loggedOut) {
        console.log("Session logged out. Restarting...");
        sock = null;
      }
      await startSock();
    }
  });

  sock.ev.on("creds.update", saveCreds);
};

startSock();

// Send message API
app.post("/send-message", async (req, res) => {
  const { phone, message, image } = req.body;
  if (!phone || (!message && !image)) {
    return res.status(400).json({ error: "Invalid request parameters." });
  }

  if (!sock) {
    return res.status(500).json({ error: "WhatsApp session is not active." });
  }

  try {
    const jid = `${phone}@s.whatsapp.net`;
    const payload = image
      ? { image: { url: image }, caption: message }
      : { text: message };
    await sock.sendMessage(jid, payload);
    res
      .status(200)
      .json({ success: true, message: "Message sent successfully." });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
});

// Reset session
app.post("/reset", async (req, res) => {
  if (sock) sock = null;
  require("fs").rmSync(AUTH_DIR, { recursive: true, force: true });
  console.log("WhatsApp session reset. Restarting...");
  await startSock();
  res.status(200).json({ message: "Session reset and restarted." });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
