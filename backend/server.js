const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const multer = require('multer'); // For handling file uploads
const cloudinary = require('cloudinary').v2; // Cloudinary integration
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
connectDB();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'chattify', // Cloudinary folder name
    resource_type: 'auto', // Automatically detect file type
  },
});

const upload = multer({ storage });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Endpoint to handle multimedia uploads
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    res.status(200).json({ 
      url: req.file.path, // Cloudinary URL
      public_id: req.file.filename // File identifier in Cloudinary
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create HTTP server and integrate with Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for incoming messages
  socket.on('sendMessage', (message) => {
    console.log('Message received:', message);
    socket.broadcast.emit('receiveMessage', message); // Broadcast message to other clients
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Define a port
const PORT = process.env.PORT || 5000;

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
