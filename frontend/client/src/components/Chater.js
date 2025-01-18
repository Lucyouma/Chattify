import React, { useState, useEffect, useRef } from 'react';
// import { io } from 'socket.io-client';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import UserSelectionContainer from './userselection';
import ChatWindow from './chatwindow';
import {
  connectSocket,
  sendMessage,
  listenForMessages,
  disconnectSocket,
} from '../socket';

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
      listenForMessages((newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });
    }

    // Cleanup the socket connection on component unmount
    return () => {
      if (socketRef.current) {
        disconnectSocket();
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
          const response = await axios.get(
            `/api/chat/${senderId}/${receiverId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            },
          );

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

      // Emit message via socket
      sendMessage(sentMessage);

      // Clear inputs
      setMessage('');
      setFile(null);
      setFileName('');
    } catch (error) {
      console.error('Error sending message:', error);
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
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className='chat-container'>
      <header className='chat-header'>
        <h1 className='chat-title'>Chat</h1>
      </header>

      <div className='chat-body'>
        {/* Left Panel: User Selection */}
        <aside className='user-list'>
          <UserSelectionContainer
            users={filteredUsers}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleUserClick={handleUserClick}
            activeUserId={receiverId}
          />
        </aside>

        {/* Center Panel: Chat Messages */}
        <main className='chat-main'>
          <ChatWindow
            messages={messages}
            userId={userId}
            users={users}
            receiverId={receiverId}
            message={message}
            setMessage={setMessage}
            handleSendMessage={handleSendMessage}
            handleFileChange={handleFileChange}
            fileName={fileName}
          />
        </main>
      </div>

      {/* Chat Input Box */}
      <footer className='chat-input'>
        <form onSubmit={handleSendMessage}>
          <input
            type='text'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Type a message...'
            className='message-input'
          />
          <input
            type='file'
            onChange={handleFileChange}
            className='file-input'
            hidden
          />
          <button type='submit' className='send-button'>
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}

export default Chat;
