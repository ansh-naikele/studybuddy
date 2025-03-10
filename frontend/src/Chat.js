import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './chat.css';
import { FiSend, FiX } from 'react-icons/fi';

const Chat = ({ isOpen, onClose, userName }) => {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const roomId = 'study-room-1';

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:1337');
    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      setIsConnected(true);
      setMessages(prev => [...prev, {
        system: true,
        message: '✅ Connected to chat'
      }]);

      // Join room after connection
      newSocket.emit('join_room', {
        roomId,
        userId: userName,
        userName
      });
    });

    newSocket.on('connect_error', () => {
      setIsConnected(false);
      setMessages(prev => [...prev, {
        system: true,
        message: '❌ Connection failed. Please check if server is running.'
      }]);
    });

    // Add welcome message
    setMessages([{
      system: true,
      message: `Welcome, ${userName}! 👋`
    }]);

    // Message events
    newSocket.on('receive_message', (data) => {
      console.log('Received message:', data);  // Debug log
      setMessages(prev => [...prev, data]);
    });

    newSocket.on('user_joined', (data) => {
      console.log('User joined:', data);  // Debug log
      setMessages(prev => [...prev, {
        system: true,
        message: `👤 ${data.userName} has joined the chat`
      }]);
    });

    newSocket.on('user_left', (data) => {
      console.log('User left:', data);  // Debug log
      setMessages(prev => [...prev, {
        system: true,
        message: `👋 ${data.userName} has left the chat`
      }]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && socket && isConnected) {
      console.log('Sending message:', message);  // Debug log
      socket.emit('send_message', {
        roomId,
        message: message.trim(),
        userName
      });
      setMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Chat {isConnected ? '🟢' : '🔴'}</h3>
        <button onClick={onClose} className="close-button">
          <FiX size={20} />
        </button>
      </div>
      
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message ${msg.system ? 'system-message' : 
              (msg.userName === userName ? 'sent' : 'received')}`}
          >
            {!msg.system && <span className="message-user">{msg.userName}</span>}
            <p className="message-content">{msg.message}</p>
            {!msg.system && msg.timestamp && <span className="message-time">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="message-input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
          className="message-input"
          disabled={!isConnected}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!isConnected || !message.trim()}
        >
          <FiSend size={20} />
        </button>
      </form>
    </div>
  );
};

export default Chat;