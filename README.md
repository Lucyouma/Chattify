# **Chattify**
Chattify is a feature-rich chat application that enables real-time communication. The app offers functionalities such as messaging, multimedia sharing, user authentication, and threaded conversations. This README file provides a detailed explanation of my project, including how to set it up, the purpose of each function, and how it works. 
________________________________________
# **Contents**
	Features
	Project Structure
	Setup Instructions
	Environment Variables
	Detailed Explanation of Functions
	Running the Application
	Testing
________________________________________
# **Features**
	User Authentication: Secure login and registration using JWT.
	Real-time Messaging: Instant communication using Socket.IO.
	Multimedia Sharing: Support for image and file uploads.
	Threaded Conversations: Organized message threads for better communication.
	Cloud Storage: Images and files are stored in Cloudinary.
________________________________________
# **Project Structure**
Chattify/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── messageController.js
│   │   └── threadController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Message.js
│   │   └── Thread.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── messageRoutes.js
│   │   └── threadRoutes.js
│   ├── utils/
│   ├── server.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
└── README.md
________________________________________
# **Setup Instructions**
	Node.js: Version 20 or higher
	MongoDB: Version 6 or higher
	Cloudinary Account (for multimedia storage)

**Steps**
1.	Clone the Repository
2.	git clone my Chattify Repository.
3.	cd Chattify/backend
4.	Install Dependencies
5.	npm install
6.	Set Up MongoDB: Ensure MongoDB is running locally or provide a connection string in the .env file.
7.	Configure Environment Variables: Create a .env file in the backend directory:
8.	MONGO_URI=<My MongoDB connection string>
9.	JWT_SECRET=<My secret key>
10.	CLOUDINARY_CLOUD_NAME=<My Cloudinary cloud name>
11.	CLOUDINARY_API_KEY=<My Cloudinary API key>
12.	CLOUDINARY_API_SECRET=<My Cloudinary API secret>
13.	Start the Server
14.	node server.js
15.	Run the Frontend: Navigate to the frontend directory, install dependencies, and start the React app:
16.	cd ../frontend
17.	npm install
18.	npm start
________________________________________
# **Environment Variables**
Here are the environment variables required to run the project:
	MONGO_URI: MongoDB connection string.
	JWT_SECRET: Secret key for JSON Web Tokens.
	CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET: Cloudinary credentials for file storage.
________________________________________

# **Detailed Explanation of Functions**
**Backend**

**1. Database Connection (config/db.js)**
	Function: connectDB
	Purpose: Connects to MongoDB using Mongoose.
	Code: 
	const mongoose = require('mongoose');
	require('dotenv').config();
	
	const connectDB = async () => {
	  try {
	    const conn = await mongoose.connect(process.env.MONGO_URI, {
	      useNewUrlParser: true,
	      useUnifiedTopology: true,
	    });
	    console.log(`MongoDB connected: ${conn.connection.host}`);
	  } catch (error) {
	    console.error(`Error connecting to MongoDB: ${error.message}`);
	    process.exit(1);
	  }
	};
	
	module.exports = connectDB;
	How It Works: 
	Uses mongoose.connect to establish a connection to MongoDB.
	Logs a success message on connection or exits the process if it fails.

**2. User Model (models/User.js)**
	Purpose: Defines the schema for users.
	Code: 
	const mongoose = require('mongoose');
	
	const userSchema = new mongoose.Schema({
	  name: { type: String, required: true },
	  email: { type: String, required: true, unique: true },
	  password: { type: String, required: true },
	});
	
	const User = mongoose.model('User', userSchema);
	module.exports = User;

**3. Authentication Controller (controllers/authController.js)**
	Purpose: Handles user registration and login.
	Key Functions: 
	registerUser: Saves a new user to the database.
	loginUser: Authenticates a user and returns a JWT token.

**4. Real-Time Messaging (using Socket.IO)**
	Code (server.js): 
	const io = require('socket.io')(server, {
	    cors: {
	    origin: '*',
	  },
	});
	
	io.on('connection', (socket) => {
	  console.log('User connected');
	
	  socket.on('sendMessage', (message) => {
	    io.emit('receiveMessage', message);
	  });
	
	  socket.on('disconnect', () => {
	    console.log('User disconnected');
	  });
	});
________________________________________
# **Running the Application**
	Start the backend server
	cd backend
	node server.js
	Start the frontend React app
	cd ../frontend/client
	npm start
	Open my app in a browser at http://localhost:3000.
________________________________________
# **Testing**
	Use jest and supertest for backend testing.
	Run tests: 
	npm test
