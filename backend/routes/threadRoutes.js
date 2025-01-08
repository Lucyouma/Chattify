// routes/threadRoutes.js
const express = require('express');
const Thread = require('../models/Thread');
const User = require('../models/User'); // Import User model for validation
const router = express.Router();

// Get thread by participants (Existing route, with additional checks)
router.get('/:userId/:receiverId', async (req, res) => {
  try {
    // Ensure both participants exist in the database
    const userExists = await User.findById(req.params.userId);
    const receiverExists = await User.findById(req.params.receiverId);

    if (!userExists || !receiverExists) {
      return res.status(404).send('One or both users do not exist.');
    }

    const thread = await Thread.findOne({
      participants: { $all: [req.params.userId, req.params.receiverId] }
    });

    if (!thread) {
      return res.status(404).send('Thread not found.');
    }

    res.json(thread);
  } catch (err) {
    console.error('Error fetching thread:', err);
    res.status(500).send('Error fetching thread');
  }
});

// Create a new thread (New route)
router.post('/create', async (req, res) => {
  try {
    const { senderId, receiverId, subject } = req.body;

    // Ensure both participants exist
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).send('One or both users do not exist.');
    }

    // Create a new thread
    const newThread = new Thread({
      participants: [senderId, receiverId],
      subject: subject,
      createdBy: senderId, // Thread created by sender
      messages: [],
    });

    // Save the new thread
    await newThread.save();
    res.status(201).json(newThread);
  } catch (err) {
    console.error('Error creating thread:', err);
    res.status(500).send('Error creating thread');
  }
});

// Send message to a thread (Updated)
router.post('/send', async (req, res) => {
  try {
    const { senderId, receiverId, content, multimedia } = req.body;

    // Validate that both users exist
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).send('One or both users do not exist.');
    }

    // Find existing thread or create a new one
    const thread = await Thread.findOneAndUpdate(
      { participants: { $all: [senderId, receiverId] } },
      { $push: { messages: { senderId, content, multimedia } } },
      { new: true, upsert: true }
    );

    res.json(thread);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).send('Error sending message');
  }
});

// Reply to a specific message in a thread (New route)
router.post('/:threadId/messages/:messageId/reply', async (req, res) => {
  try {
    const { content, multimedia } = req.body;
    const { threadId, messageId } = req.params;

    // Find the thread by ID
    const thread = await Thread.findById(threadId);
    if (!thread) {
      return res.status(404).send('Thread not found.');
    }

    // Find the original message by messageId
    const originalMessage = thread.messages.id(messageId);
    if (!originalMessage) {
      return res.status(404).send('Message not found.');
    }

    // Create the reply message
    const replyMessage = {
      senderId: req.body.senderId, // Assume senderId comes from the request body
      content: content,
      multimedia: multimedia,
      replyTo: messageId, // Reference to the original message
    };

    // Add the reply message to the thread
    thread.messages.push(replyMessage);
    await thread.save();

    res.json(thread);
  } catch (err) {
    console.error('Error replying to message:', err);
    res.status(500).send('Error replying to message');
  }
});

module.exports = router;
