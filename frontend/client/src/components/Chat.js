import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSelectionContainer from './userselection';
import ChatWindow from './chatwindow';
import Navbar from './Navbar';
import axios from '../utils/axios';
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

  // Initialize user, fetch users and socket connection
  useEffect(() => {
    const authenticateUser = async () => {
      const token = localStorage.getItem('token'); // Retrieve JWT token from localStorage

      if (!token) {
        alert('You are not logged in!');
        navigate('/login');
        return;
      }

      //fetch users from db;
      try {
        const { data: userList } = await axios.get('/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(userList); // Properly update the state with fetched users
      } catch (error) {
        console.error('Error fetching users:', error);

        return;
      }
      //fetch users from db fails

      // Extract user ID from token payload
      const userData = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
      setUserId(userData.id);
      // socketRef.current.emit('registerUser', userId);
      localStorage.setItem('senderId', userData.id);

      // Connect socket and listen for messages
      if (!socketRef.current) {
        socketRef.current = connectSocket(userData.id); // Pass user ID for initialization
        console.log('Registering user with user id', userId);
        socketRef.current.emit('registerUser', userId);

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

  // use effect for saving and loading messages from local storage for persistence
  useEffect(() => {
    if (receiverId) {
      const storedMessages = localStorage.getItem(
        `chat_${userId}_${receiverId}`,
      );
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
    }
  }, [receiverId, userId]);

  //save chat history locally whenever messages change
  useEffect(() => {
    if (receiverId) {
      localStorage.setItem(
        `chat_${userId}_${receiverId}`,
        JSON.stringify(messages),
      );
    }
  }, [messages, receiverId, userId]);

  useEffect(() => {
    if (!receiverId && userId) {
      //default to self if no receiver selected
      setReceiverId(userId);
    }
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
      file: file ? file.name : null,
      timestamp: new Date().toISOString(),
    };

    sendMessage(newMessage); // Send the message via socket
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, newMessage];
      localStorage.setItem(
        `chat_${userId}_${receiverId}`,
        JSON.stringify(updatedMessages),
      );
      return updatedMessages;
    });
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

  // Handle selecting a user for chatting, including self-messaging
  const handleUserClick = (id) => {
    if (id === receiverId) {
      console.log('User already selected');
      return;
    }
    setReceiverId(id);
    if (socketRef.current) {
      socketRef.current.emit('registerUser', receiverId);
    }

    setMessages([]); //clear messages for new receiver
  };
  // const handleUserClick = (id) => {
  //   setReceiverId(id);
  //   console.log('user clicked with id ', receiverId);
  //   if (id === userId) {
  //     // Allow messaging to self, same as messaging another user
  //     setReceiverId(id);
  //     // setMessages([]); // Clear previous messages
  //   } else {
  //     // Proceed with normal user selection
  //     setReceiverId(id);
  //     // setMessages([]); // Clear previous messages
  //   }
  // };

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className='chat-container'>
      {/* <header className='chat-header'>
        <h1 className='chat-title'>Chat</h1>
      </header> */}

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

        {/* Bottom Panel: Chat Input Box */}
        {/* <footer className='chat-input'>
          <form onSubmit={handleSendMessage}>

        </footer> */}
      </div>
    </div>
  );
}

export default Chat;
