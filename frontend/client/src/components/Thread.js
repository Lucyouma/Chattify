import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { useParams } from 'react-router-dom';

function Thread() {
  const [threadMessages, setThreadMessages] = useState([]);
  const [reply, setReply] = useState('');
  const { threadId } = useParams(); // Get thread ID from URL params

  // Fetch thread messages
  useEffect(() => {
    const fetchThreadMessages = async () => {
      try {
        const response = await axios.get(`/threads/${threadId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setThreadMessages(response.data);
      } catch (err) {
        console.error('Error fetching thread messages:', err.message);
      }
    };

    fetchThreadMessages();
  }, [threadId]);

  // Handle sending a reply
  const handleSendReply = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `/threads/${threadId}/reply`,
        { content: reply },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        },
      );

      // Update the thread messages with the new reply
      setThreadMessages((prevMessages) => [...prevMessages, response.data]);
      setReply('');
    } catch (err) {
      console.error('Error sending reply:', err.message);
    }
  };

  return (
    <div className='thread-container'>
      <h2>Thread Messages</h2>
      <div className='thread-messages'>
        {threadMessages.map((message) => (
          <div key={message.id} className='thread-message'>
            <p>
              <strong>{message.senderName}</strong>: {message.content}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendReply} className='reply-form'>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder='Write your reply...'
          required
        ></textarea>
        <button type='submit'>Send Reply</button>
      </form>
    </div>
  );
}

export default Thread;
