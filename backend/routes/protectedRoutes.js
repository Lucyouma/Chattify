const express = require('express');
const authenticate = require('../middleware/authMiddleware'); // Import authenticate middleware
console.log(authenticate); // Log the middleware to ensure it's properly imported
const router = express.Router(); // Create router instance

// Define protected route
router.get('/profile', authenticate, (req, res) => {
  res.json({ message: 'Welcome to your profile!', user: req.user });
});

// Export router
module.exports = router;
