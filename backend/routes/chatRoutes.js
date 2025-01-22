const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat'); // Import the correct Chat model
const upload = require('../middleware/upload'); // Middleware for handling file uploads (e.g., Cloudinary)
const authenticateUser = require('../middleware/authMiddleware'); // Authentication middleware to protect routes

/**
 * POST endpoint to send a simple text message.
 * This route creates and saves a new chat message in the database.
 * It requires the sender's ID, receiver's ID, and the message content.
 */
router.post('/send', authenticateUser, async (req, res) => {
  try {
    const { senderId, receiverId, message, threadId, multimedia } = req.body;

    // Validate that required fields are present
    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const messageData = {
      sender: senderId,
      receiver: receiverId,
      message,
      thread: threadId,
      multimedia,  // Optional field for multimedia
    };

    // Use the createMessage method to create a new chat message
    const newMessage = await Chat.createMessage(messageData);

    // Send back the created message
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    // Return a proper error response
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

/**
 * POST endpoint to send a multimedia message with a file attachment.
 * This route creates and saves a chat message with an optional file upload.
 * It uses the `upload.single('file')` middleware to handle file uploads.
 * The file could be a URL from Cloudinary or a local file path.
 */
router.post('/send-with-file', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    const { senderId, receiverId, message, threadId } = req.body;

    // Validate that required fields are present
    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // If a file is provided, retrieve the file path (could be a URL from Cloudinary or a local path)
    const filePath = req.file ? req.file.path : null;

    // Create and save the multimedia chat message with the file path (multimedia URL) if available
    const messageData = {
      sender: senderId,
      receiver: receiverId,
      message,
      thread: threadId,
      multimedia: filePath,  // Store file URL in the multimedia field (this could be a Cloudinary URL)
    };

    const chatMessage = await Chat.createMessage(messageData);

    // Return the created message and file path in the response
    res.status(201).json({ chatMessage, filePath });
  } catch (error) {
    console.error('Error uploading file:', error); // Log the error for debugging
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

/**
 * GET endpoint to fetch all messages between two users.
 * This route retrieves messages where the current user is either the sender or the receiver,
 * and the other user is the respective counterpart.
 * It uses the `senderId` and `receiverId` from the URL parameters to filter the messages.
 */
router.get('/:senderId/:receiverId', authenticateUser, async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    // Query for messages between the sender and receiver
    const messages = await Chat.find({
      $or: [
        { sender: senderId, receiver: receiverId }, // Messages where the current user is the sender
        { sender: receiverId, receiver: senderId }, // Messages where the current user is the receiver
      ],
    })
      .sort({ timestamp: 1 }); // Optionally, you can sort the messages by timestamp to show the conversation in order

    // Return the messages as the response
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error); // Log the error for debugging
    res.status(500).json({ error: error.message || 'Internal Server Error' }); // Return server error with error message
  }
});

module.exports = router;