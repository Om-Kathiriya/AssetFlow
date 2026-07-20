import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

let storage;

// Use Cloudinary Storage if API keys exist, else fallback to memory storage
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'assetflow_assets',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif']
    }
  });
} else {
  storage = multer.memoryStorage();
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
});

export const uploadSingleImage = upload.single('image');
