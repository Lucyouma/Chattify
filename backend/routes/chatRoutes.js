const express = require('express');
const router = express.Router();
const Message = require('../models/Message'); // Importing the Message model to interact with the database
const upload = require('../middleware/upload'); // Middleware for handling file uploads (e.g., Cloudinary)
const authenticateUser = require('../middleware/authMiddleware'); // Authentication middleware to protect routes

/**
 * POST endpoint to send a simple text message.
 * 
 * This route allows users to send a text message to a recipient. 
 * The request must include senderId, receiverId, and content in the body. 
 * If any of these fields are missing, a 400 error is returned.
 * 
 * @param {string} senderId - The ID of the user sending the message.
 * @param {string} receiverId - The ID of the user receiving the message.
 * @param {string} content - The content of the text message.
 * @returns {object} - Returns the created message object or an error.
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
    console.error('Error sending message:', err); // Log the error for debugging
    res.status(500).json({ error: err.message }); // Return server error with error message
  }
});

/**
 * POST endpoint to send a multimedia message with a file attachment (image, document, etc.).
 * 
 * This route allows users to send a message with an optional file attachment (such as an image or document). 
 * It expects senderId, receiverId, content, and a file in the request. 
 * The file is uploaded using the 'upload' middleware and stored (e.g., in Cloudinary or locally).
 * 
 * @param {string} senderId - The ID of the user sending the message.
 * @param {string} receiverId - The ID of the user receiving the message.
 * @param {string} content - The content of the text message.
 * @param {File} file - The multimedia file attached to the message.
 * @returns {object} - Returns the created message object and file path or an error.
 */
router.post('/send-with-file', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    // Validate that required fields are present
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // If a file is provided, retrieve the file path (could be a URL from Cloudinary or a local path)
    const filePath = req.file ? req.file.path : null;

    // Create and save the multimedia message with the file path (multimedia URL) if available
    const message = await Message.create({
      senderId,
      receiverId,
      content,
      multimedia: filePath, // Store file URL in the multimedia field (this could be a Cloudinary URL)
    });

    // Return the created message and file path in the response
    res.status(201).json({ message, filePath });
  } catch (err) {
    console.error('Error uploading file:', err); // Log the error for debugging
    res.status(500).json({ error: err.message }); // Return server error with error message
  }
});

/**
 * GET endpoint to fetch all messages between two users.
 * 
 * This route retrieves all messages exchanged between the sender and receiver specified by the route parameters.
 * It returns messages regardless of who is the sender or receiver.
 * 
 * @param {string} senderId - The ID of the user sending the messages.
 * @param {string} receiverId - The ID of the user receiving the messages.
 * @returns {array} - An array of messages exchanged between the two users.
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
    console.error('Error fetching messages:', err); // Log the error for debugging
    res.status(500).json({ error: err.message }); // Return server error with error message
  }
});

module.exports = router;