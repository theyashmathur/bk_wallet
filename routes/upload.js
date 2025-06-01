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
  endpoint: process.env.DO_SPACES_ENDPOINT,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
});

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload-image', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const fileExt = mime.extension(req.file.mimetype);
  const filename = `uploads/${uuidv4()}.${fileExt}`;

  const params = {
    Bucket: process.env.DO_SPACES_BUCKET,
    Key: filename,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    ACL: 'public-read',
  };

  try {
    await s3.send(new PutObjectCommand(params));

    // ✅ Correct public URL
    const fileUrl = `https://${process.env.DO_SPACES_BUCKET}.blr1.digitaloceanspaces.com/${filename}`;
    res.json({ message: 'Upload successful', url: fileUrl });
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

module.exports = router;
