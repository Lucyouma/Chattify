import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSelectionContainer from './userselection';
import ChatWindow from './chatwindow';
import {
  connectSocket,
  sendMessage,
  listenForMessages,
  listenForChatHistory,
  disconnectSocket,
} from '../socket';

/**
 * Chat Component
 * This component manages the entire chat functionality using Socket.IO for real-time messaging.
 */
function Chat() {
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

  // Initialize user and socket connection
  useEffect(() => {
    const authenticateUser = () => {
      const token = localStorage.getItem('token'); // Retrieve JWT token from localStorage

      if (!token) {
        alert('You are not logged in!');
        navigate('/login');
        return;
      }

      // Extract user ID from token payload (replace this with a real JWT decoding if needed)
      const userData = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
      setUserId(userData.id);
      localStorage.setItem('senderId', userData.id);

      // Connect socket and listen for messages
      if (!socketRef.current) {
        socketRef.current = connectSocket(userData.id); // Pass user ID for initialization
        listenForMessages((newMessage) => {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        listenForChatHistory((history) => {
          setMessages(history);
        });
      }
    };

    authenticateUser();

    // Cleanup the socket connection on unmount
    return () => {
      if (socketRef.current) {
        disconnectSocket();
        socketRef.current = null;
      }
    };
  }, [navigate]);

  // Fetch messages for the selected user
  useEffect(() => {
    if (receiverId && socketRef.current) {
      // Emit an event to fetch chat history for the selected receiver
      socketRef.current.emit('fetchChatHistory', {
        senderId: userId,
        receiverId,
      });
    }
  }, [receiverId, userId]);

  // Handle sending a new message
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!message && !file) return;

    const newMessage = {
      senderId: userId,
      receiverId,
      content: message,
      file: file ? file.name : null, // You may also need to handle file uploads separately
    };

    sendMessage(newMessage); // Send the message via socket
    setMessages((prevMessages) => [...prevMessages, newMessage]); // Optimistically update UI

    // Clear inputs
    setMessage('');
    setFile(null);
    setFileName('');
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  // Handle selecting a user for chatting
  const handleUserClick = (id) => {
    setReceiverId(id);
    setMessages([]); // Clear messages when a new user is selected
  };

  // Filter users based on search term
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
