// Import required modules
const multer = require('multer'); // Multer is a middleware for handling file uploads
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // CloudinaryStorage to store files on Cloudinary
const cloudinary = require('../utils/cloudinary'); // Import cloudinary configuration from utils

// Configure storage engine for Multer using Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // Reference the Cloudinary configuration to handle uploads
  params: {
    folder: 'chattify', // Optional: Define the Cloudinary folder where the files will be stored
    resource_type: 'auto', // Automatically detect the file type (image, video, etc.)
  },
});

// Initialize Multer with the defined storage configuration
const upload = multer({ storage }); // Multer is set to use CloudinaryStorage

// Export the upload middleware so it can be used in routes
module.exports = upload; 
