import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Link,
  useNavigate,
} from 'react-router-dom';
import { Home, Mail, User, Settings, LogOut } from 'lucide-react';
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
  };

  const handleRegistrationSuccess = () => {
    setShowLogin(true);
  };
  if (sessionStorage.getItem('isAuthenticated') === 'true') {
    return null;
  }

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center mb-12'>
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
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';

  return isAuthenticated ? children : <Navigate to='/' />;
};

// Chat Layout Component
const ChatLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  return (
    <div className='flex min-h-screen bg-gray-900'>
      {/* Sidebar */}
      <div className='fixed h-screen w-64 bg-gray-800 border-r border-gray-700'>
        <div className='p-4'>
          <h1 className='text-xl font-bold text-white mb-6'>Chattify</h1>
          <nav className='space-y-2'>
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
              onClick={handleLogout}
              className='flex items-center space-x-3 p-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors w-full'
            >
              <LogOut className='w-5 h-5' />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 ml-64'>
        <div className='h-full bg-gray-900'>
          <Chat />
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<LandingPage />} />
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
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </Router>
  );
};

export default App;
