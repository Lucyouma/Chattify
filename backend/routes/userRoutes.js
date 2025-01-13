const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/userController'); // Import the controller
const authenticate = require('../middleware/authMiddleware'); // Middleware to verify authentication

/**
 * @route GET /users
 * @description Fetch all users except the logged-in user
 * @access Private (Authenticated users only)
 */
router.get('/users', authenticate, getAllUsers); // Protect the route with authentication middleware

module.exports = router;
