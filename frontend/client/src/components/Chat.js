import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import UserSelectionContainer from './userselection';
import ChatWindow from './chatwindow';

/**
 * Chat Component
 * This component manages the entire chat functionality, including user authentication,
 * user selection, real-time messaging via Socket.IO, and message handling.
 */
function Chat() {
  // State variables
  const [messages, setMessages] = useState([]); // Current chat messages
  const [message, setMessage] = useState(''); // User's message input
  const [file, setFile] = useState(null); // Selected file for upload
  const [fileName, setFileName] = useState(''); // File name for display
  const [userId, setUserId] = useState(null); // Logged-in user's ID
  const [users, setUsers] = useState([]); // List of all users excluding current user
  const [receiverId, setReceiverId] = useState(null); // Selected user's ID for chat
  const [searchTerm, setSearchTerm] = useState(''); // Search term for user filtering
  const socketRef = useRef(null); // Reference for socket connection
  const navigate = useNavigate(); // Navigation hook for routing

  /**
   * Fetch user data and authenticate user.
   * Runs once on component mount.
   */
  useEffect(() => {
    const authenticateUser = async () => {
      const token = localStorage.getItem('token'); // Get JWT token from localStorage
      if (!token) {
        alert('You are not logged in!');
        navigate('/login');
        return;
      }

      try {
        // Fetch logged-in user's details
        const userResponse = await axios.get('/auth/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserId(userResponse.data.id); // Set the logged-in user's ID

        // Fetch list of all users excluding the current user
        const usersResponse = await axios.get('/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(usersResponse.data); // Set the list of users
      } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    authenticateUser();

    // Initialize socket connection
    if (!socketRef.current) {
      socketRef.current = connectSocket();
      if (socketRef.current) {
        socketRef.current.on('receiveMessage', (newMessage) => {
          setMessages((prevMessages) => [...prevMessages, newMessage]); // Add incoming message to chat
        });

        socketRef.current.on('disconnect', () => {
          console.log('Socket disconnected');
        });
      } else {
        console.error('Failed to initialize socket connection.');
      }
    }

    // Cleanup socket connection on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [navigate]);

  /**
   * Fetch messages for the selected receiver whenever `receiverId` changes.
   */
  useEffect(() => {
    if (receiverId) {
      const fetchMessages = async () => {
        try {
          const response = await axios.get(`/chat/${receiverId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setMessages(response.data); // Update chat messages
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      fetchMessages();
    }
  }, [receiverId]);

  /**
   * Send a new message with optional file attachment.
   */
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
      if (socketRef.current) {
        socketRef.current.emit('sendMessage', sentMessage);
      }

      setMessage(''); // Clear message input
      setFile(null);
      setFileName('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  /**
   * Handle file selection for upload.
   */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  /**
   * Update selected user and clear previous messages.
   */
  const handleUserClick = (id) => {
    setReceiverId(id);
    setMessages([]);
  };

  // Filter users based on search term (by `_id` or `email`)
  const filteredUsers = users.filter(
    (user) =>
      user._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1 className="chat-title">Chat</h1>
      </header>

      <div className="flex h-screen">
        {/* User selection panel */}
        <UserSelectionContainer
          users={filteredUsers}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleUserClick={handleUserClick}
          activeUserId={receiverId}
        />

        {/* Chat window */}
        <ChatWindow
          messages={messages}
          userId={userId}
          receiverId={receiverId}
          message={message}
          setMessage={setMessage}
          handleSendMessage={handleSendMessage}
          handleFileChange={handleFileChange}
          fileName={fileName}
        />
      </div>
    </div>
  );
}

/**
 * Establish a Socket.IO connection.
 * @returns {Socket} The Socket.IO client instance
 */
const connectSocket = () => {
  try {
    const socket = io('http://localhost:5000'); // This is my Backend URL
    return socket;
  } catch (error) {
    console.error('Socket connection failed:', error);
    return null;
  }
};

export default Chat;