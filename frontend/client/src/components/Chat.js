import React, { useState, useEffect } from 'react';
import { connectSocket, sendMessage, listenForMessages, disconnectSocket } from '../socket'; // Adjust the path to where your socket utility file is located
import axios from '../utils/axios'; // Assuming this is a custom axios instance with your base URL configured

function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);

  const senderId = "123"; // Replace with actual sender ID
  const receiverId = "456"; // Replace with actual receiver ID

  // Fetch messages between users when component mounts
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/chat/${senderId}/${receiverId}`);
        setMessages(response.data);
      } catch (err) {
        console.error('Error fetching messages:', err.message);
      }
    };

    fetchMessages();

    // Establish socket connection and listen for messages
    connectSocket();
    listenForMessages((newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      disconnectSocket(); // Cleanup socket connection on component unmount
    };
  }, [senderId, receiverId]);

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('senderId', senderId);
    formData.append('receiverId', receiverId);
    formData.append('content', message);

    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await axios.post('/chat/send', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Emit the message through Socket.io
      sendMessage(response.data);

      setMessage('');
      setFile(null);
    } catch (err) {
      console.error('Error sending message:', err.message);
    }
  };

  return (
    <div>
      <h1>Chat with User {receiverId}</h1>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <p><strong>{msg.senderId}</strong>: {msg.content}</p>
            {msg.multimedia && (
              <div>
                {msg.multimedia.endsWith('.jpg') || msg.multimedia.endsWith('.png') || msg.multimedia.endsWith('.jpeg') ? (
                  <img src={msg.multimedia} alt="multimedia" width="300" />
                ) : (
                  <a href={msg.multimedia} target="_blank" rel="noopener noreferrer">
                    Download File
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          required
        />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;
