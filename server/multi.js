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
const AUTH_DIRS = {
  dr_cristina: "dr_cristina",
  baileys_auth: "baileys_auth",
};

app.use(cors());
app.use(bodyParser.json());

let sockets = {};

// Start WhatsApp sessions for both accounts
const startSock = async (account) => {
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
        console.log(`Session logged out for ${account}. Restarting...`);
        sockets[account] = null;
      }
      await startSock(account);
    }
  });

  sock.ev.on("creds.update", saveCreds);
};

// Start both sessions
Object.keys(AUTH_DIRS).forEach(startSock);

// Send message API
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
    await sockets[account].sendMessage(jid, payload);
    res
      .status(200)
      .json({
        success: true,
        message: `Message sent successfully from ${account}.`,
      });
  } catch (error) {
    console.error(`Error sending message from ${account}:`, error);
    res.status(500).json({ error: `Failed to send message from ${account}.` });
  }
});

// Reset session API
app.post("/reset/:account", async (req, res) => {
  const { account } = req.params;

  if (!AUTH_DIRS[account]) {
    return res.status(400).json({ error: "Invalid account name." });
  }

  if (sockets[account]) sockets[account] = null;
  require("fs").rmSync(AUTH_DIRS[account], { recursive: true, force: true });
  console.log(`WhatsApp session reset for ${account}. Restarting...`);
  await startSock(account);
  res
    .status(200)
    .json({ message: `Session reset and restarted for ${account}.` });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
