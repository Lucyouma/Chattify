// models/Profile.js

const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  avatar: { type: String, default: 'default-avatar.png' },
  bio: { type: String, default: 'This is my bio' },
});

module.exports = mongoose.model('Profile', profileSchema);
