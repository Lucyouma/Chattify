// backend/controllers/userController.js

const User = require('../models/User'); // Import the User model

// Controller function to fetch all users except the logged-in user
exports.getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id; // The logged-in user ID (from the JWT token)

    // Fetch all users except the logged-in user
    const users = await User.find({ _id: { $ne: currentUserId } }); // Exclude the logged-in user

    res.status(200).json(users); // Send the list of users to the frontend
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};
