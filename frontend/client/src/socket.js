import { io } from 'socket.io-client';

// Initialize Socket.io client with necessary configurations
const socket = io('http://localhost:5000', {
  transports: ['websocket'],  // Use WebSocket for better performance
  autoConnect: false,         // Prevent auto-connection; you will connect manually
  reconnection: true,         // Automatically reconnect if disconnected
  reconnectionAttempts: 5,    // Number of reconnection attempts
  reconnectionDelay: 1000,    // Delay between reconnection attempts
  reconnectionDelayMax: 5000  // Maximum delay for reconnection
});

// Function to connect the socket manually
const connectSocket = () => {
  if (!socket.connected) {
    socket.connect(); // Connect to the server
    console.log('Socket connecting...');
  }

  // Handle successful connection
  socket.on('connect', () => {
    console.log('Socket connected with ID:', socket.id);
  });

  // Handle connection errors
  socket.on('connect_error', (err) => {
    console.error('Socket connection failed:', err.message);
  });
};

// Function to send a message to the server
const sendMessage = (message) => {
  if (socket.connected) {
    socket.emit('sendMessage', message); // Emit the message event to the server
    console.log('Message sent:', message);
  } else {
    console.error('Cannot send message; socket is not connected!');
  }
};

// Function to listen for incoming messages
const listenForMessages = (callback) => {
  // Ensure the listener is added only once
  if (socket.hasListeners('receiveMessage')) return;

  socket.on('receiveMessage', (message) => {
    callback(message); // Execute the callback when a message is received
    console.log('New message received:', message);
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
export { connectSocket, sendMessage, listenForMessages, disconnectSocket, getSocketStatus };

