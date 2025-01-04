import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'; // Import routing components
import Chat from './components/Chat'; // Import Chat component
import LoginForm from './components/LoginForm'; // Import LoginForm component
import RegisterForm from './components/RegisterForm'; // Import RegisterForm component
import './App.css'; // Import CSS

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Welcome to Chattify!</h1>
          <p>Your One-Stop Solution For Seamless Communication.</p>
          {/* Navigation Links */}
          <nav>
            <Link to="/login">Login</Link> | <Link to="/register">Register</Link> |{' '}
            <Link to="/chat">Chat</Link>
          </nav>
        </header>

        {/* Routes for different components */}
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
