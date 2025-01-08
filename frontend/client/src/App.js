import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Chat from './components/Chat'; // Import Chat component
import LoginForm from './components/LoginForm'; // Import LoginForm component
import RegisterForm from './components/RegisterForm'; // Import RegisterForm component
import './App.css'; // Import your CSS file

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Chattify</h1>
          <p>Your One-Stop Solution For Seamless Communication</p>
          {/* Navigation Links */}
          <nav>
            <ul className="nav-links">
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/chat">Chat</Link></li>
            </ul>
          </nav>
        </header>

        {/* Main Content Area */}
        <div className="main-content">
          <Routes>
            {/* Define Routes for each page */}
            <Route path="/" element={<Navigate to="/login" />} /> {/* Default Route */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/chat" element={<Chat />} />
            {/* Fallback Route */}
            <Route path="*" element={<h2>Page Not Found</h2>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
