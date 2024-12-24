import { io } from 'socket.io-client';

// Initialize Socket.io client with necessary configurations
const socket = io('http://localhost:5000', {
  transports: ['websocket'], // Specifies that WebSocket transport should be used
  autoConnect: false, // Prevent auto connection, you will connect manually
});

// Connect the socket manually when needed
const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
    console.log('Socket connected!');
  }
};

// Emit a message event to send data
const sendMessage = (message) => {
  if (socket.connected) {
    socket.emit('sendMessage', message); // Emit the message to the server
    console.log('Message sent:', message);
  } else {
    console.log('Socket not connected');
  }
};

// Listen for incoming messages from other users
const listenForMessages = (callback) => {
  socket.on('receiveMessage', (message) => {
    console.log('Received message:', message);
    callback(message); // Execute the callback when a new message is received
  });
};

// Handle disconnection
const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log('Socket disconnected');
  }
};

export { connectSocket, sendMessage, listenForMessages, disconnectSocket };
