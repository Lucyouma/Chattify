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
    <div className='col-md-6 col-lg-7 col-xl-8'>
      {receiverId && (
        <>
          <div
            className='pt-3 pe-3'
            style={{ position: 'relative', height: '400px', overflowY: 'auto' }}
          >
            {messages.map((msg, index) => (
              <div
                key={msg._id || `${msg.senderId}-${msg.timestamp}-${index}`}
                className={`d-flex flex-row justify-content-${
                  msg.senderId === userId ? 'end' : 'start'
                } mb-3`}
              >
                {msg.senderId !== userId && (
                  <img
                    src={
                      selectedUser?.avatar ||
                      'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp'
                    }
                    alt='avatar'
                    style={{ width: '45px', height: '100%' }}
                  />
                )}
                <div>
                  <p
                    className={`small p-2 ${
                      msg.senderId === userId
                        ? 'me-3 bg-primary text-white'
                        : 'ms-3 bg-body-tertiary'
                    } mb-1 rounded-3`}
                  >
                    {msg.content}
                  </p>
                  {msg.multimedia && (
                    <div
                      className={`small ${
                        msg.senderId === userId ? 'me-3' : 'ms-3'
                      } mb-3 rounded-3`}
                    >
                      {msg.multimedia.endsWith('.jpg') ||
                      msg.multimedia.endsWith('.png') ? (
                        <img
                          src={msg.multimedia}
                          alt='attachment'
                          className='img-fluid'
                        />
                      ) : (
                        <a
                          href={msg.multimedia}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-muted'
                        >
                          Download File
                        </a>
                      )}
                    </div>
                  )}
                  <p
                    className={`small text-muted ${
                      msg.senderId === userId ? 'me-3' : 'ms-3'
                    }`}
                  >
                    {msg.timestamp}
                  </p>
                </div>
                {msg.senderId === userId && (
                  <img
                    src='https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp'
                    alt='avatar'
                    style={{ width: '45px', height: '100%' }}
                  />
                )}
              </div>
            ))}
          </div>

          <div className='text-muted d-flex justify-content-start align-items-center pe-3 pt-3 mt-2'>
            <img
              src='https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp'
              alt='avatar'
              style={{ width: '40px', height: '100%' }}
            />
            <input
              type='text'
              className='form-control form-control-lg'
              placeholder='Type a message'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <a className='ms-1 text-muted' href='#!'>
              <i className='fas fa-paperclip'></i>
            </a>
            <a className='ms-3 text-muted' href='#!'>
              <i className='fas fa-smile'></i>
            </a>
            <button
              type='button'
              className='btn btn-primary ms-3'
              onClick={handleSendMessage}
            >
              <i className='fas fa-paper-plane'></i>
            </button>
          </div>
        </>
      )}
    </div>

    // <div className='flex-1 flex flex-col h-full w-full bg-gray-50'>
    //   <div className='flex flex-col h-full w-full'>
    //     <div className='flex flex-col h-full w-full bg-white shadow'>
    //       {/* Chat Header */}
    //       <div className='flex justify-between items-center p-4 border-b'>
    //         <div className='flex items-center'>
    //           <img
    //             src={selectedUser?.avatar || '/api/placeholder/45/45'}
    //             alt='avatar'
    //             className='w-10 h-10 rounded-full'
    //           />
    //           <h5 className='ml-3 font-medium text-gray-800'>
    //             {selectedUser?.email}
    //           </h5>
    //         </div>
    //         <button className='px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700'>
    //           Chat Options
    //         </button>
    //       </div>

    //       {/* Chat Messages */}
    //       <div className='flex-1 overflow-y-auto p-4 space-y-4'>
    //         {messages.map((msg, index) => (
    //           <div
    //             key={msg._id || `${msg.senderId}-${msg.timestamp}-${index}`}
    //             className={`flex ${
    //               msg.senderId === userId ? 'justify-end' : 'justify-start'
    //             }`}
    //           >
    //             {msg.senderId !== userId && (
    //               <img
    //                 src={
    //                   selectedUser?.avatar ||
    //                   'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp'
    //                 }
    //                 alt='avatar'
    //                 className='w-8 h-8 rounded-full flex-shrink-0'
    //               />
    //             )}
    //             <div
    //               className={`max-w-[70%] mx-2 ${
    //                 msg.senderId === userId ? 'order-1' : 'order-2'
    //               }`}
    //             >
    //               <div
    //                 className={`p-3 rounded-lg ${
    //                   msg.senderId === userId
    //                     ? 'bg-blue-600 text-white'
    //                     : 'bg-gray-100 text-gray-800'
    //                 }`}
    //               >
    //                 {msg.content ? (
    //                   <p className='text-sm break-words'>{msg.content}</p>
    //                 ) : (
    //                   <p className='text-sm italic'>No content available</p>
    //                 )}
    //               </div>
    //               {msg.multimedia && (
    //                 <div className='mt-2'>
    //                   {msg.multimedia.endsWith('.jpg') ||
    //                   msg.multimedia.endsWith('.png') ? (
    //                     <img
    //                       src={msg.multimedia}
    //                       alt='attachment'
    //                       className='max-w-full rounded-lg'
    //                     />
    //                   ) : (
    //                     <a
    //                       href={msg.multimedia}
    //                       target='_blank'
    //                       rel='noopener noreferrer'
    //                       className='text-blue-600 hover:underline text-sm'
    //                     >
    //                       Download File
    //                     </a>
    //                   )}
    //                 </div>
    //               )}
    //               <p className='text-xs text-gray-500 mt-1'>
    //                 {new Date(msg.timestamp).toLocaleTimeString()}
    //               </p>
    //             </div>
    //             {msg.senderId === userId && (
    //               <img
    //                 src='https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp'
    //                 alt='avatar'
    //                 className='w-8 h-8 rounded-full flex-shrink-0'
    //               />
    //             )}
    //           </div>
    //         ))}
    //       </div>

    //       {/* Chat Input */}
    //       <div className='border-t mt-auto'>
    //         <form onSubmit={handleSendMessage} className='p-4'>
    //           <div className='flex items-center space-x-4'>
    //             <div className='flex-1'>
    //               <textarea
    //                 value={message}
    //                 onChange={(e) => setMessage(e.target.value)}
    //                 placeholder='Type a message...'
    //                 className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[44px] max-h-32'
    //                 rows='1'
    //                 required
    //               />
    //             </div>
    //             <div className='flex items-center space-x-2 flex-shrink-0'>
    //               <label className='cursor-pointer'>
    //                 <input
    //                   type='file'
    //                   onChange={handleFileChange}
    //                   className='hidden'
    //                 />
    //                 <svg
    //                   className='w-6 h-6 text-gray-500 hover:text-gray-700'
    //                   fill='none'
    //                   stroke='currentColor'
    //                   viewBox='0 0 24 24'
    //                 >
    //                   <path
    //                     strokeLinecap='round'
    //                     strokeLinejoin='round'
    //                     strokeWidth={2}
    //                     d='M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13'
    //                   />
    //                 </svg>
    //               </label>
    //               <button
    //                 type='submit'
    //                 className='p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700'
    //               >
    //                 <svg
    //                   className='w-6 h-6'
    //                   fill='none'
    //                   stroke='currentColor'
    //                   viewBox='0 0 24 24'
    //                 >
    //                   <path
    //                     strokeLinecap='round'
    //                     strokeLinejoin='round'
    //                     strokeWidth={2}
    //                     d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
    //                   />
    //                 </svg>
    //               </button>
    //             </div>
    //           </div>
    //           {fileName && (
    //             <p className='mt-2 text-sm text-gray-600'>
    //               Selected File: {fileName}
    //             </p>
    //           )}
    //         </form>
    //       </div>
    //     </div>
    //   </div>
    // </div>

    ///another
    //////

    // <div className='flex-1 flex flex-col bg-gray-50'>
    //   <div className='h-full max-w-4xl mx-auto w-full'>
    //     <div className='flex flex-col h-full bg-white rounded-lg shadow'>
    //       {/* Chat Header */}
    //       <div className='flex justify-between items-center p-4 border-b'>
    //         <div className='flex items-center'>
    //           <img
    //             src={selectedUser?.avatar || '/api/placeholder/45/45'}
    //             alt='avatar'
    //             className='w-10 h-10 rounded-full'
    //           />
    //           <h5 className='ml-3 font-medium text-gray-800'>
    //             {selectedUser?.email}
    //           </h5>
    //         </div>
    //         <button className='px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700'>
    //           Chat Options
    //         </button>
    //       </div>

    //       {/* Chat Messages */}
    //       <div className='flex-1 overflow-y-auto p-4 space-y-4'>
    //         {messages.map((msg, index) => (
    //           <div
    //             key={msg._id || `${msg.senderId}-${msg.timestamp}-${index}`}
    //             className={`flex ${
    //               msg.senderId === userId ? 'justify-end' : 'justify-start'
    //             }`}
    //           >
    //             {msg.senderId !== userId && (
    //               <img
    //                 src={selectedUser?.avatar || '/api/placeholder/45/45'}
    //                 alt='avatar'
    //                 className='w-8 h-8 rounded-full'
    //               />
    //             )}
    //             <div
    //               className={`max-w-[70%] mx-2 ${
    //                 msg.senderId === userId ? 'order-1' : 'order-2'
    //               }`}
    //             >
    //               <div
    //                 className={`p-3 rounded-lg ${
    //                   msg.senderId === userId
    //                     ? 'bg-blue-600 text-white'
    //                     : 'bg-gray-100 text-gray-800'
    //                 }`}
    //               >
    //                 {msg.content ? (
    //                   <p className='text-sm'>{msg.content}</p>
    //                 ) : (
    //                   <p className='text-sm italic'>No content available</p>
    //                 )}
    //               </div>
    //               {msg.multimedia && (
    //                 <div className='mt-2'>
    //                   {msg.multimedia.endsWith('.jpg') ||
    //                   msg.multimedia.endsWith('.png') ? (
    //                     <img
    //                       src={msg.multimedia}
    //                       alt='attachment'
    //                       className='max-w-full rounded-lg'
    //                     />
    //                   ) : (
    //                     <a
    //                       href={msg.multimedia}
    //                       target='_blank'
    //                       rel='noopener noreferrer'
    //                       className='text-blue-600 hover:underline text-sm'
    //                     >
    //                       Download File
    //                     </a>
    //                   )}
    //                 </div>
    //               )}
    //               <p className='text-xs text-gray-500 mt-1'>
    //                 {new Date(msg.timestamp).toLocaleTimeString()}
    //               </p>
    //             </div>
    //             {msg.senderId === userId && (
    //               <img
    //                 src='/api/placeholder/45/45'
    //                 alt='avatar'
    //                 className='w-8 h-8 rounded-full'
    //               />
    //             )}
    //           </div>
    //         ))}
    //       </div>

    //       {/* Chat Input */}
    //       <form onSubmit={handleSendMessage} className='border-t p-4'>
    //         <div className='flex items-center space-x-4'>
    //           <div className='relative flex-1'>
    //             <textarea
    //               value={message}
    //               onChange={(e) => setMessage(e.target.value)}
    //               placeholder='Type a message...'
    //               className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
    //               rows='1'
    //               required
    //             />
    //           </div>
    //           <div className='flex items-center space-x-2'>
    //             <label className='cursor-pointer'>
    //               <input
    //                 type='file'
    //                 onChange={handleFileChange}
    //                 className='hidden'
    //               />
    //               <svg
    //                 className='w-6 h-6 text-gray-500 hover:text-gray-700'
    //                 fill='none'
    //                 stroke='currentColor'
    //                 viewBox='0 0 24 24'
    //               >
    //                 <path
    //                   strokeLinecap='round'
    //                   strokeLinejoin='round'
    //                   strokeWidth={2}
    //                   d='M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13'
    //                 />
    //               </svg>
    //             </label>
    //             <button
    //               type='submit'
    //               className='p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700'
    //             >
    //               <svg
    //                 className='w-6 h-6'
    //                 fill='none'
    //                 stroke='currentColor'
    //                 viewBox='0 0 24 24'
    //               >
    //                 <path
    //                   strokeLinecap='round'
    //                   strokeLinejoin='round'
    //                   strokeWidth={2}
    //                   d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
    //                 />
    //               </svg>
    //             </button>
    //           </div>
    //         </div>
    //         {fileName && (
    //           <p className='mt-2 text-sm text-gray-600'>
    //             Selected File: {fileName}
    //           </p>
    //         )}
    //       </form>
    //     </div>
    //   </div>
    // </div>

    // <div className='flex-1 flex flex-col bg-gray-50'>
    //   {/* Only display the chat window if a receiver is selected */}
    //   {receiverId && (
    //     <div className='chat-window'>
    //       {/* Chat header with the name of the person you are chatting with */}
    //       <h3 className='chat-header'>Chatting with: {selectedUser?.email}</h3>

    //       {/* Display the chat messages */}
    //       <div className='chat-messages'>
    //         {messages.map((msg, index) => (
    //           <div
    //             key={msg._id || `${msg.senderId}-${msg.timestamp}-${index}`}
    //             className={msg.senderId === userId ? 'sent' : 'received'}
    //           >
    //             <p>{msg.content}</p>
    //             {/* Display media attachments if present */}
    //             {msg.multimedia && (
    //               <div className='chat-media'>
    //                 {msg.multimedia.endsWith('.jpg') ||
    //                 msg.multimedia.endsWith('.png') ? (
    //                   <img
    //                     src={msg.multimedia}
    //                     alt='attachment'
    //                     className='chat-image'
    //                   />
    //                 ) : (
    //                   <a
    //                     href={msg.multimedia}
    //                     target='_blank'
    //                     rel='noopener noreferrer'
    //                     className='chat-file-link'
    //                   >
    //                     Download File
    //                   </a>
    //                 )}
    //               </div>
    //             )}
    //           </div>
    //         ))}
    //       </div>

    //       {/* Message input form */}
    //       <form onSubmit={handleSendMessage} className='chat-input'>
    //         {/* Text area for typing messages */}
    //         <textarea
    //           value={message}
    //           onChange={(e) => setMessage(e.target.value)}
    //           placeholder='Type a message...'
    //           required
    //           className='message-box'
    //         />

    //         {/* File input for uploading files */}
    //         <input
    //           type='file'
    //           onChange={handleFileChange}
    //           className='file-input'
    //         />

    //         {/* Display file name if a file is selected */}
    //         {fileName && <p className='file-name'>Selected File: {fileName}</p>}

    //         {/* Send button */}
    //         <button type='submit' className='send-button'>
    //           Send
    //         </button>
    //       </form>
    //     </div>
    //   )}
    // </div>
  );
};

export default ChatWindow;
