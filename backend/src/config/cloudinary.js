import { v2 as cloudinary } from 'cloudinary';

const configureCloudinary = () => {
  const isConfigured = 
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_CLOUD_NAME !== 'mock_cloud' &&
    !process.env.CLOUDINARY_CLOUD_NAME.startsWith('mock') &&
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_KEY !== 'mock_key' &&
    process.env.CLOUDINARY_API_SECRET && 
    process.env.CLOUDINARY_API_SECRET !== 'mock_secret';

  if (isConfigured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('[Media Service] Cloudinary successfully configured');
  } else {
    console.warn('[Media Service Warning] Cloudinary credentials missing or set to mock. File uploads will fallback to local path storage');
  }
};

export { cloudinary, configureCloudinary };
