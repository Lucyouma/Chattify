import React, { useState, useEffect, useRef } from 'react';
import { getUsers } from '../utils/api';
import {
  connectSocket,
  sendMessage,
  listenForMessages,
  disconnectSocket,
} from '../socket'; // Adjust the import path as needed
import axios from 'axios'; // For making API calls

const Chat = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    // Connect socket and listen for messages
    connectSocket();
    setConnectionStatus('Connected');

    listenForMessages((incomingMessage) => {
      setChatHistory((prev) => [...prev, incomingMessage]);
    });

    // Fetch users from the database
    const fetchUsers = async () => {
      const usersData = await getUsers(); // Await the promise to resolve
      setUsers(usersData); // Set the fetched data into the state
    };

    fetchUsers();

    return () => {
      disconnectSocket();
      setConnectionStatus('Disconnected');
    };
  }, []);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setChatHistory([]); // Clear previous messages
  };

  const handleSendMessage = () => {
    if (message.trim() !== '' && selectedUser) {
      const newMessage = {
        sender: 'You',
        receiver: selectedUser.name,
        text: message,
      };
      sendMessage(newMessage);
      setChatHistory((prev) => [...prev, newMessage]);
      setMessage('');
    } else {
      console.error('Message cannot be empty or no user selected');
    }
  };

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: 'auto',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h2>Socket.io Chat</h2>

      <div style={{ display: 'flex' }}>
        {/* User List */}
        <div
          style={{ flex: '1', borderRight: '1px solid #ccc', padding: '10px' }}
        >
          <h3>Users</h3>
          <ul>
            {users.map((user) => (
              <li
                key={user.id}
                style={{
                  padding: '5px',
                  cursor: 'pointer',
                  backgroundColor:
                    selectedUser?.id === user.id ? '#e0e0e0' : 'transparent',
                }}
                onClick={() => handleUserClick(user)}
              >
                {user.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Window */}
        <div style={{ flex: '2', padding: '10px' }}>
          <h3>Chat with {selectedUser ? selectedUser.name : '...'}</h3>
          <div
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              height: '300px',
              overflowY: 'scroll',
              backgroundColor: '#f9f9f9',
            }}
          >
            {chatHistory.map((entry, index) => (
              <div key={index}>
                <strong>{entry.sender}:</strong> {entry.text}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '10px' }}>
            <input
              type='text'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Type your message'
              style={{ width: '80%', padding: '10px' }}
            />
            <button
              onClick={handleSendMessage}
              style={{ padding: '10px', marginLeft: '10px' }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
