const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

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

    // Create and save the new user
    const user = new User({
      email: email.trim().toLowerCase(), // Normalize email by trimming and converting to lowercase
      password: password.trim(), // Trim any extra spaces around the password
    });

    // Save the user (the password will be automatically hashed by the pre('save') hook)
    await user.save();

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
    const isMatch = await user.matchPassword(password);
    console.log('Password validation result:', isMatch);

    if (!isMatch) {
      console.log('Invalid credentials - Password mismatch');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log('Login successful:', { email });
    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
