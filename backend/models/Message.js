const mongoose = require('mongoose');

// Define the schema for the Message model
const messageSchema = new mongoose.Schema(
  {
    // Sender of the message (User who is sending the message)
    sender: {
      type: mongoose.Schema.Types.ObjectId, // ObjectId referencing the User model
      ref: 'User', // Reference to the 'User' model for sender information
      required: true, // The sender is mandatory for every message
    },
    
    // Receiver of the message (User who is receiving the message)
    receiver: {
      type: mongoose.Schema.Types.ObjectId, // ObjectId referencing the User model
      ref: 'User', // Reference to the 'User' model for receiver information
      required: true, // The receiver is mandatory for every message
    },
    
    // Content of the message (Text message content)
    content: {
      type: String, // The message content is a string
      required: false, // Not required if the message contains only multimedia (e.g., image, video, etc.)
    },
    
    // Multimedia file (e.g., image, video, document)
    multimedia: {
      type: String, // URL or path to the multimedia file (e.g., Cloudinary URL or local storage path)
      required: false, // Not required for text-only messages
    },
    
    // Timestamp of when the message is created
    timestamp: {
      type: Date, // Date object to store when the message was sent
      default: Date.now, // Default to the current date and time when the message is created
    },
  },
  { timestamps: true } // This option adds 'createdAt' and 'updatedAt' fields automatically
);

// Create the Message model based on the schema
const Message = mongoose.model('Message', messageSchema);

// Export the Message model for use in other files
module.exports = Message;