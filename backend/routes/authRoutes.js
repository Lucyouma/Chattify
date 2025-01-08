const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const authenticate = require('../middleware/authMiddleware'); // Import verifyToken middleware

// Debugging to check if authenticate is undefined
console.log('Authenticate middleware:', authenticate); // Debugging line

const router = express.Router();

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION || '1h', // Default to 1 hour
  });
};

// Helper function to generate Refresh Token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d', // Default to 7 days
  });
};

// Store refresh tokens in memory (use a database in production)
const refreshTokens = [];

// Register route
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    console.log('Registration attempt:', { email });

    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create and save the new user (No need to manually hash the password anymore)
    const user = new User({
      email: email.trim().toLowerCase(), // Normalize email by trimming and converting
      password: password, // Pass plain password (it will be hashed automatically in the model)
    });

    await user.save(); // Password will be hashed automatically due to the pre-save hook

    console.log('User registered successfully:', { email });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    console.log('Login attempt:', { email });

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Invalid credentials - User not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate the password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password validation result:', isMatch);

    if (!isMatch) {
      console.log('Invalid credentials - Password mismatch');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token and refresh token
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    refreshTokens.push(refreshToken);

    console.log('Login successful:', { email });
    res.json({ token, refreshToken });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refresh token route
router.post('/refresh-token', (req, res) => {
  const { refreshToken } = req.body;

  // Check if the refresh token is valid
  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }

  // Verify the refresh token
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // Generate a new access token
    const newToken = generateToken(user.id);
    res.status(200).json({ token: newToken });
  });
});

// Fetch authenticated user route
router.get('/user', authenticate, async (req, res) => {
  try {
    // req.user is set by verifyToken middleware
    const user = await User.findById(req.user.id).select('-password'); // Exclude password field from the response
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user); // Send the user data
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
