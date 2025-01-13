import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import UserSelectionContainer from './userselection';
import ChatWindow from './chatwindow';

/**
 * Chat component for handling real-time messaging and user interactions.
 * Handles user authentication, message sending/receiving, and user selection.
 */
function Chat() {
  const [messages, setMessages] = useState([]); // List of messages in the current chat
  const [message, setMessage] = useState(''); // Input message content
  const [file, setFile] = useState(null); // Selected file for sending
  const [fileName, setFileName] = useState(''); // Name of the selected file
  const [userId, setUserId] = useState(null); // Current user's ID
  const [users, setUsers] = useState([]); // List of all users (excluding the current logged-in user)
  const [receiverId, setReceiverId] = useState(null); // Selected user to chat with
  const [searchTerm, setSearchTerm] = useState(''); // Term to filter users
  const socketRef = useRef(null); // Reference to the socket instance
  const navigate = useNavigate(); // Navigation handler to redirect user

  /**
   * Authenticate the user and fetch the user list.
   * Ensures the user is logged in and fetches the list of users excluding the logged-in user.
   */
  useEffect(() => {
    const authenticateUser = async () => {
      const token = localStorage.getItem('token'); // Retrieve token from local storage

      // Redirect to login page if token is not found
      if (!token) {
        alert('You are not logged in!');
        navigate('/login');
        return;
      }

      try {
        // Fetch the current user's details
        const userResponse = await axios.get('/auth/user', {
          headers: { Authorization: `Bearer ${token}` }, // Send token in request header
        });
        setUserId(userResponse.data.id); // Set the current user's ID

        // Fetch the list of all users excluding the current user
        const usersResponse = await axios.get('/users', {
          headers: { Authorization: `Bearer ${token}` }, // Send token in request header
        });
        setUsers(usersResponse.data.filter((user) => user._id !== userResponse.data.id)); // Filter out the logged-in user
      } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    authenticateUser(); // Run authentication on mount

    // Initialize socket connection for real-time messaging
    if (!socketRef.current) {
      socketRef.current = connectSocket();

      // Ensure the socket is valid before setting up listeners
      if (socketRef.current) {
        socketRef.current.on('receiveMessage', (newMessage) => {
          setMessages((prevMessages) => [...prevMessages, newMessage]); // Add received message to the chat
        });

        socketRef.current.on('disconnect', () => {
          console.log('Socket disconnected'); // Log socket disconnection
        });
      } else {
        console.error('Failed to initialize socket connection.');
      }
    }

    // Cleanup the socket connection on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null; // Reset socket reference
      }
    };
  }, [navigate]);

  /**
   * Fetch messages for the selected user.
   * This hook runs when a receiver is selected and fetches their chat history.
   */
  useEffect(() => {
    if (receiverId) {
      const fetchMessages = async () => {
        try {
          const response = await axios.get(`/chat/${receiverId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, // Send token to authorize request
          });
          setMessages(response.data); // Set the fetched messages
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      fetchMessages();
    }
  }, [receiverId]); // Run when receiverId changes

  /**
   * Handle sending a message (with optional file attachment).
   * Sends a message to the backend API and emits it through the socket for real-time updates.
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('senderId', userId); // Append sender ID
    formData.append('receiverId', receiverId); // Append receiver ID
    formData.append('content', message); // Append message content

    if (file) {
      formData.append('file', file); // Append file if available
    }

    try {
      // Send the message via API
      const response = await axios.post('/chat/send', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Set content type for file upload
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Authorization header with token
        },
      });

      const sentMessage = response.data;

      // Emit the message through the socket for real-time updates
      if (socketRef.current) {
        socketRef.current.emit('sendMessage', sentMessage);
      }

      // Clear input fields after sending
      setMessage('');
      setFile(null);
      setFileName('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  /**
   * Handle file selection.
   * This function is triggered when a user selects a file to send.
   */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile); // Set the selected file
      setFileName(selectedFile.name); // Set the file name for display
    }
  };

  /**
   * Handle user selection from the list.
   * When a user is selected from the list, set them as the receiver for the chat.
   */
  const handleUserClick = (id) => {
    setReceiverId(id); // Set the selected user's ID as the receiver
    setMessages([]); // Clear previous messages when a new user is selected
  };

  // Filter the users based on the search term (e.g., by name or email)
  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || // Filter by email
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) // Filter by name
  );

  return (
    <div className='chat-container'>
      <header className='chat-header'>
        <h1 className='chat-title'>Chat</h1>
      </header>

      <div className='flex h-screen'>
        {/* User selection panel */}
        <UserSelectionContainer
          users={filteredUsers} // Pass filtered list of users to the selection container
          searchTerm={searchTerm} // Pass search term to filter users
          setSearchTerm={setSearchTerm} // Function to update search term
          handleUserClick={handleUserClick} // Function to handle user click
          activeUserId={receiverId} // Set active user to highlight the selected one
        />

        {/* Chat window */}
        <ChatWindow
          messages={messages} // Pass messages to the chat window
          userId={userId} // Pass current user's ID
          receiverId={receiverId} // Pass selected receiver's ID
          users={users} // Pass list of all users
          message={message} // Pass current message input value
          setMessage={setMessage} // Function to update message input
          handleSendMessage={handleSendMessage} // Function to send the message
          handleFileChange={handleFileChange} // Function to handle file selection
          fileName={fileName} // Pass selected file name
        />
      </div>
    </div>
  );
}

/**
 * Establishes a socket connection using Socket.IO.
 * This function creates and returns a socket connection.
 */
const connectSocket = () => {
  try {
    const socket = io('http://localhost:5000'); // My frontend server URL (adjust if needed)
    return socket;
  } catch (error) {
    console.error('Socket connection failed:', error);
    return null;
  }
};

export default Chat;