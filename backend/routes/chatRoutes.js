const express = require('express');
const router = express.Router();
const Message = require('../models/Message'); // Ensure Message model includes multimedia field
const upload = require('../middleware/upload'); // Middleware for handling file uploads (e.g., Cloudinary)
const authenticateUser = require('../middleware/authMiddleware'); // Authentication middleware to protect routes

/**
 * Endpoint to send a text message.
 * This route allows users to send a simple text message.
 * Expects senderId, receiverId, and content in the request body.
 */
router.post('/send', authenticateUser, async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    // Validate that required fields are present
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create and save the message in the database
    const message = await Message.create({ senderId, receiverId, content });

    // Return the created message as the response
    res.status(201).json(message);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Endpoint to send a multimedia message (with file attachment).
 * This route allows users to send messages that include file attachments (images, documents, etc.).
 * Expects senderId, receiverId, content, and a file.
 */
router.post('/send-with-file', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    // Validate that required fields are present
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // If there's a file, retrieve the file path (stored in Cloudinary or local storage)
    const filePath = req.file ? req.file.path : null;

    // Create and save the multimedia message with the file path
    const message = await Message.create({
      senderId,
      receiverId,
      content,
      multimedia: filePath, // Store file URL in the multimedia field
    });

    // Return the created message and file path as the response
    res.status(201).json({ message, filePath });
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Endpoint to get messages between two users.
 * This route retrieves all messages exchanged between the specified sender and receiver.
 * Expects senderId and receiverId in the route parameters.
 */
router.get('/:senderId/:receiverId', authenticateUser, async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    // Query for messages between the sender and receiver
    const messages = await Message.find({
      $or: [
        { senderId, receiverId }, // Messages where senderId is the sender and receiverId is the receiver
        { senderId: receiverId, receiverId: senderId }, // Messages where senderId is the receiver and receiverId is the sender
      ],
    });

    // Return the messages as the response
    res.status(200).json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
