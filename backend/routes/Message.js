const express = require('express');
const Message = require('../models/Message'); // Import the Message model
const router = express.Router();

// Route to send a message
router.post('/send', async (req, res) => {
  const { senderId, receiverId, content } = req.body;

  // Validate input
  if (!senderId || !receiverId || !content) {
    return res.status(400).json({ message: 'Sender, receiver, and content are required' });
  }

  try {
    // Create a new message
    const newMessage = new Message({
      senderId,
      receiverId,
      content,
    });

    // Save the message to the database
    await newMessage.save();
    res.status(201).json({ message: 'Message sent successfully', newMessage });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
});

// Route to get all messages between two users
router.get('/conversation/:user1Id/:user2Id', async (req, res) => {
  const { user1Id, user2Id } = req.params;

  try {
    // Fetch messages between the two users
    const messages = await Message.find({
      $or: [
        { senderId: user1Id, receiverId: user2Id },
        { senderId: user2Id, receiverId: user1Id },
      ],
    }).sort({ createdAt: 1 }); // Sort messages by creation time in ascending order

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve messages', error: err.message });
  }
});

// Optional: Route to get a specific message by ID
router.get('/:messageId', async (req, res) => {
  const { messageId } = req.params;

  try {
    // Fetch message by ID
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.status(200).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve message', error: err.message });
  }
});

// Optional: Route to delete a message by ID
router.delete('/:messageId', async (req, res) => {
  const { messageId } = req.params;

  try {
    // Delete the message
    const message = await Message.findByIdAndDelete(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete message', error: err.message });
  }
});

module.exports = router;
