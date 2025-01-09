import React from 'react';

const UserSelectionContainer = ({
  users = [], // Provide default empty array
  searchTerm = '',
  setSearchTerm,
  handleUserClick,
  activeUserId,
}) => {
  // Guard against undefined users
  const safeUsers = Array.isArray(users) ? users : [];

  return (
    <div className='w-1/4 bg-white border-r border-gray-200 p-4'>
      <div className='mb-4'>
        <h2 className='text-xl font-semibold mb-3'>Available Users</h2>
        <input
          type='text'
          placeholder='Search users...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
      </div>

      <div className='overflow-y-auto max-h-[calc(100vh-200px)]'>
        {safeUsers.length === 0 ? (
          <p className='text-gray-500 text-center'>No users found</p>
        ) : (
          <ul className='space-y-2'>
            {safeUsers.map((user) => (
              <li
                key={user?.id || Math.random()} // Fallback key if id is undefined
                onClick={() => handleUserClick(user?.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors duration-150 ${
                  activeUserId === user?.id
                    ? 'bg-blue-100 border-blue-500'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center'>
                    <span className='text-white font-semibold'>
                      {(user?.name || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className='font-medium text-gray-900'>
                      {user?.name || 'Unknown User'}
                    </h3>
                    <p className='text-sm text-gray-500'>
                      {user?.email || 'No user email provided'}
                    </p>
                  </div>
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
