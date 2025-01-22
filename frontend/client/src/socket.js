import { io } from 'socket.io-client';

// Initialize Socket.io client with necessary configurations
const socket = io('http://localhost:5000', {
  transports: ['websocket'], // Use WebSocket for better performance
  autoConnect: false, // Prevent auto-connection; you will connect manually
  reconnection: true, // Automatically reconnect if disconnected
  reconnectionAttempts: 5, // Number of reconnection attempts
  reconnectionDelay: 1000, // Delay between reconnection attempts
  reconnectionDelayMax: 5000, // Maximum delay for reconnection
  timeout: 20000,
  forceNew: true,
});

// Function to connect the socket manually
const connectSocket = () => {
  if (!socket.connected) {
    socket.connect(); // Connect to the server
    console.log('Socket connecting...', socket);
  }

  // Handle successful connection
  socket.on('connect', () => {
    console.log('The Socket connected with ID:', socket.id);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  // Handle connection errors
  socket.on('connect_error', (err) => {
    console.error('Socket connection failed:', err.message);
  });
  return socket; //return socket instance
};

// Function to send a message to the server
const sendMessage = (message, recepientId, senderId) => {
  if (!socket.connected) {
    console.error('Cannot send message, socket is not connected!');
    return;
  }
  try {
    //prepare payload
    const payload = {
      senderId: message.senderId,
      recepientId: message.receiverId,
      content: message.content || '',
      file: message.file || null,
      timestamp: message.timestamp || new Date().toISOString(),
    };
    console.log('The message is', message);
    console.log('Sending payload', payload);

    socket.emit('sendMessage', payload);
    // console.log('Message sent:', payload);
  } catch (error) {
    console.error('Error sending message');
  }
};

// Function to listen for incoming messages
const listenForMessages = (callback) => {
  // Ensure the listener is added only once
  if (socket.hasListeners('receiveMessage')) return;

  socket.on('receiveMessage', (data) => {
    callback(data); // Execute the callback when a message is received
    // console.log('New message received:', data);
    // console.log('content is ', data);
    // console.log('Server emitted "receiveMessage":', data);
  });
};

// Function to listen for chat history
const listenForChatHistory = (callback) => {
  // Ensure the listener is added only once
  if (socket.hasListeners('receiveChatHistory')) return;

  socket.on('receiveChatHistory', (history) => {
    callback(history); // Execute the callback when chat history is received
    console.log('Chat history received:', history);
  });
};

// Function to disconnect the socket manually
const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log('Socket disconnected');
  } else {
    console.log('Socket is already disconnected');
  }
};

// Function to get the current connection status
const getSocketStatus = () => {
  return socket.connected ? 'Connected' : 'Disconnected';
};

// Export all the functions for use in other components
export {
  connectSocket,
  sendMessage,
  listenForMessages,
  listenForChatHistory,
  disconnectSocket,
  getSocketStatus,
};
