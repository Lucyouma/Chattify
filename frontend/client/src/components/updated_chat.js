import React, { useState, useEffect, useRef } from 'react';
import {
  connectSocket,
  sendMessage,
  listenForMessages,
  disconnectSocket,
} from '../socket'; // Import functions from socket.js
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import UserSelectionContainer from './userselection';
import ChatWindow from './chatwindow';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [userId, setUserId] = useState(null);
  const [users, setUsers] = useState([]); // List of users
  const [receiverId, setReceiverId] = useState(null); // The selected user's ID
  const socketRef = useRef(null); //Reference to socket io connection
  const navigate = useNavigate();

  // Authenticate user and fetch users
  useEffect(() => {
    const authenticateUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You are not logged in!');
        navigate('/login');
        return;
      }

      try {
        // Fetching a logged in user's details
        const userResponse = await axios.get('/auth/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserId(userResponse.data.id); // set the logged in user

        localStorage.setItem('senderId', userResponse.data.id);

        //fetch list of users, excluding the current user
        const usersResponse = await axios.get('/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(
          usersResponse.data.filter((user) => user.id !== userResponse.data.id),
        );

        console.log('users in db:', usersResponse.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    //authenticate user and initialize user data
    authenticateUser();

    // Connect to the socket and listen for messages
    connectSocket();
    listenForMessages((newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      disconnectSocket();
    };
  }, [navigate]);

  // Fetch messages when a receiver is selected
  useEffect(() => {
    if (receiverId) {
      const fetchMessages = async () => {
        try {
          const response = await axios.get(`/chat/${receiverId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          setMessages(response.data);
        } catch (error) {
          console.error('Error fetching messages:', error);
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

  const filteredUsers = users; // Use the full list of users directly

  return (
    <div className='chat-container'>
      <header className='chat-header'>
        <h1 className='chat-title'>Chat</h1>
      </header>

      <div className='flex h-screen'>
        <UserSelectionContainer
          users={filteredUsers}
          handleUserClick={handleUserClick}
          activeUserId={receiverId}
        />

        {/* Chat Window */}
        <ChatWindow
          messages={messages}
          userId={userId}
          receiverId={receiverId}
          users={users}
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

// export default Chat;
