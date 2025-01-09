import React from 'react';

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
  const selectedUser = users.find((user) => user.id === receiverId);

  return (
    <div className='flex-1 flex flex-col bg-gray-50'>
      {receiverId && (
        <div className='chat-window'>
          <h3>Chatting with: {selectedUser?.name}</h3>
          <div className='chat-messages'>
            {messages.map((msg) => (
              <div
                key={msg._id || `${msg.senderId}-${msg.timestamp}`}
                className={msg.senderId === userId ? 'sent' : 'received'}
              >
                <p>{msg.content}</p>
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

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className='chat-input'>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Type a message..'
              required
              className='message-box'
            />
            <input
              type='file'
              onChange={handleFileChange}
              className='file-input'
            />
            {fileName && <p className='file-name'>Selected File: {fileName}</p>}
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
