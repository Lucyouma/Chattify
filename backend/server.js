const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/Message'); // Import message routes
const protectedRoutes = require('./routes/protectedRoutes'); // Protected routes
const multer = require('multer'); // For handling file uploads
const cloudinary = require('cloudinary').v2; // Cloudinary integration
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cors = require('cors'); // CORS middleware
const authenticate = require('./middleware/authMiddleware'); // JWT middleware
const User = require('./models/User'); // Import User model

// Load environment variables from .env
dotenv.config();

// Initialize Express app
const app = express();

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to Chattify Backend!');
});

// Middleware to parse JSON
app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin: 'http://localhost:3000', // My Frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Allows cookies
  })
);

// Connect to MongoDB
connectDB()
  .then(() => console.log('MongoDB connection successful'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

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

// Multer upload configuration with file type validation and size limit
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true); // Accept image and video files
    } else {
      cb(new Error('Only image, video, and document files are allowed!'), false);    
    }
  },
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/messages', messageRoutes); // Add message routes
app.use('/api/protected', protectedRoutes); // Use JWT middleware for protected routes

// Endpoint to handle multimedia uploads
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    res.status(200).json({
      url: req.file.path, // Cloudinary URL
      public_id: req.file.filename, // File identifier in Cloudinary
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new route to get the list of all users, excluding the logged-in user
app.get('/api/users', authenticate, async (req, res) => {
  try {
    // Fetch all users except the currently authenticated user (req.user.id)
    const users = await User.find({ _id: { $ne: req.user.id } });
    res.json(users); // Send the list of users as a response
  } catch (err) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Create HTTP server and integrate with Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Ensure this is the correct frontend URL
    methods: ['GET', 'POST'],
  },
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for incoming messages
  socket.on('sendMessage', (message) => {
    console.log('Message received:', message);
    // Broadcast message to all connected users
    io.emit('receiveMessage', message); // Broadcast message to all users
    socket.emit('messageStatus', { status: 'delivered' }); // Acknowledge message delivery
  });

  // Handle user disconnection
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
