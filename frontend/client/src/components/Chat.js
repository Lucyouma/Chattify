import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSelectionContainer from './userselection';
import ChatWindow from './chatwindow';
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

      //delete this line
      localStorage.setItem('senderId', userData.id);

      try {
        console.log('before connect socket ref is ', socketRef.current);
        const socket = connectSocket();
        console.log('connectsocket returned:', socket);
        console.log('socket connected status:', socket?.connected);

        if (!socket) {
          throw new Error(
            'Socket connection failed - connectSocket returned null/undefined',
          );
        }
        socketRef.current = socket;

        if (!socketRef.current.connected) {
          console.log(
            'Socket not yet connected, waiting for connection event...',
          );
        }

        // if (!socketRef.current) {
        //   console.error('Failed to connect to socket1');
        //   return;
        // }

        //join room and listen for messages
        listenForMessages((newMessage) => {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        socketRef.current.on('connect', () => {
          console.log('Socket connected succesfully:', socketRef.current.id);
          socketRef.current.emit('userConnected', userData.id);
          socketRef.current.emit('registerUser', userId);
          console.log('User registered with ID:', userId);
        });
        console.log('After connect socker ref is', socketRef.current);
      } catch (error) {
        console.error('Error initializing socket:', error);
        console.error('Socket state:', {
          socketRef: socketRef.current,
          connected: socketRef.current?.connected,
          id: socketRef.current?.id,
        });

        // console.log(
        //   'Failed to connect to chat server.Please try refreshing page.',
        // );
      }

      //delete this next
      // listenForChatHistory((history) => {
      //   setMessages(history);
      // });
      // }
    };

    authenticateUser();

    // Cleanup the socket connection on unmount
    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection...');
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        disconnectSocket();
        socketRef.current = null;
      }
    };
  }, [navigate]);

  useEffect(() => {
    // Monitor socket connection status
    const checkSocketConnection = () => {
      if (socketRef.current) {
        console.log('Socket connection status:', {
          connected: socketRef.current.connected,
          id: socketRef.current.id,
        });
      } else {
        console.log('No socket reference available');
      }
    };

    const interval = setInterval(checkSocketConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on('disconnect', async () => {
        console.log('Socket disconnected, attempting to reconnect...');
        try {
          const socket = connectSocket();
          if (socket) {
            socketRef.current = socket;
            if (userId) {
              socket.emit('userConnected', userId);
            }
            if (receiverId) {
              socket.emit('joinChat', receiverId);
            }
          }
        } catch (error) {
          console.error('Reconnection failed:', error);
        }
      });
    }
  }, [socketRef.current, userId, receiverId]);

  //use effect for saving and loading messages from local storage for persistence
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

    //new changes
    try {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        newMessage.file = data.url;
      }
      sendMessage(newMessage, receiverId, userId);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage('');
      setFile(null);
      setFileName('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle selecting a user for chatting, including self-messaging
  const handleUserClick = (id) => {
    if (!socketRef.current?.connected) {
      console.log('Socket not connected, attempting to reconnect...');
      // return;
      try {
        const socket = connectSocket();
        if (!socket) {
          throw new Error('Failed to create socket connection');
        }
        socketRef.current = socket;

        socketRef.current.on('connect', () => {
          console.log('Socket reconnected succesfully');
          setReceiverId(id);
          setMessages([]);
          socketRef.current.emit('joinChat', id);
        });
      } catch (error) {
        console.error('Error reconnecting socket:', error);
        return;
      }
    } else {
      // socket lready connected, proceed normally
      setReceiverId(id);
      setMessages([]); //clear messages for new receiver
      socketRef.current.emit('joinChat', id);
    }
  };

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }
  }, [socketRef.current]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

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
