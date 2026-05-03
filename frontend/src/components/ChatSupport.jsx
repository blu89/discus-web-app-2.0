import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import '../styles/ChatSupport.css';

const ChatSupport = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestFormError, setGuestFormError] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  // Initialize conversation and socket
  useEffect(() => {
    if (!isOpen) return;

    const initChat = async () => {
      try {
        setIsLoading(true);
        
        let conversationData = {};
        
        // If user is authenticated, use their ID
        if (user) {
          conversationData = {};
        } else {
          // Guest user - check if we have stored guest info
          const storedGuestId = sessionStorage.getItem('guestId');
          const storedGuestEmail = sessionStorage.getItem('guestEmail');
          const storedGuestName = sessionStorage.getItem('guestName');
          
          if (storedGuestId && storedGuestEmail) {
            // Continue existing guest conversation
            conversationData = {
              guestEmail: storedGuestEmail,
              guestName: storedGuestName
            };
          } else {
            // Need to show guest form
            setShowGuestForm(true);
            setIsLoading(false);
            return;
          }
        }

        // Get or create conversation
        const response = await api.post('/chat/conversations', conversationData);
        setConversation(response.data);
        
        // Store guest info if not authenticated
        if (!user && response.data.guest_email) {
          sessionStorage.setItem('guestId', response.data.guest_id);
          sessionStorage.setItem('guestEmail', response.data.guest_email);
          sessionStorage.setItem('guestName', response.data.guest_name);
        }

        // Get existing messages
        const messagesResponse = await api.get(
          `/chat/conversations/${response.data.id}/messages`
        );
        setMessages(messagesResponse.data);

        // Connect socket
        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        const socketUserId = user?.id || response.data.guest_id;
        newSocket.emit('user_connect', socketUserId);
        newSocket.emit('join_conversation', response.data.id);

        newSocket.on('receive_message', (message) => {
          setMessages((prev) => [...prev, message]);
          setOtherUserTyping(false);
        });

        newSocket.on('user_typing', (data) => {
          if (data.userId !== socketUserId) {
            setOtherUserTyping(data.isTyping);
          }
        });

        newSocket.on('user_online', (data) => {
          console.log('User online:', data.userId);
        });

        newSocket.on('disconnect', () => {
          console.log('Disconnected from chat server');
        });

        socketRef.current = newSocket;
        setSocket(newSocket);
        setIsLoading(false);

        return () => {
          newSocket.disconnect();
        };
      } catch (error) {
        console.error('Chat initialization error:', error);
        setIsLoading(false);
      }
    };

    initChat();
  }, [user, isOpen, showGuestForm]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleGuestFormSubmit = async (e) => {
    e.preventDefault();
    setGuestFormError('');

    if (!guestEmail.trim() || !guestName.trim()) {
      setGuestFormError('Email and name are required');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
      setGuestFormError('Please enter a valid email');
      return;
    }

    try {
      setIsLoading(true);

      // Create guest conversation
      const response = await api.post('/chat/conversations', {
        guestEmail: guestEmail.trim(),
        guestName: guestName.trim()
      });

      setConversation(response.data);
      sessionStorage.setItem('guestId', response.data.guest_id);
      sessionStorage.setItem('guestEmail', response.data.guest_email);
      sessionStorage.setItem('guestName', response.data.guest_name);

      // Get existing messages
      const messagesResponse = await api.get(
        `/chat/conversations/${response.data.id}/messages`
      );
      setMessages(messagesResponse.data);

      // Connect socket
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      newSocket.emit('user_connect', response.data.guest_id);
      newSocket.emit('join_conversation', response.data.id);

      newSocket.on('receive_message', (message) => {
        setMessages((prev) => [...prev, message]);
        setOtherUserTyping(false);
      });

      newSocket.on('user_typing', (data) => {
        if (data.userId !== response.data.guest_id) {
          setOtherUserTyping(data.isTyping);
        }
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
      setShowGuestForm(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Error starting guest chat:', error);
      setGuestFormError('Failed to start chat. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !socketRef.current || !conversation) return;

    const messageText = inputValue;
    setInputValue('');

    try {
      const senderType = user ? 'customer' : 'guest';
      const guestNameForMsg = !user ? (sessionStorage.getItem('guestName') || 'Guest') : null;

      // Add message to UI immediately (optimistic update)
      const optimisticMessage = {
        id: Date.now(), // Temporary ID
        message: messageText,
        senderType,
        sender_id: user?.id || conversation.guest_id,
        guest_name: guestNameForMsg,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMessage]);

      // Save to database
      await api.post(`/chat/conversations/${conversation.id}/messages`, {
        message: messageText,
        senderType,
        guestName: guestNameForMsg
      });

      // Emit via socket
      socketRef.current.emit('send_message', {
        conversationId: conversation.id,
        senderId: user?.id || conversation.guest_id,
        senderType,
        message: messageText,
      });

      // Stop typing indicator
      socketRef.current.emit('typing', {
        conversationId: conversation.id,
        userId: user?.id || conversation.guest_id,
        isTyping: false,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setInputValue(messageText); // Restore input on error
    }
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (!socketRef.current || !conversation) return;

    // Emit typing indicator
    socketRef.current.emit('typing', {
      conversationId: conversation.id,
      userId: user?.id || conversation.guest_id,
      isTyping: true,
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('typing', {
        conversationId: conversation.id,
        userId: user?.id || conversation.guest_id,
        isTyping: false,
      });
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chat-floating-btn"
          title="Open support chat"
        >
          💬
        </button>
      )}

      {/* Chat Modal */}
      {isOpen && (
        <div className="chat-modal">
          {/* Header */}
          <div className="chat-header">
            <h3 className="chat-title">Support Chat</h3>
            <button
              onClick={() => {
                setIsOpen(false);
                setShowGuestForm(false);
              }}
              className="chat-close-btn"
              title="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Guest Form */}
          {showGuestForm && (
            <div className="chat-guest-form">
              <h4>Start a Conversation</h4>
              <form onSubmit={handleGuestFormSubmit}>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="chat-guest-input"
                  disabled={isLoading}
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="chat-guest-input"
                  disabled={isLoading}
                />
                {guestFormError && (
                  <p className="chat-guest-error">{guestFormError}</p>
                )}
                <button
                  type="submit"
                  className="chat-guest-submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Starting...' : 'Start Chat'}
                </button>
              </form>
            </div>
          )}

          {/* Messages Container */}
          {!showGuestForm && (
            <>
              <div className="chat-messages">
                {isLoading ? (
                  <div className="chat-loading">
                    <p>Loading chat...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <p className="chat-empty">
                    Start a conversation with our support team
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`chat-message ${
                        msg.sender_type === 'customer' || msg.sender_type === 'guest' ? 'customer' : 'admin'
                      }`}
                    >
                      <div className="chat-message-content">
                        {msg.image_url && (
                          <img
                            src={msg.image_url}
                            alt="shared"
                            className="chat-message-image"
                          />
                        )}
                        {msg.message_text && <p>{msg.message_text}</p>}
                      </div>
                      <span className="chat-message-time">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))
                )}

                {otherUserTyping && (
                  <div className="chat-message admin">
                    <div className="chat-typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="chat-input-form">
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="chat-input"
                  disabled={isLoading || !conversation}
                />
                <button
                  type="submit"
                  className="chat-send-btn"
                  disabled={isLoading || !conversation || !inputValue.trim()}
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatSupport;
