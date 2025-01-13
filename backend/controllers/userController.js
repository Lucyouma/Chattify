const User = require('../models/User'); // Import the User model

/**
 * Controller to fetch all users except the logged-in user.
 * Only `_id` and `email` are included in the response.
 *
 * @route GET /users
 * @access Private (Authenticated users only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Validate that the user is authenticated and the user ID is available
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized: User ID is missing.' });
    }

    // Fetch all users except the logged-in user
    // Include only `_id` and `email` fields to minimize response size
    const users = await User.find(
      { _id: { $ne: currentUserId } }, // Exclude the logged-in user's ID
      { _id: 1, email: 1 } // Project only `_id` and `email`
    );

    // Return the filtered list of users
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};