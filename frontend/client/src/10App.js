import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import Chat from './components/Chat';

// Landing Page Component
const LandingPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem('isAuthenticated')) {
      navigate('/chat');
    }
  }, [navigate]);

  const handleLoginSuccess = () => {
    sessionStorage.setItem('isAuthenticated', 'true');
    navigate('/chat');
    setShowLogin(false);
  };

  const handleRegistrationSuccess = () => {
    setShowLogin(true);
  };

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-4xl mx-auto text-center mb-12'>
          <h1 className='text-6xl font-bold mb-4'>Chattify</h1>
          <h2 className='text-3xl'>
            Your One-Stop Solution For Seamless Communication
          </h2>
        </div>

        <div className='max-w-md mx-auto bg-gray-800 p-8 rounded-lg shadow-xl'>
          {showLogin ? (
            <LoginForm onLoginSuccess={handleLoginSuccess} />
          ) : (
            <RegisterForm onRegistrationSuccess={handleRegistrationSuccess} />
          )}

          <div className='mt-4 text-center'>
            <button
              onClick={() => setShowLogin(!showLogin)}
              className='text-blue-400 hover:text-blue-300 hover:underline'
            >
              {showLogin
                ? 'Need an account? Register'
                : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to='/' />;
};

// App Component
const App = () => {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path='/' element={<LandingPage />} />

        {/* Chat Page */}
        <Route
          path='/chat'
          element={
            <ProtectedRoute>
              <div className='min-h-screen bg-gray-900 text-white'>
                <Chat />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Redirect all other routes to Landing Page */}
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </Router>
  );
};

// export default App;
