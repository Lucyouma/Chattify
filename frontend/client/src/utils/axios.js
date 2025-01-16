// src/utils/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api', // My backend API URL
});

// Helper function to fetch user details
export const fetchUsers = async (token) => {
  try {
    const response = await instance.get('/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Return the user data fetched from the server
  } catch (err) {
    console.error('Error fetching user details:', err.message);
    throw err; // Propagate the error for handling in the caller
  }
};

export default instance;