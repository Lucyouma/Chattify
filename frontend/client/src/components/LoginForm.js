import React, { useState } from 'react';
import { loginUser } from '../utils/api'; // Import loginUser function from utils
import { useNavigate } from 'react-router-dom'; // For navigation after login

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState(''); // Email state
  const [password, setPassword] = useState(''); // Password state
  const [message, setMessage] = useState(''); // Message state (for displaying errors/success)
  const [loading, setLoading] = useState(false); // Loading state for form submission
  const navigate = useNavigate(); // To handle redirection after login

  /**
   * Handle the login form submission.
   * @param {Event} e - The form submission event.
   */
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form submission from reloading the page
    setMessage(''); // Clear any previous messages
    setLoading(true); // Show loading spinner or indicator
    console.log('Login attempt started'); // Debugging message to confirm login attempt

    try {
      // Sending login request with email and password
      console.log('Sending login request with:', { email, password }); // Debugging user data
      const data = await loginUser({ email, password }); // Awaiting the loginUser function

      console.log('Response from loginUser:', data); // Debugging response from the server

      // If login is successful (i.e., we get a token)
      if (data && data.token) {
        console.log('Saving token to localStorage:', data.token); // Debugging token saving
        localStorage.setItem('token', data.token); // Save token in localStorage

        sessionStorage.setItem('isAuthenticated', 'true'); // Set authenticated state in sessionStorage
        setMessage('Login successful!'); // Set success message

        // Notify parent component of login success
        if (onLoginSuccess) onLoginSuccess();

        // Redirect to the chat page after successful login
        navigate('/chat');
      } else {
        setMessage('Invalid credentials, please try again.'); // Display error message
      }
    } catch (error) {
      // Handle errors during login
      console.error('Login error:', error); // Log the error for debugging
      if (error.response && error.response.data.message) {
        setMessage(error.response.data.message); // Display server-provided error message
      } else {
        setMessage('Login failed! Please check your credentials.'); // General error message
      }
    }

    setLoading(false); // Stop the loading spinner/indicator
  };

  return (
    <div className="login-form">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state on input change
            required
            className="input-field"
          />
        </div>
        <div className="input-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state on input change
            required
            className="input-field"
          />
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {message && <p className="message">{message}</p>} {/* Display message if there's a success/error */}
    </div>
  );
};

export default LoginForm;
