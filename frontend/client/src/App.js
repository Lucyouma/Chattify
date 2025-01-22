import React, { useState, useEffect } from 'react'; // React hooks
import { useNavigate } from 'react-router-dom'; // Hook to navigate between pages
import { Routes, Route, Link, Navigate } from 'react-router-dom'; // Import Routes, Route for navigation
import Chat from './components/Chat'; // Import Chat component
import LoginForm from './components/LoginForm'; // Import LoginForm component
import RegisterForm from './components/RegisterForm'; // Import RegisterForm component
import './App.css'; // Import your CSS file
import { Home, Mail, User, Settings, LogOut } from 'lucide-react'; // Import sidebar icons

// Landing Page Component (for login/register)
const LandingPage = () => {
  const [showLogin, setShowLogin] = useState(false); // State to toggle between login and register forms
  const navigate = useNavigate(); // Hook for programmatic navigation

  // Check if the user is already authenticated, if so, redirect to '/chat'
  useEffect(() => {
    if (sessionStorage.getItem('isAuthenticated')) {
      navigate('/chat');
    }
  }, [navigate]);

  const handleLoginSuccess = () => {
    sessionStorage.setItem('isAuthenticated', 'true'); // Store authentication status in session
    navigate('/chat'); // Redirect to the chat page after login
  };

  const handleRegistrationSuccess = () => {
    setShowLogin(true); // After registration, show login form
  };

  // If already authenticated, return null to prevent the landing page from being shown
  if (sessionStorage.getItem('isAuthenticated') === 'true') {
    return null;
  }

  // Render the login or register form
  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center mb-12'>
            <h1>Chattify</h1>
            <h2 className='text-3xl'>
              Welcome to Chattify Your One-Stop Solution For Seamless Communication
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
                onClick={() => setShowLogin(!showLogin)} // Toggle between login and register
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
    </div>
  );
};

// Protected Route Component (only renders children if user is authenticated)
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true'; // Check if user is authenticated

  return isAuthenticated ? children : <Navigate to='/' />; // Redirect to home if not authenticated
};

// Chat Layout Component (Sidebar and chat content)
const ChatLayout = () => {
  const navigate = useNavigate(); // Hook to navigate between pages

  // Logout function
  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated'); // Remove authentication from session
    navigate('/'); // Navigate to home page
  };

  return (
    <div className='flex min-h-screen bg-gray-900'>
      {/* Sidebar */}
      <div className='fixed h-screen w-64 bg-gray-800 border-r border-gray-700'>
        <div className='p-4'>
          <h1 className='text-xl font-bold text-white mb-6'>Chattify</h1>
          <nav className='space-y-2'>
            {/* Sidebar Links */}
            <Link
              to='/'
              className='flex items-center space-x-3 p-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors'
            >
              <Home className='w-5 h-5' />
              <span>Home</span>
            </Link>
            <Link
              to='/messages'
              className='flex items-center space-x-3 p-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors'
            >
              <Mail className='w-5 h-5' />
              <span>Messages</span>
            </Link>
            <Link
              to='/profile'
              className='flex items-center space-x-3 p-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors'
            >
              <User className='w-5 h-5' />
              <span>Profile</span>
            </Link>
            <Link
              to='/settings'
              className='flex items-center space-x-3 p-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors'
            >
              <Settings className='w-5 h-5' />
              <span>Settings</span>
            </Link>
            <button
              onClick={handleLogout} // Logout button handler
              className='flex items-center space-x-3 p-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors w-full'
            >
              <LogOut className='w-5 h-5' />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content (Chat Section) */}
      <div className='flex-1 ml-64'>
        <div className='h-full bg-gray-900'>
          <Chat />
        </div>
      </div>
    </div>
  );
};

// Main App Component (handles all routes)
const App = () => {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path='/' element={<LandingPage />} />

      {/* Protected Routes */}
      <Route
        path='/chat'
        element={
          <ProtectedRoute>
            <ChatLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path='/messages'
        element={
          <ProtectedRoute>
            <ChatLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path='/profile'
        element={
          <ProtectedRoute>
            <ChatLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path='/settings'
        element={
          <ProtectedRoute>
            <ChatLayout />
          </ProtectedRoute>
        }
      />

      {/* Wildcard Route */}
      <Route path='*' element={<Navigate to='/' />} />
    </Routes>
  );
};

export default App;