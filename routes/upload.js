const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');
require('dotenv').config();

const router = express.Router();

// ✅ Correct endpoint
const s3 = new S3Client({
  region: "blr1",
  endpoint: "https://blr1.digitaloceanspaces.com",
  credentials: {
    accessKeyId: "DO80187G68RA9M8W6EVX",
    secretAccessKey: "pkQp79k7YBnzdS6m+Em3AKV7w1g8uPbuF4kC1Qk7wIA"
  },
});

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload-image', upload.single('image'), async (req, res) => {
 
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const fileExt = mime.extension(req.file.mimetype);
    const uniqueFileName = `${uuidv4()}.${fileExt}`;
    const s3Key = `uploads/${uniqueFileName}`;

    const params = {
      Bucket: "globalwalletspacedev",
      Key: s3Key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read',
    };

    await s3.send(new PutObjectCommand(params));

    const fileUrl = `https://globalwalletspacedev.blr1.digitaloceanspaces.com/${s3Key}`;
    res.json({ message: 'Upload successful', url: fileUrl });
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

module.exports = router;
