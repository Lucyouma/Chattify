import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [userId, setUserId] = useState(null);
  const [users, setUsers] = useState([]); // List of users to display
  const [receiverId, setReceiverId] = useState(null); // The ID of the user you are chatting with
  const [searchTerm, setSearchTerm] = useState(''); // Search term for filtering users
  const socketRef = useRef(null);
  const navigate = useNavigate();

  // Fetch logged-in user and list of users
  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You are not logged in!');
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('/auth/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserId(response.data.id);

        // Fetch list of users excluding the logged-in user
        const usersResponse = await axios.get('/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(usersResponse.data);
      } catch (err) {
        console.error('Authentication failed:', err.message);
        alert('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    checkAuthentication();

    // Initialize socket connection
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:5000');

      socketRef.current.on('receiveMessage', (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [navigate]);

  // Fetch messages for a selected user
  useEffect(() => {
    if (receiverId) {
      const fetchMessages = async () => {
        try {
          const response = await axios.get(`/chat/${receiverId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setMessages(response.data);
        } catch (err) {
          console.error('Error fetching messages:', err.message);
        }
      };
      fetchMessages();
    }
  }, [receiverId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('senderId', userId);
    formData.append('receiverId', receiverId);
    formData.append('content', message);

    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await axios.post('/chat/send', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const sentMessage = response.data;

      // Emit the message to the server via socket
      if (socketRef.current) {
        socketRef.current.emit('sendMessage', sentMessage);
      }

      // Clear inputs
      setMessage('');
      setFile(null);
      setFileName('');
    } catch (err) {
      console.error('Error sending message:', err.message);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleUserClick = (id) => {
    setReceiverId(id);
    setMessages([]); // Clear previous messages
  };

  const filteredUsers = users.filter((user) =>
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.contact && user.contact.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1 className="chat-title">Chat</h1>
      </header>

      {/* User List with Search */}
      <div className="user-list">
        <h3>Select a User to Chat:</h3>
        <input
          type="text"
          placeholder="Search by name or contact..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
        <ul>
          {filteredUsers.map((user) => (
            <li
              key={user.id}
              onClick={() => handleUserClick(user.id)}
              className={receiverId === user.id ? 'active' : ''}
            >
              <span className="user-name">{user.name}</span>
              <span className="user-contact"> ({user.contact})</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Messages */}
      {receiverId && (
        <div className="chat-window">
          <h3>Chatting with: {users.find((user) => user.id === receiverId)?.name}</h3>
          <div className="chat-messages">
            {messages.map((msg) => (
              <div
                key={msg._id || msg.senderId + msg.timestamp}
                className={msg.senderId === userId ? 'sent' : 'received'}
              >
                <p>{msg.content}</p>
                {msg.multimedia && (
                  <div className="chat-media">
                    {msg.multimedia.endsWith('.jpg') || msg.multimedia.endsWith('.png') ? (
                      <img src={msg.multimedia} alt="multimedia" className="chat-image" />
                    ) : (
                      <a
                        href={msg.multimedia}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="chat-file-link"
                      >
                        Download File
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="chat-input">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              required
              className="message-box"
            />
            <input type="file" onChange={handleFileChange} className="file-input" />
            {fileName && <p className="file-name">Selected File: {fileName}</p>}
            <button type="submit" className="send-button">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chat;
