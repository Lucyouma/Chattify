import React, { useState } from 'react';
import { loginUser } from '../utils/api'; // Import loginUser function from utils
import { useNavigate } from 'react-router-dom'; // Assuming React Router is being used

const LoginForm = () => {
  const [email, setEmail] = useState(''); // Email state
  const [password, setPassword] = useState(''); // Password state
  const [message, setMessage] = useState(''); // Message state (for displaying errors/success)
  const [loading, setLoading] = useState(false); // Loading state for form submission
  const navigate = useNavigate(); // To handle redirection after login

  // handleLogin function to send login request
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form submission from reloading the page
    setMessage(''); // Clear previous messages
    setLoading(true); // Show loading spinner or indicator
    console.log('Login attempt started'); // Debugging message to confirm login attempt

    try {
      // Sending login request with email and password
      console.log('Sending login request with:', { email, password }); // Debugging user data
      const data = await loginUser({ email, password }); // Awaiting the loginUser function

      console.log('Response from loginUser:', data); // Debugging response from the server

      // If login is successful (i.e., we get a token)
      if (data && data.token) {
        // Save the JWT to localStorage if login is successful
        console.log('Saving token to localStorage:', data.token);
        localStorage.setItem('token', data.token); // Save token in localStorage

        setMessage('Login successful!'); // Set success message

        // Redirect to the chat page after successful login
        navigate('/chat');
      } else {
        // If login fails (no token returned)
        setMessage('Invalid credentials, please try again.');
      }
    } catch (error) {
      // Handle error if login fails
      console.error('Login error:', error); // Log the error to the console

      // Handling error messages
      if (error.response) {
        // Check if error response exists and show message
        setMessage(error.response.data.message || 'Login failed! Please check your credentials.');
      } else {
        setMessage('Login failed! Please check your credentials.'); // General error message
      }
    }

    setLoading(false); // Set loading to false after the request is done
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
        <button type="submit" className="submit-btn" disabled={loading}>Login</button>
      </form>
      {loading && <p>Loading...</p>} {/* Show loading message */}
      {message && <p className="message">{message}</p>} {/* Display message if there's a success/error */}
    </div>
  );
};

export default LoginForm;
