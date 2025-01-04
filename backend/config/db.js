const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using the URI stored in the .env file
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true, // Enables the new MongoDB URI parser (recommended)
      useUnifiedTopology: true, // Enables the new connection management engine (recommended)
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit the process with failure if the connection fails
  }
};

module.exports = connectDB;
