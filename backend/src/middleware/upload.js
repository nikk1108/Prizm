import multer from 'multer';
import path from 'path';
import ErrorResponse from '../utils/errorResponse.js';

// Setup memory storage to easily stream to Cloudinary or save locally
const storage = multer.memoryStorage();

// File checks
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.pdf', '.webp', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new ErrorResponse('Unsupported file type. Only PNG, JPG, JPEG, PDF, WEBP, and GIF files are allowed', 400), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max size
  },
  fileFilter
});

export default upload;
