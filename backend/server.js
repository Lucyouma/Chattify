const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/Message');
const protectedRoutes = require('./routes/protectedRoutes');
const multer = require('multer'); // For handling file uploads
const cloudinary = require('cloudinary').v2; // Cloudinary integration
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cors = require('cors'); // CORS middleware
const authenticate = require('./middleware/authMiddleware'); // JWT middleware
const User = require('./models/User'); // Import User model
const Chat = require('./models/Chat'); // Import Chat model
const Message = require('./models/Message'); // Import Message model

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
    origin: 'http://localhost:3000', // Frontend URL (ensure it's correct)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Allows cookies if required
  }),
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
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('video/')
    ) {
      cb(null, true); // Accept image and video files
    } else {
      cb(
        new Error('Only image, video, and document files are allowed!'),
        false,
      );
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

// Endpoint to create or retrieve a chat between two users
app.post('/api/chat', authenticate, async (req, res) => {
  const { recipientId } = req.body; // ID of the user to chat with
  const currentUserId = req.user.id; // The logged-in user's ID (sender)

  if (!recipientId) {
    return res.status(400).json({ error: 'Recipient ID is required' });
  }

  try {
    // Check if a chat already exists between the two users
    let chat = await Chat.findOne({
      users: { $all: [currentUserId, recipientId] }, // Check if both users are in the chat
    });

    // If no chat exists, create a new one
    if (!chat) {
      chat = await Chat.create({
        users: [currentUserId, recipientId],
        messages: [],
      });
    }

    res.json(chat); // Return the chat object
  } catch (err) {
    console.error('Error creating or retrieving chat:', err);
    res
      .status(500)
      .json({ error: 'An error occurred while creating/retrieving the chat' });
  }
});

// Endpoint to retrieve messages for a chat
app.get('/api/chat/:chatId/messages', authenticate, async (req, res) => {
  const { chatId } = req.params;

  try {
    // Fetch messages for the given chat
    const messages = await Message.find({ chatId }).sort({ createdAt: 1 }); // Sort by creation time
    res.json(messages); // Return the messages
  } catch (err) {
    console.error('Error fetching messages:', err);
    res
      .status(500)
      .json({ error: 'An error occurred while fetching messages' });
  }
});

// Endpoint to send a message in a chat
app.post('/api/chat/:chatId/send', authenticate, async (req, res) => {
  const { chatId } = req.params;
  const { content, recipientId } = req.body; // recipientId from the frontend
  const senderId = req.user.id; // The logged-in user's ID

  // Validate the message content
  if (!content) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  try {
    // Fetch the sender from the database
    const sender = await User.findById(senderId);
    if (!sender) {
      return res
        .status(400)
        .json({ error: 'Sender not found in the database.' });
    }

    // Fetch the recipient from the database
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res
        .status(400)
        .json({ error: 'Recipient not found in the database.' });
    }

    // Create and save the new message
    const message = await Message.create({
      chatId,
      sender: senderId,
      receiver: recipientId, // Include recipientId in the message
      content,
      createdAt: new Date(),
    });

    // Optionally push the message to the chat's message array (depends on your schema)
    await Chat.findByIdAndUpdate(chatId, { $push: { messages: message._id } });

    // Emit the message to other users in real-time using Socket.io
    const chat = await Chat.findById(chatId).populate('users', 'name email'); // Populate user details
    req.io.to(chatId).emit('newMessage', message);

    res.status(201).json(message);
  } catch (err) {
    console.error('Error sending message:', err);
    res
      .status(500)
      .json({ error: 'An error occurred while sending the message' });
  }
});

// Create HTTP server and integrate with Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // the frontend URL
    methods: ['GET', 'POST'],
  },
});

// Attach Socket.io to the request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

//initialize activeUsers map
const activeUsers = new Map();

// Socket.io events
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  //register user when they join
  socket.on('registerUser', (userId) => {
    if (!userId) {
      console.error('registeruser called without userid');
      return;
    }
    activeUsers.set(userId, socket.id);
    console.log(`User registered: ${userId} -> ${socket.id}`);
  });

  // Join a chat room
  socket.on('joinChat', (chatId) => {
    if (!chatId) {
      console.error('Chat id required to join a chat');
      return;
    }
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat room: ${chatId}`);
  });

  // Send message to a specific chat room
  // socket.on('sendMessage', (data) => {
  //   const { chatId, message } = data;
  //   io.to(chatId).emit('receiveMessage', message);
  // });
  socket.on('sendMessage', async ({ chatId, content, recepientId }) => {
    const senderId = [...activeUsers.entries()].find(
      ([id, sid]) => sid === socket.id,
    )?.[0];
    if (!senderId) {
      console.error('Sender not found for socket:', socket.id);
      socket.emit('error', 'Sender not registered');
      return;
    }

    try {
      const message = await Message.create({
        chatId,
        sender: senderId,
        receiver: recepientId,
        content,
        createdAt: new Date(),
      });
      console.log('Message saved:', message);
      //update chat with new message
      await Chat.findByIdAndUpdate(chatId, {
        $push: { messages: message._id },
      });
      // emit message to recepient if online
      const recepientSocketId = activeUsers.get(recepientId);
      if (recepientSocketId) {
        io.to(recepientSocketId).emit('receiveMessage', message);
        console.log(`Message sent to ${recepientId}:`, message);
        console.log(`Emitting message to socket: ${recepientSocketId}`);
      } else {
        console.log(`Recepient ${recepientId} is not online.`);
      }
      //Notify sender of sent message
      socket.emit('messageSent', message);
    } catch (err) {
      console.error('Error sending message:', err);
      socket.emit('error', 'Error sending message');
    }
  });
  socket.on('receiveMessage', (message) => {
    console.log('Message received:', message);
    displayMessage(message, 'received');
  });

  socket.on('disconnect', () => {
    const userId = [...activeUsers.entries()].find(
      ([id, sid]) => sid === socket.id,
    )?.[0];
    if (userId) {
      activeUsers.delete(userId);
      console.log(`A user disconnected, ${userId}`);
    } else {
      console.log('Unknown user disconnected:', socket.id);
    }
  });
});

// Define a port
const PORT = process.env.PORT || 5000;

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});