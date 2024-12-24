const express = require('express');
const router = express.Router();
const Message = require('../models/Message'); // Ensure Message model is updated for multimedia support
const upload = require('../middleware/upload'); // Middleware for Cloudinary uploads

// Endpoint to send a text message
router.post('/send', async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    const message = await Message.create({ senderId, receiverId, content });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to send a multimedia message
router.post('/send-with-file', upload.single('file'), async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    const filePath = req.file ? req.file.path : null; // Get the Cloudinary file URL

    const message = await Message.create({
      senderId,
      receiverId,
      content,
      multimedia: filePath, // Add multimedia URL
    });

    res.status(201).json({ message, filePath });
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get messages between two users
router.get('/:senderId/:receiverId', async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
