const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  message: String,
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
  thread: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread' },
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
