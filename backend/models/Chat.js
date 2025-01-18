const mongoose = require('mongoose');

// Define the schema for the chat message
const chatSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, 'Message content is required'],  // Ensure message is provided
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender ID is required'],  // Ensure sender is provided
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Receiver ID is required'],  // Ensure receiver is provided
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Thread'
  },
  multimedia: {
    type: String
  },
}, {
  // Automatically validate before saving
  timestamps: true,
});

// Add a custom method for better error handling during message creation
chatSchema.methods.handleError = function (err) {
  if (err.name === 'ValidationError') {
    const validationErrors = Object.values(err.errors).map((error) => error.message);
    return { status: 400, message: validationErrors.join(', ') };
  } else {
    return { status: 500, message: 'Internal server error, please try again.' };
  }
};

// Create the Chat model using the schema
const Chat = mongoose.model('Chat', chatSchema);

// Define the static method for message creation with error handling
chatSchema.statics.createMessage = async function (messageData) {
  try {
    const newMessage = new this(messageData);
    await newMessage.save();
    return newMessage;
  } catch (err) {
    throw this.handleError(err); // Handle validation or other errors
  }
};

// Export the model
module.exports = Chat;
