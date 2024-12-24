const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chattify', // Optional folder name
    resource_type: 'auto', // Automatically detect file type
  },
});

const upload = multer({ storage });

module.exports = upload;
