import React from 'react';

/**
 * UserSelectionContainer Component
 *
 * This component displays a list of available users and allows selecting a user for initiating a chat.
 * It includes search functionality to filter users by their email or ID.
 *
 * Props:
 * - users: Array of user objects (default: []). Each user object must contain `_id` and `email` fields.
 * - searchTerm: String used to filter users by email or ID.
 * - setSearchTerm: Function to update the search term.
 * - handleUserClick: Function to handle the selection of a user by their unique `_id`.
 * - activeUserId: The `_id` of the currently active/selected user.
 */
const UserSelectionContainer = ({
  users = [], // Default to an empty array if no users are provided
  searchTerm = '',
  setSearchTerm,
  handleUserClick, // Function to handle user selection
  activeUserId, // Currently selected user highlight ID
}) => {
  // Ensure `users` is always a valid array
  const safeUsers = Array.isArray(users) ? users : [];

  // Filter users by the search term
  const filteredUsers = safeUsers.filter(
    (user) =>
      user?._id.includes(searchTerm) ||
      user?.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className='w-1/4 bg-white border-r border-gray-200 p-4'>
      {/* Search input */}
      <div className='mb-4'>
        <h2 className='text-xl font-semibold mb-3'>Available Users</h2>
        <input
          type='text'
          placeholder='Search by email or ID...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
      </div>

      {/* User list */}
      <div className='overflow-y-auto max-h-[calc(100vh-200px)]'>
        {filteredUsers.length === 0 ? (
          <p className='text-gray-500 text-center'>No users found</p>
        ) : (
          <ul className='space-y-2'>
            {filteredUsers.map((user) => (
              <li
                key={user?._id} // MongoDB's unique `_id` as key
                onClick={() => handleUserClick(user?._id)} // Pass `_id` to the click handler
                className={`p-3 rounded-lg cursor-pointer transition-colors duration-150 ${
                  activeUserId === user?._id
                    ? 'bg-blue-100 border-blue-500' // Highlight if this user is active
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className='flex flex-col'>
                  <h3 className='font-medium text-gray-900'>
                    User ID: {user?._id} {/* Display MongoDB `_id` */}
                  </h3>
                  <p className='text-sm text-gray-500'>
                    Email: {user?.email || 'No email provided'}{' '}
                    {/* Display user's email */}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserSelectionContainer;
