import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import upload from '../middleware/upload.js';
import { protect } from '../middleware/auth.js';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

// Create upload stream helper for Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'prizm' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

// @desc    Upload multiple files/images
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    const urls = [];
    const isCloudinaryConfigured = 
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_CLOUD_NAME !== 'mock_cloud' &&
      !process.env.CLOUDINARY_CLOUD_NAME.startsWith('mock') &&
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_KEY !== 'mock_key' &&
      process.env.CLOUDINARY_API_SECRET && 
      process.env.CLOUDINARY_API_SECRET !== 'mock_secret';

    for (const file of req.files) {
      if (isCloudinaryConfigured) {
        // Upload to Cloudinary
        const secureUrl = await uploadToCloudinary(file.buffer);
        urls.push(secureUrl);
      } else {
        // Fallback: Save to local disk uploads directory
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, file.buffer);
        
        const host = req.get('host');
        const protocol = req.protocol;
        const localUrl = `${protocol}://${host}/uploads/${fileName}`;
        urls.push(localUrl);
      }
    }

    res.json({
      success: true,
      urls
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, error: err.message || 'File upload failed' });
  }
});

export default router;
