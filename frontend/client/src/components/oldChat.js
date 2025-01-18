import React, { useState, useEffect } from 'react';
import {
  connectSocket,
  sendMessage,
  listenForMessages,
  disconnectSocket,
  getSocketStatus,
} from '../socket'; // Adjust the import path as needed

const Chat = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState(getSocketStatus());

  useEffect(() => {
    // Connect to the socket when the component mounts
    connectSocket();
    setConnectionStatus(getSocketStatus());

    // Listen for incoming messages
    listenForMessages((incomingMessage) => {
      setChatHistory((prev) => [
        ...prev,
        { sender: 'Server', text: incomingMessage },
      ]);
    });

    // Clean up by disconnecting the socket when the component unmounts
    return () => {
      disconnectSocket();
      setConnectionStatus(getSocketStatus());
    };
  }, []);

  const handleSendMessage = () => {
    if (message.trim() !== '') {
      sendMessage(message);
      setChatHistory((prev) => [...prev, { sender: 'You', text: message }]);
      setMessage(''); // Clear the input field
    } else {
      console.error('Message cannot be empty');
    }
  };

  return (
    <div
      style={{
        maxWidth: '600px',
        margin: 'auto',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h2>Socket.io Chat</h2>

      {/* Connection Status */}
      <div>
        <strong>Status:</strong> {connectionStatus}
      </div>

      {/* Chat History */}
      <div
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          marginTop: '10px',
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

      {/* Message Input and Send Button */}
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
  );
};

export default Chat;
