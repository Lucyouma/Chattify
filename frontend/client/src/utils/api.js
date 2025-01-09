import axios from 'axios';

// Define the base URL for the API
const API_BASE_URL = 'http://localhost:5000/api';

// Create an Axios instance with the base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to automatically attach the token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Attach token to request headers
    }
    return config; // Continue with the request
  },
  (error) => {
    return Promise.reject(error); // Handle any request errors
  },
);

// Register user function
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData); // Send POST request for registration
    return response.data; // Return server response (data)
  } catch (error) {
    throw error.response ? error.response.data : error; // Handle error
  }
};
export const getUsers = async () => {
  try {
    const response = await apiClient.get('/auth/users');
    return response.data; // Return server response (data)
  } catch (error) {
    throw error.response ? error.response.data : error; // Handle error
  }
};

// Login user function
export const loginUser = async (userData) => {
  try {
    const response = await apiClient.post('/auth/login', userData); // Send POST request for login
    // Save tokens to localStorage after successful login
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data; // Return server response (data)
  } catch (error) {
    throw error.response ? error.response.data : error; // Handle error
  }
};

// Fetch authenticated user data
export const fetchUserData = async () => {
  try {
    const response = await apiClient.get('/auth/user'); // Send GET request to fetch user data
    return response.data; // Return server response (data)
  } catch (error) {
    throw error.response ? error.response.data : error; // Handle error
  }
};

// Utility function to handle the token refresh (if needed)
export const refreshTokenFunction = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken'); // Get the refresh token from localStorage
    if (!refreshToken) throw new Error('No refresh token available'); // If no refresh token, throw error

    const response = await apiClient.post('/auth/refresh-token', {
      refreshToken, // Send the refresh token to the server
    });

    // Save new token and refresh token to localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data.token; // Return the new token
  } catch (error) {
    console.error('Error refreshing token:', error); // Log any refresh token errors
    throw error; // Throw error to be handled by the calling code
  }
};
