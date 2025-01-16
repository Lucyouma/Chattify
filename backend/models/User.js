const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define user schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Prevent duplicate email addresses
    trim: true, // Remove leading/trailing spaces
    lowercase: true, // Convert email to lowercase for consistency
  },
  password: {
    type: String,
    required: true,
    trim: true, // Remove leading/trailing spaces
  },
  bio: {
    type: String,
    default: '', // Optional bio field with a default value
  },
  profilePicture: {
    type: String,
    default: '', // Optional profile picture field with a default value
  },
  contact: {
    type: String,
    required: false, // Ensures contact info is always provided
    unique: true, // Optional: make contact information unique (if necessary)
    trim: true, // Removes extra spaces
  },
});

// Hash password before saving to database
userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next();
    console.log('Hashing password for:', this.email);
    this.password = await bcrypt.hash(this.password, 10);
    console.log('Hashed password:', this.password);
    next();
  } catch (err) {
    console.error('Error hashing password:', err);
    next(err);
  }
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (password) {
  try {
    console.log('Comparing passwords for:', this.email);
    const isMatch = await bcrypt.compare(password, this.password);
    console.log('Password comparison result:', isMatch);
    return isMatch;
  } catch (err) {
    console.error('Error comparing password:', err);
    throw err;
  }
};

module.exports = mongoose.model('User', userSchema);
