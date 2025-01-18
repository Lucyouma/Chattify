import React, { useState } from 'react';

/**
 * App Component
 * - Includes Login, Registration, and Chat components.
 * - Simulates navigation between pages.
 */
const App = () => {
  const [currentPage, setCurrentPage] = useState('login'); // Tracks the current page (login, register, chat).
  const [user, setUser] = useState(null); // Tracks the logged-in user.

  // Simulate user login
  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('chat');
  };

  return (
    <div className="h-screen bg-gray-100 flex items-center justify-center">
      {currentPage === 'login' && (
        <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setCurrentPage('register')} />
      )}
      {currentPage === 'register' && (
        <RegisterPage onSwitchToLogin={() => setCurrentPage('login')} />
      )}
      {currentPage === 'chat' && user && <ChatPage user={user} />}
    </div>
  );
};

/**
 * LoginPage Component
 * Handles user login.
 */
const LoginPage = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ email });
  };

  return (
    <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded mb-4"
          />
        </label>
        <label className="block mb-2">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border rounded mb-4"
          />
        </label>
        <label className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
            className="mr-2"
          />
          Remember Me
        </label>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
      <p className="mt-4 text-center">
        Don't have an account?{' '}
        <button
          className="text-blue-500 hover:underline"
          onClick={onSwitchToRegister}
        >
          Register
        </button>
      </p>
    </div>
  );
};

/**
 * RegisterPage Component
 * Handles user registration.
 */
const RegisterPage = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Registration successful!');
    onSwitchToLogin();
  };

  return (
    <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded mb-4"
          />
        </label>
        <label className="block mb-2">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border rounded mb-4"
          />
        </label>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Register
        </button>
      </form>
      <p className="mt-4 text-center">
        Already have an account?{' '}
        <button
          className="text-blue-500 hover:underline"
          onClick={onSwitchToLogin}
        >
          Login
        </button>
      </p>
    </div>
  );
};

/**
 * ChatPage Component
 * Represents the main chat interface.
 */
const ChatPage = ({ user }) => {
  const users = [
    { id: '67773ab1d589743a848acde4', email: 'akinyilucy09@gmail.com' },
    { id: '67844987fb07c93ed9040fe8', email: '9012@gmail.com' },
  ];
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    setMessages([...messages, { sender: user.email, content: message }]);
    setMessage('');
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r">
        <h2 className="text-lg font-bold p-4 border-b">Available Users</h2>
        <ul>
          {users.map((u) => (
            <li key={u.id} className="p-4 border-b hover:bg-gray-100">
              <p className="font-medium">{u.name}</p>
              <p className="text-sm text-gray-500">{u.email}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 bg-gray-200 border-b">Chat with Everyone</div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {messages.map((msg, idx) => (
            <div key={idx} className="mb-2">
              <p className="font-bold text-blue-600">{msg.sender}</p>
              <p className="bg-gray-200 p-2 rounded inline-block">{msg.content}</p>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t flex items-center space-x-3"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
