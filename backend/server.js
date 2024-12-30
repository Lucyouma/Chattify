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

// Multer upload configuration with file type validation and size limit (e.g., 10MB)
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') || file.mimetype.startsWith('application/')) {
      cb(null, true); // Accept image, video, and document files
    } else {
      cb(new Error('Only image, video, and document files are allowed!'), false);
    }
  },
});

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
    origin: 'localhost:3000', // Actual frontend URL
    methods: ['GET', 'POST'],
  },
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for incoming messages
  socket.on('sendMessage', (message) => {
    console.log('Message received:', message);
    socket.broadcast.emit('receiveMessage', message); // Broadcast message to others
    socket.emit('messageStatus', { status: 'delivered' }); // Acknowledge message delivery to the sender
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
