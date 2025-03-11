require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs-extra");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  },
});

app.use(express.json()); // Enable JSON body parsing

// Supabase Setup
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to get absolute folder path in project root
function getRootFolder(folder) {
  return path.join(process.cwd(), folder);
}

// =======================
// 1️⃣ DOWNLOAD FOLDER FROM SUPABASE
// =======================
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
        Buffer.from(await fileData.arrayBuffer())
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

// =======================
// 2️⃣ UPLOAD FOLDER TO SUPABASE
// =======================
async function uploadFolder(bucketName, folderPath) {
  try {
    if (!bucketName || !folderPath) {
      return {
        success: false,
        message: "Bucket name and folder path are required.",
      };
    }

    const LOCAL_FOLDER = getRootFolder(folderPath);
    if (!fs.existsSync(LOCAL_FOLDER)) {
      return { success: false, message: "Local folder does not exist." };
    }

    const files = await fs.readdir(LOCAL_FOLDER);
    if (files.length === 0) {
      return { success: false, message: "No files to upload." };
    }

    for (const file of files) {
      const filePath = path.join(LOCAL_FOLDER, file);
      const fileBuffer = await fs.readFile(filePath);

      const { error } = await supabase.storage
        .from(bucketName)
        .upload(`${folderPath}/${file}`, fileBuffer, {
          upsert: true, // Overwrite if exists
          contentType: "application/octet-stream",
        });

      if (error) console.error(`Error uploading ${file}:`, error);
    }

    return { success: true, message: "Folder uploaded successfully." };
  } catch (err) {
    console.error("Error uploading folder:", err);
    return { success: false, message: err.message };
  }
}

// API Endpoint to upload the folder
app.post("/upload-auth", async (req, res) => {
  const { bucket, folder } = req.body;
  const result = await uploadFolder(bucket, folder);
  res.json(result);
});

// =======================
// 3️⃣ CHECK IF FOLDER EXISTS LOCALLY
// =======================
app.get("/check-auth", (req, res) => {
  const { folder } = req.query;
  if (!folder)
    return res.status(400).json({ error: "Folder path is required" });

  const folderPath = getRootFolder(folder);
  const exists = fs.existsSync(folderPath);
  res.json({ exists, path: folderPath });
});

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
