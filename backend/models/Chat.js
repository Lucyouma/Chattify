const mongoose = require('mongoose');

// Define the schema for the chat message
const chatSchema = new mongoose.Schema({
  message: { type: String, required: true },  // The message content
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to the sender (User model)
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to the receiver (User model)
  timestamp: { type: Date, default: Date.now },  // Timestamp for when the message was sent
  thread: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread' },  // Reference to the thread (Thread model)
  multimedia: { type: String },  // Store multimedia URL or path (e.g., for images or files)
});

// Create the Chat model using the schema
const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
