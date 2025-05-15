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
const fs = require("fs-extra");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  },
});

app.use(cors());
app.use(bodyParser.json());

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL_BOT;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY_BOT;
const supabase = createClient(supabaseUrl, supabaseKey);

const PORT = process.env.PORT || 3001;
const BUCKET_NAME = "whatsapp-sessions";

const AUTH_DIRS = {}; // Tracks available auth dirs dynamically
let sock = null;

function getRootFolder(folder) {
  return path.join(process.cwd(), folder);
}

async function startSock(authFolder) {
  const { state, saveCreds } = await useMultiFileAuthState(authFolder);
  sock = makeWASocket({ auth: state });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      const qrCodeData = await qrcode.toDataURL(qr);
      io.emit("qr", qrCodeData);
    }

    if (connection === "open") {
      console.log("Connected to WhatsApp.");
      io.emit("qrDone", true);
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log("Session closed:", DisconnectReason[reason] || reason);

      if (reason === DisconnectReason.loggedOut) {
        sock = null;
      } else {
        await startSock(authFolder);
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);
  return sock;
}

// Create a new auth session
app.post("/connect", async (req, res) => {
  const { folder } = req.body;
  if (!folder) return res.status(400).json({ error: "Folder is required" });

  const authPath = getRootFolder(folder);

  try {
    await fs.ensureDir(authPath);
    await startSock(authPath);
    res.status(200).json({ message: `Session started using ${folder}` });
  } catch (error) {
    console.error("Connection error:", error.message);
    res.status(500).json({ error: "Failed to start session." });
  }
});

app.post("/create-auth", async (req, res) => {
  const { folder } = req.body;
  if (!folder)
    return res.status(400).json({ error: "Folder name is required" });

  const authPath = getRootFolder(folder);

  try {
    // Ensure the folder exists (creates it if it doesn't)
    await fs.ensureDir(authPath);

    // Start the socket with that folder
    await startSock(authPath);

    // Optionally track it in AUTH_DIRS
    AUTH_DIRS[folder] = folder;

    return res
      .status(200)
      .json({ message: `Started auth session for ${folder}` });
  } catch (error) {
    console.error("Auth session start error:", error.message);
    return res.status(500).json({ error: "Failed to start auth session" });
  }
});
// Reset a specific auth session
app.post("/reset", async (req, res) => {
  const { folder } = req.body;
  if (!folder) return res.status(400).json({ error: "Folder is required" });

  const authPath = getRootFolder(folder);

  try {
    sock = null;
    await fs.remove(authPath);
    await fs.ensureDir(authPath);
    await startSock(authPath);
    res.status(200).json({ message: `Session reset for ${folder}` });
  } catch (err) {
    console.error("Reset error:", err.message);
    res.status(500).json({ error: "Failed to reset session." });
  }
});

// Delete an existing auth_dir
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

// Download folder from Supabase
async function downloadFolder(bucketName, folderPath) {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath, { limit: 100 });

    if (error) throw error;
    if (!data || data.length === 0) {
      return { success: false, message: "No files found." };
    }

    const localPath = getRootFolder(folderPath);
    await fs.ensureDir(localPath);

    for (const file of data) {
      const filePath = `${folderPath}/${file.name}`;
      const { data: fileData, error: downloadError } = await supabase.storage
        .from(bucketName)
        .download(filePath);

      if (downloadError) continue;

      const localFilePath = path.join(localPath, file.name);
      await fs.writeFile(
        localFilePath,
        Buffer.from(await fileData.arrayBuffer()),
      );
    }

    return { success: true, message: "Download complete", path: localPath };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

app.post("/download-auth", async (req, res) => {
  const { bucket, folder } = req.body;
  const result = await downloadFolder(bucket, folder);
  res.json(result);
});

// Upload folder to Supabase
async function uploadFolder(bucketName, localFolderPath, remoteFolderPath) {
  try {
    const files = await fs.readdir(localFolderPath);
    if (files.length === 0)
      return { success: false, message: "No local files." };

    for (const file of files) {
      const localFilePath = path.join(localFolderPath, file);
      const remoteFilePath = `${remoteFolderPath}/${file}`;

      const fileBuffer = await fs.readFile(localFilePath);
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(remoteFilePath, fileBuffer, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error(`Upload failed: ${file}`, error.message);
        continue;
      }
    }

    return {
      success: true,
      message: "Upload complete",
      remotePath: remoteFolderPath,
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

app.post("/upload-auth", async (req, res) => {
  const { bucket, localFolder, remoteFolder } = req.body;
  const result = await uploadFolder(bucket, localFolder, remoteFolder);
  res.json(result);
});

// List folders from Supabase
app.post("/list-folders", async (req, res) => {
  const { bucket } = req.body;

  try {
    const { data, error } = await supabase.storage.from(bucket).list("", {
      limit: 100,
      offset: 0,
    });

    if (error) throw error;

    const folders = [...new Set(data.map((file) => file.name.split("/")[0]))];
    folders.forEach((folder) => {
      AUTH_DIRS[folder] = folder;
    });

    res.json({ folders, authDirs: AUTH_DIRS });
  } catch (err) {
    console.error("List folders error:", err.message);
    res.status(500).json({ error: "Failed to list folders" });
  }
});

// Load folders on boot
async function listFoldersOnLoad(bucket) {
  try {
    const { data, error } = await supabase.storage.from(bucket).list("", {
      limit: 100,
      offset: 0,
    });

    if (error) throw error;

    const folders = [...new Set(data.map((file) => file.name.split("/")[0]))];
    folders.forEach((folder) => {
      AUTH_DIRS[folder] = folder;
    });

    console.log("Updated AUTH_DIRS:", AUTH_DIRS);
  } catch (err) {
    console.error("Startup folder load error:", err.message);
  }
}
listFoldersOnLoad(BUCKET_NAME);

// WebSocket
io.on("connection", (socket) => {
  console.log("WebSocket connected");
  socket.on("disconnect", () => console.log("WebSocket disconnected"));
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
