import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom for redirection

const Navbar = () => {
  const navigate = useNavigate(); // Hook to navigate to different routes

  // Handle logout function
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove JWT token from localStorage
    alert('You have been logged out!');
    navigate('/login'); // Redirect to login page
  };

  return (
    <nav>
      <h2>Chattify</h2>
      {/* Other nav items */}
      <button onClick={handleLogout}>Logout</button> {/* Logout button */}
    </nav>
  );
};

export default Navbar;
