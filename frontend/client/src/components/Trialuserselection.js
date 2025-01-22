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
    <div className='col-md-6 col-lg-5 col-xl-4 mb-4 mb-md-0'>
      <div className='p-3'>
        {/* Search Bar */}
        <div className='input-group rounded mb-3'>
          <input
            type='search'
            className='form-control rounded'
            placeholder='Search by email or ID...'
            aria-label='Search'
            aria-describedby='search-addon'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className='input-group-text border-0' id='search-addon'>
            <i className='fas fa-search'></i>
          </span>
        </div>

        {/* User List */}
        <div
          style={{ position: 'relative', height: '400px', overflowY: 'auto' }}
        >
          {filteredUsers.length === 0 ? (
            <p className='text-muted text-center'>No users found</p>
          ) : (
            <ul className='list-unstyled mb-0'>
              {filteredUsers.map((user) => (
                <li
                  key={user?._id}
                  className={`p-2 border-bottom ${
                    activeUserId === user?._id ? 'bg-light' : ''
                  }`}
                  onClick={() => handleUserClick(user?._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <a
                    href='#!'
                    className='d-flex justify-content-between align-items-center'
                  >
                    <div className='d-flex flex-row'>
                      <div className='pt-1'>
                        <p className='fw-bold mb-0'>User ID: {user?._id}</p>
                        <p className='small text-muted'>
                          Email: {user?.email || 'No email provided'}
                        </p>
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSelectionContainer;
