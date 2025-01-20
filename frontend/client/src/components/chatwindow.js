import React from 'react';

/**
 * ChatWindow Component
 * This component handles the display of messages, the message input box,
 * and file attachments. It also manages the user interface for sending messages.
 *
 * Props:
 * - messages (array): List of chat messages to display
 * - userId (string): ID of the logged-in user
 * - receiverId (string): ID of the user currently being chatted with
 * - users (array): List of all users (excluding current user)
 * - message (string): The current message being typed
 * - setMessage (function): Function to update the message state
 * - handleSendMessage (function): Function to send the message
 * - handleFileChange (function): Function to handle file input changes
 * - fileName (string): Name of the selected file for attachment
 */
const ChatWindow = ({
  messages = [],
  userId,
  receiverId,
  users = [],
  message,
  setMessage,
  handleSendMessage,
  handleFileChange,
  fileName,
}) => {
  // Find the user object for the selected receiver
  const selectedUser = users.find(
    (user) => String(user._id) === String(receiverId),
  );
  //   || {
  //     name: 'Yourself',
  //   };
  console.log('Messages:', messages);

  console.log('Receiver is id ', receiverId);

  return (
    <div className='flex-1 flex flex-col bg-gray-50'>
      {/* Only display the chat window if a receiver is selected */}
      {receiverId && (
        <div className='chat-window'>
          {/* Chat header with the name of the person you are chatting with */}
          <h3 className='chat-header'>Chatting with: {selectedUser?.email}</h3>

          {/* Display the chat messages */}
          <div className='chat-messages'>
            {messages.map((msg, index) => (
              <div
                key={msg._id || `${msg.senderId}-${msg.timestamp}-${index}`}
                className={msg.senderId === userId ? 'sent' : 'received'}
              >
                {/* <p>{msg.content}</p> */}
                {msg.content ? (
                  <p className='message-content'>{msg.content}</p>
                ) : (
                  <p className='message-placeholder'>No content available</p>
                )}
                {/* Display media attachments if present */}
                {msg.multimedia && (
                  <div className='chat-media'>
                    {msg.multimedia.endsWith('.jpg') ||
                    msg.multimedia.endsWith('.png') ? (
                      <img
                        src={msg.multimedia}
                        alt='attachment'
                        className='chat-image'
                      />
                    ) : (
                      <a
                        href={msg.multimedia}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='chat-file-link'
                      >
                        Download File
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Message input form */}
          <form onSubmit={handleSendMessage} className='chat-input'>
            {/* Text area for typing messages */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Type a message...'
              required
              className='message-box'
            />

            {/* File input for uploading files */}
            <input
              type='file'
              onChange={handleFileChange}
              className='file-input'
            />

            {/* Display file name if a file is selected */}
            {fileName && <p className='file-name'>Selected File: {fileName}</p>}

            {/* Send button */}
            <button type='submit' className='send-button'>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
