import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import '../../styles/ChatAdmin.css';

const ChatManagement = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [socket, setSocket] = useState(null);
  const [globalSocket, setGlobalSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load all conversations and setup global socket listener
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/chat/admin/conversations');
        setConversations(response.data);
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();

    // Setup global socket listener for all conversations
    const newGlobalSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newGlobalSocket.emit('user_connect', user.id);

    // Listen for new messages and refresh conversations list
    newGlobalSocket.on('receive_message', async (message) => {
      // Reload conversations to update the list with latest messages
      try {
        const response = await api.get('/chat/admin/conversations');
        setConversations(response.data);
      } catch (error) {
        console.error('Error refreshing conversations:', error);
      }
    });

    setGlobalSocket(newGlobalSocket);

    return () => {
      newGlobalSocket.disconnect();
    };
  }, [user.id]);

  // Load messages and connect socket when conversation selected
  useEffect(() => {
    if (!selectedConversation) {
      if (socket) socket.disconnect();
      setMessages([]);
      return;
    }

    const loadMessagesAndConnect = async () => {
      try {
        setIsLoading(true);
        
        // Load messages
        const response = await api.get(
          `/chat/conversations/${selectedConversation.id}/messages`
        );
        setMessages(response.data);

        // Connect socket
        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        newSocket.emit('user_connect', user.id);
        newSocket.emit('join_conversation', selectedConversation.id);

        newSocket.on('receive_message', (message) => {
          setMessages((prev) => [...prev, message]);
          setOtherUserTyping(false);
        });

        newSocket.on('user_typing', (data) => {
          if (data.userId !== user.id) {
            setOtherUserTyping(data.isTyping);
          }
        });

        setSocket(newSocket);
        setIsLoading(false);

        return () => newSocket.disconnect();
      } catch (error) {
        console.error('Error loading messages:', error);
        setIsLoading(false);
      }
    };

    loadMessagesAndConnect();
  }, [selectedConversation, user.id]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !socket || !selectedConversation) return;

    const messageText = inputValue;
    setInputValue('');

    try {
      // Save to database
      await api.post(
        `/chat/conversations/${selectedConversation.id}/messages`,
        {
          message: messageText,
          senderType: 'admin',
        }
      );

      // Emit via socket
      socket.emit('send_message', {
        conversationId: selectedConversation.id,
        senderId: user.id,
        senderType: 'admin',
        message: messageText,
      });

      // Stop typing indicator
      socket.emit('typing', {
        conversationId: selectedConversation.id,
        userId: user.id,
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

    if (!socket) return;

    // Emit typing indicator
    socket.emit('typing', {
      conversationId: selectedConversation?.id,
      userId: user.id,
      isTyping: true,
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', {
        conversationId: selectedConversation?.id,
        userId: user.id,
        isTyping: false,
      });
    }, 1000);
  };

  const handleCloseConversation = async () => {
    try {
      await api.patch(
        `/chat/admin/conversations/${selectedConversation.id}`,
        {
          status: 'closed',
          adminId: user.id,
        }
      );

      // Update local state
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id ? { ...conv, status: 'closed' } : conv
        )
      );

      setSelectedConversation(null);
    } catch (error) {
      console.error('Error closing conversation:', error);
    }
  };

  return (
    <div className="chat-admin-container">
      {/* Conversations List */}
      <div className="chat-admin-list">
        <div className="chat-admin-list-header">
          <h2>Support Conversations</h2>
          <span className="conversation-count">{conversations.length}</span>
        </div>

        <div className="conversation-items">
          {isLoading && conversations.length === 0 ? (
            <div className="loading-placeholder">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="empty-state">No conversations yet</div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`conversation-item ${
                  selectedConversation?.id === conv.id ? 'active' : ''
                } ${conv.status}`}
              >
                <div className="conversation-item-header">
                  <p className="conversation-customer">
                    {conv.is_guest
                      ? `Guest: ${conv.guest_name}`
                      : `Customer ${conv.customer_id?.slice(0, 8) || 'Unknown'}`}
                  </p>
                  <span className={`status-badge ${conv.status}`}>
                    {conv.status}
                  </span>
                </div>
                {conv.is_guest && (
                  <p className="conversation-email">{conv.guest_email}</p>
                )}
                <p className="conversation-time">
                  {new Date(conv.updated_at).toLocaleDateString()} at{' '}
                  {new Date(conv.updated_at).toLocaleTimeString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-admin-area">
        {selectedConversation ? (
          <>
            <div className="chat-admin-header">
              <div>
                <h3>
                  {selectedConversation.is_guest
                    ? `Guest: ${selectedConversation.guest_name}`
                    : `Customer ${selectedConversation.customer_id?.slice(0, 8) || 'Unknown'}`}
                </h3>
                {selectedConversation.is_guest && (
                  <p className="guest-email">{selectedConversation.guest_email}</p>
                )}
                <p className="status-text">
                  Status: <span className={selectedConversation.status}>{selectedConversation.status}</span>
                </p>
              </div>
              {selectedConversation.status === 'open' && (
                <button
                  onClick={handleCloseConversation}
                  className="close-conversation-btn"
                >
                  Close Chat
                </button>
              )}
            </div>

            <div className="chat-admin-messages">
              {isLoading ? (
                <div className="loading-messages">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="empty-messages">No messages yet. Start the conversation!</div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`admin-message ${msg.sender_type}`}
                  >
                    <div className="admin-message-content">
                      {msg.image_url && (
                        <img src={msg.image_url} alt="shared" />
                      )}
                      {msg.message_text && <p>{msg.message_text}</p>}
                    </div>
                    <span className="admin-message-time">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}

              {otherUserTyping && (
                <div className="admin-message customer">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {selectedConversation.status === 'open' && (
              <form onSubmit={handleSendMessage} className="chat-admin-input-form">
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleTyping}
                  placeholder="Type a response..."
                  className="chat-admin-input"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="chat-admin-send-btn"
                  disabled={isLoading || !inputValue.trim()}
                >
                  Send
                </button>
              </form>
            )}
          </>
        ) : (
          <div className="chat-admin-empty">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatManagement;
