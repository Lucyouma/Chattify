import { io } from 'socket.io-client';

// Initialize Socket.io client with necessary configurations
const socket = io('http://localhost:5000', {
  transports: ['websocket'],  // Specifies that WebSocket transport should be used
  autoConnect: false,         // Prevent auto connection, you will connect manually
  reconnection: true,        // Reconnect automatically if the socket disconnects
  reconnectionAttempts: 5,   // Number of reconnection attempts before giving up
  reconnectionDelay: 1000,   // Delay between reconnection attempts
  reconnectionDelayMax: 5000 // Max delay between reconnection attempts
});

// Connect the socket manually when needed
const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
    console.log('Socket connected!');
  }

  // Ensure message listener is set up once connected
  socket.on('connect', () => {
    console.log('Socket connected with ID:', socket.id);
    // Listen for incoming messages after the socket is connected
    listenForMessages((message) => {
      console.log('Received message:', message);
    });
  });

  // Handle connection errors
  socket.on('connect_error', (err) => {
    console.error('Connection failed: ', err.message);
  });
};

// Emit a message event to send data
const sendMessage = (message) => {
  if (socket.connected) {
    socket.emit('sendMessage', message);  // Emit the message to the server
    console.log('Message sent:', message);
  } else {
    console.error('Socket is not connected!');
  }
};

// Listen for incoming messages from other users
const listenForMessages = (callback) => {
  socket.on('receiveMessage', (message) => {
    callback(message);  // Execute the callback when a new message is received
  });
};

// Handle disconnection
const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log('Socket disconnected');
  } else {
    console.log('Socket is already disconnected');
  }
};

// Optional: Keep track of socket connection state
const getSocketStatus = () => {
  return socket.connected ? 'Connected' : 'Disconnected';
};

export { connectSocket, sendMessage, listenForMessages, disconnectSocket, getSocketStatus };
