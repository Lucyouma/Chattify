import React, { useState } from 'react';
import { registerUser } from '../utils/api'; // RegisterUser is correctly implemented in util

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // To track if the form is submitting

  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent form submission from refreshing the page
    setMessage(''); // Clear previous messages
    setLoading(true); // Set loading to true to show loading state

    console.log('Registration attempt started'); // Debugging log to confirm function is triggered

    try {
      const data = await registerUser({ email, password });

      console.log('Response from registerUser:', data); // Log response from the API

      if (data && typeof data.message === 'string') {
        setMessage(data.message); // Set success or error message from API response
      } else {
        setMessage(
          'Registration successful! Please check your email to confirm.',
        ); // Success message
      }
    } catch (error) {
      console.error('Registration error:', error); // Log error for debugging

      // Check for error response from the API
      if (error.response && error.response.data) {
        setMessage(
          error.response.data.message ||
            'Registration failed! Please try again.',
        );
      } else {
        setMessage('An unexpected error occurred. Please try again later.'); // General error message
      }
    } finally {
      setLoading(false); // Reset loading state after request
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div className='input-group'>
          <input
            type='email'
            placeholder='Email'
            aria-label='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state on input change
            required
            className='input-field'
          />
        </div>

        {/* <div className='input-group'>
          <PhoneInput
            placeholder='Enter Phone number'
            // onChange={(e) => setContact(e.target.value)} // Update phone contact on input change
            // onChange={setContact}
            value={contact}
            onChange={(value) => setContact(value || null)}
            required
            className='input-field'
          />
        </div> */}

        <div className='input-group'>
          <input
            type='password'
            placeholder='Password'
            aria-label='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state on input change
            required
            className='input-field'
          />
        </div>
        <button type='submit' className='submit-btn' disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {message && <p className='message'>{message}</p>}
      {/* Show success/error message */}
    </div>
  );
};

export default RegisterForm;
