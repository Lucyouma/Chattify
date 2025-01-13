// backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/userController'); // Import the getAllUsers controller

// Route to fetch all users
router.get('/users', getAllUsers);

module.exports = router;
