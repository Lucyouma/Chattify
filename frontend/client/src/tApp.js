import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { Home, Mail, User, Settings, LogOut } from 'lucide-react';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import Chat from './components/Chat';

// Landing Page Component
const LandingPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Handler for successful registration
  const handleRegistrationSuccess = () => {
    setShowLogin(true);
  };

  // Handler for successful login
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // If user is authenticated, redirect to chat
  if (isAuthenticated) {
    return <Navigate to='/Chat' />;
  }

  return (
    <div className='min-h-screen bg-black text-white'>
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center mb-12'>
            <h1 className='text-6xl font-bold mb-4'>Chattify</h1>
            <h2 className='text-3xl'>
              Your One-Stop Solution For Seamless Communication
            </h2>
          </div>

          {/* Auth Form Container */}
          <div className='max-w-md mx-auto bg-gray-900 p-8 rounded-lg'>
            {showLogin ? (
              <LoginForm onLoginSuccess={handleLoginSuccess} />
            ) : (
              <RegisterForm onRegistrationSuccess={handleRegistrationSuccess} />
            )}

            {/* Toggle between login and register */}
            <div className='mt-4 text-center'>
              <button
                onClick={() => setShowLogin(!showLogin)}
                className='text-blue-500 hover:underline'
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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  // Replace with your actual auth check
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to='/Chat' />;
};

// Chat Layout Component
const ChatLayout = () => {
  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    window.location.href = '/';
  };

  return (
    <div className='flex min-h-screen bg-black text-white'>
      {/* Sidebar */}
      <div className='fixed h-screen w-64 border-r border-gray-700 p-4'>
        <nav className='space-y-4'>
          <a
            href='/chat'
            className='flex items-center space-x-4 p-3 hover:bg-gray-800 rounded-full'
          >
            <Home className='w-6 h-6' />
            <span>Home</span>
          </a>
          <a
            href='/messages'
            className='flex items-center space-x-4 p-3 hover:bg-gray-800 rounded-full'
          >
            <Mail className='w-6 h-6' />
            <span>Messages</span>
          </a>
          <a
            href='/profile'
            className='flex items-center space-x-4 p-3 hover:bg-gray-800 rounded-full'
          >
            <User className='w-6 h-6' />
            <span>Profile</span>
          </a>
          <a
            href='/settings'
            className='flex items-center space-x-4 p-3 hover:bg-gray-800 rounded-full'
          >
            <Settings className='w-6 h-6' />
            <span>Settings</span>
          </a>
          <button
            onClick={handleLogout}
            className='flex items-center space-x-4 p-3 hover:bg-gray-800 rounded-full w-full'
          >
            <LogOut className='w-6 h-6' />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className='flex-1 ml-64 border-red-500'>
        <div className='p-4'>
          <Chat />
        </div>
      </main>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route
          path='/Chat'
          element={
            <ProtectedRoute>
              <ChatLayout />
            </ProtectedRoute>
          }
        />
        {/* Redirect all other routes to home */}
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </Router>
  );
};

// export default App;
