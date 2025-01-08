const mongoose = require('mongoose');

// Define the schema for the messages in the thread
const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  multimedia: { type: String },  // URL to the multimedia (if any)
  createdAt: { type: Date, default: Date.now },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }  // Optional: Allows a message to be a reply to another message
});

// Define the main thread schema
const threadSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Participants of the thread (User references)
  ],
  subject: { type: String, required: true },  // Subject or title of the thread
  messages: [messageSchema],  // Store messages in the thread
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Creator of the thread
  createdAt: { type: Date, default: Date.now },  // When the thread was created
});

module.exports = mongoose.model('Thread', threadSchema);