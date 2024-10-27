'use client';
import { useState, useEffect, useRef } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase'; // Import your Firebase config

export default function Chatbox({ userId }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false); // Add state for minimized status
  const messageInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ________________________FETCH CHAT HISTORY ON LOAD________________________
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!userId) return;

      try {
        // Firestore query to find chat history by userId
        const chatQuery = query(
          collection(db, 'chatHistory'),
          where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(chatQuery);

        if (!querySnapshot.empty) {
          // Get the most recent chat (adjust this logic as per your requirements)
          const chatData = querySnapshot.docs[0].data();
          const savedMessages = chatData.messageHistory || [];

          // Set messages to saved history
          setMessages(savedMessages);
        } else {
          // Set default welcome message if no chat history exists
          setMessages([{ role: 'assistant', content: "Hi! How can I help you today?" }]);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    fetchChatHistory();
  }, [userId]);

  // ________________________SEND MESSAGE FUNCTION________________________
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim() || isLoading) return;
    setIsLoading(true);

    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    try {
      const response = await fetch('/api/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          messages: [...messages, { role: 'user', content: message }],
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      const content = result.content || 'No response content';

      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);
        return [
          ...otherMessages,
          { ...lastMessage, content: content },
        ];
      });
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ]);
    }
    setMessage('');
    setIsLoading(false);

    setTimeout(() => {
      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
    }, 100);
  };

  // Auto scroll function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChatbox = () => {
    setIsMinimized(!isMinimized); // Toggle minimized state
  };

  return (
    <div style={isMinimized ? styles.minimizedChatbox : styles.chatbox}>
      <div style={styles.header} onClick={toggleChatbox}>
        <div style={styles.arrow}>
          {isMinimized ? '▼' : '▲'} {/* V-shaped arrow for minimizing */}
        </div>
        Chat
      </div>
      {!isMinimized && (
        <>
          <div style={styles.chatHistory}>
            {messages.map((msg, index) => (
              <div key={index} style={msg.role === 'user' ? styles.userMessage : styles.aiMessage}>
                {msg.content}
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} style={styles.form}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={styles.input}
              placeholder="Type your message..."
              ref={messageInputRef}
            />
            <button type="submit" style={styles.button}>Send</button>
          </form>
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

const styles = {
  chatbox: {
    position: 'fixed',
    bottom: '4px',
    right: '3px',
    width: '300px',
    height: '350px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    transition: 'height 0.3s ease, opacity 0.3s ease', // Add transition for smooth effect
  },
  minimizedChatbox: {
    position: 'fixed',
    bottom: '20px',
    right: '3px',
    width: '300px',
    height: '4px', // Height for minimized state
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#007bff', // Match header color
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    transition: 'height 0.3s ease, opacity 0.3s ease', // Add transition for smooth effect
  },
  header: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%', // Ensure header takes full width
  },
  arrow: {
    fontSize: '16px',
    marginRight: '10px',
  },
  chatHistory: {
    flexGrow: 1,
    overflowY: 'auto',
    marginBottom: '10px',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1e7dd',
    padding: '8px',
    borderRadius: '5px',
    margin: '5px 0',
    maxWidth: '70%',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f8d7da',
    padding: '8px',
    borderRadius: '5px',
    margin: '5px 0',
    maxWidth: '70%',
  },
  form: {
    display: 'flex',
  },
  input: {
    flexGrow: 1,
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    marginRight: '5px',
  },
  button: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#007bff',
    color: '#fff',
    cursor: 'pointer',
  },
};