import React, { useState } from 'react';
import { registerUser } from '../utils/api';
// import 'react-phone-number-input/style.css';
// import PhoneInput from 'react-phone-number-input';

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    console.log('Registration attempt started');

    try {
      const data = await registerUser({ email, password, contact });

      console.log('Response from registerUser:', data);

      if (data && data.message) {
        setMessage(data.message);
      } else {
        setMessage(
          'Registration successful! Please check your email to confirm.',
        );
      }
    } catch (error) {
      console.error('Registration error:', error);

      if (error.response && error.response.data) {
        setMessage(
          error.response.data.message ||
            'Registration failed! Please try again.',
        );
      } else {
        setMessage('An unexpected error occurred. Please try again later.');
      }
    }

    setLoading(false);
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
            onChange={(e) => setEmail(e.target.value)}
            required
            className='input-field'
          />
        </div>
        <div className='input-group'>
          <PhoneInput
            placeholder='Enter phone number'
            value={contact}
            onChange={(value) => setContact(value)}
            required
            className='input-field'
          />
        </div>
        <div className='input-group'>
          <input
            type='password'
            placeholder='Password'
            aria-label='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className='input-field'
          />
        </div>
        <button type='submit' className='submit-btn' disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {message && <p className='message'>{message}</p>}
    </div>
  );
};

// export default RegisterForm;
