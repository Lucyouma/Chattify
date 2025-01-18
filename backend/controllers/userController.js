const User = require('../models/User'); // Import the User model to interact with the database

/**
 * Controller to fetch all users except the logged-in user.
 * Only `_id` and `email` are included in the response to minimize data exposure.
 * This endpoint is protected and can only be accessed by authenticated users.
 *
 * @route GET /users
 * @access Private (Authenticated users only)
 *
 * @returns {array} - A list of users excluding the logged-in user, containing only the `_id` and `email`.
 * @throws {401} - If the user is not authenticated or the user ID is missing.
 * @throws {500} - If there is a server error while fetching users.
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Validate that the user is authenticated and the user ID is available
    const currentUserId = req.user?.id; // Extract the user ID from the authentication middleware
    if (!currentUserId) {
      // If no user ID is found, return a 401 Unauthorized error
      return res
        .status(401)
        .json({ message: 'Unauthorized: User ID is missing.' });
    }

    // Fetch all users except the logged-in user
    // The query uses the $ne (not equal) operator to exclude the current user's ID
    // We also project only `_id` and `email` fields to reduce the amount of data returned
    const users = await User.find(
      { _id: { $ne: currentUserId } }, // Exclude the logged-in user's ID
      { _id: 1, email: 1 }, // Return only the `_id` and `email` fields
    );

    // Return the list of users
    res.status(200).json(users);
  } catch (err) {
    // Log the error and return a 500 server error if something goes wrong
    console.error('Error fetching users:', err);
    res
      .status(500)
      .json({ message: 'Failed to fetch users', error: err.message });
  }
};
