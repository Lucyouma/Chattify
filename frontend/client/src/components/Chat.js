import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import UserSelectionContainer from './userselection';
import ChatWindow from './chatwindow';

/**
 * Chat Component
 * This component manages the entire chat functionality, including:
 * - User authentication and fetching user details
 * - Real-time messaging using Socket.IO
 * - Sending and receiving messages
 * - File attachment support
 */
function Chat() {
  // State variables
  const [messages, setMessages] = useState([]); // Current chat messages
  const [message, setMessage] = useState(''); // User's message input
  const [file, setFile] = useState(null); // Selected file for upload
  const [fileName, setFileName] = useState(''); // Name of the selected file
  const [userId, setUserId] = useState(null); // Logged-in user's ID
  const [users, setUsers] = useState([]); // List of available users for chat
  const [receiverId, setReceiverId] = useState(null); // Selected chat partner's ID
  const [searchTerm, setSearchTerm] = useState(''); // Search term for user filtering
  const socketRef = useRef(null); // Reference to the Socket.IO connection
  const navigate = useNavigate(); // Navigation hook for routing

  /**
   * Authenticate the user and fetch user-related data on component mount.
   */
  useEffect(() => {
    const authenticateUser = async () => {
      const token = localStorage.getItem('token'); // Retrieve JWT token from localStorage

      // Redirect to login if the token is missing
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
        setUserId(userResponse.data.id); // Set logged-in user's ID

        // Store senderId in localStorage for future use
        localStorage.setItem('senderId', userResponse.data.id);

        // Fetch list of users excluding the current user
        const usersResponse = await axios.get('/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(usersResponse.data); // Set available users
      } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Session expired. Please log in again.');
        localStorage.removeItem('token'); // Clear invalid token
        navigate('/login');
      }
    };

    // Authenticate and initialize the user data
    authenticateUser();

    // Initialize Socket.IO connection
    if (!socketRef.current) {
      socketRef.current = connectSocket();

      // Listen for incoming messages
      if (socketRef.current) {
        socketRef.current.on('receiveMessage', (newMessage) => {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        socketRef.current.on('disconnect', () => {
          console.log('Socket disconnected');
        });
      } else {
        console.error('Failed to initialize socket connection.');
      }
    }

    // Cleanup the socket connection on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [navigate]);

  /**
   * Fetch messages when a new receiver is selected.
   */
  useEffect(() => {
    if (receiverId) {
      const fetchMessages = async () => {
        try {
          // Retrieve senderId from localStorage
          const senderId = localStorage.getItem('senderId'); // Fetch the senderId directly from localStorage
          if (!senderId) {
            console.error('Sender ID not found');
            alert('You are not logged in! Please log in again.');
            return;
          }

          // Make the request to fetch messages
          const response = await axios.get(`/api/chat/send/${senderId}/${receiverId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });

          setMessages(response.data); // Update chat messages
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      fetchMessages();
    }
  }, [receiverId]); // Now userId is no longer a dependency here since senderId is taken from localStorage

  /**
   * Handle sending a new message with optional file attachment.
   * @param {Event} e - Form submission event
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();

    // Validate that a recipient is selected
    if (!receiverId) {
      alert('Please select a user to chat with.');
      return;
    }

    // Validate that either a message or file is provided
    if (!message && !file) {
      alert('Please enter a message or attach a file.');
      return;
    }

    // Validate file size (max 10MB)
    if (file && file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB. Please select a smaller file.');
      return;
    }

    // Retrieve senderId from localStorage
    const senderId = localStorage.getItem('senderId');
    if (!senderId) {
      console.error('Sender ID not found');
      alert('You are not logged in! Please log in again.');
      return;
    }

    // Prepare the FormData to send in the request
    const formData = new FormData();
    formData.append('senderId', senderId); // Using the senderId from localStorage
    formData.append('receiverId', receiverId);
    formData.append('content', message);
    if (file) formData.append('file', file);

    console.log('Sending message with:', { senderId, receiverId, message, file });

    try {
      const response = await axios.post('/api/chat/send', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const sentMessage = response.data;
      if (socketRef.current) {
        socketRef.current.emit('sendMessage', sentMessage); // Notify other users via Socket.IO
      }

      // Clear the input fields
      setMessage('');
      setFile(null);
      setFileName('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  /**
   * Handle file selection for upload.
   * @param {Event} e - File input change event
   */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  /**
   * Update the selected user and reset the message list.
   * @param {string} id - ID of the selected user
   */
  const handleUserClick = (id) => {
    setReceiverId(id);
    setMessages([]); // Reset messages when a new user is selected
  };

  // Filter users based on the search term
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
 * @returns {Socket | null} The Socket.IO client instance or null if connection fails
 */
const connectSocket = () => {
  try {
    const socket = io('http://localhost:5000'); // Backend URL
    return socket;
  } catch (error) {
    console.error('Socket connection failed:', error);
    return null;
  }
};

export default Chat;