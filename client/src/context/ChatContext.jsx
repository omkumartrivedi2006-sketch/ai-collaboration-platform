import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSocket } from './SocketContext';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/chat/conversations');
      setConversations(res.data.data.conversations || []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const selectConversation = async (conversationId) => {
    setLoading(true);
    try {
      if (activeConversation && socket) {
        socket.emit('leaveConversation', { conversationId: activeConversation.id });
      }

      const detailsRes = await api.get(`/chat/conversations/${conversationId}`);
      setActiveConversation(detailsRes.data.data.conversation || null);

      const msgRes = await api.get(`/chat/messages/${conversationId}`);
      setMessages(msgRes.data.data.messages?.reverse() || []);

      if (socket) {
        socket.emit('joinConversation', { conversationId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageText, parentMessageId = null) => {
    if (!activeConversation) return;
    try {
      const res = await api.post('/chat/messages', {
        conversationId: activeConversation.id,
        message: messageText,
        parentMessageId
      });
      return res.data.data.message;
    } catch (err) {
      toast.error('Failed to send message');
      throw err;
    }
  };

  const uploadFile = async (formData) => {
    if (!activeConversation) return;
    try {
      formData.append('conversationId', activeConversation.id);
      const res = await api.post('/chat/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.data.message;
    } catch (err) {
      toast.error('Failed to upload file');
      throw err;
    }
  };

  const editMessage = async (messageId, newText) => {
    try {
      const res = await api.put(`/chat/messages/${messageId}`, { message: newText });
      return res.data.data.message;
    } catch (err) {
      toast.error('Failed to edit message');
      throw err;
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await api.delete(`/chat/messages/${messageId}`);
    } catch (err) {
      toast.error('Failed to delete message');
      throw err;
    }
  };

  const addReaction = async (messageId, emoji) => {
    try {
      await api.post(`/chat/messages/${messageId}/reactions`, { emoji });
    } catch (err) {
      console.error(err);
    }
  };

  const removeReaction = async (messageId, emoji) => {
    try {
      await api.delete(`/chat/messages/${messageId}/reactions`, { data: { emoji } });
    } catch (err) {
      console.error(err);
    }
  };

  const setTypingState = (isTyping) => {
    if (!socket || !activeConversation) return;
    const event = isTyping ? 'typing' : 'stopTyping';
    socket.emit(event, { conversationId: activeConversation.id });
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('receiveMessage', ({ message }) => {
      if (activeConversation && message.conversationId === activeConversation.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
      fetchConversations();
    });

    socket.on('messageEdited', ({ message }) => {
      if (activeConversation && message.conversationId === activeConversation.id) {
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? message : m))
        );
      }
    });

    socket.on('messageDeleted', ({ messageId, conversationId }) => {
      if (activeConversation && conversationId === activeConversation.id) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      }
    });

    socket.on('typing', ({ conversationId, userId }) => {
      setTypingUsers((prev) => {
        const set = prev[conversationId] ? new Set(prev[conversationId]) : new Set();
        set.add(userId);
        return { ...prev, [conversationId]: set };
      });
    });

    socket.on('stopTyping', ({ conversationId, userId }) => {
      setTypingUsers((prev) => {
        const set = prev[conversationId] ? new Set(prev[conversationId]) : new Set();
        set.delete(userId);
        return { ...prev, [conversationId]: set };
      });
    });

    socket.on('readReceipt', ({ conversationId, userId, readAt }) => {
      if (activeConversation && conversationId === activeConversation.id) {
        setActiveConversation((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            members: prev.members.map((m) =>
              m.userId === userId ? { ...m, lastReadAt: readAt } : m
            )
          };
        });
      }
    });

    socket.on('reactionAdded', ({ messageId, userId, emoji, conversationId }) => {
      if (activeConversation && conversationId === activeConversation.id) {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== messageId) return m;
            const reactionExists = m.reactions?.some(
              (r) => r.userId === userId && r.emoji === emoji
            );
            if (reactionExists) return m;
            return {
              ...m,
              reactions: [...(m.reactions || []), { userId, emoji, messageId }]
            };
          })
        );
      }
    });

    socket.on('reactionRemoved', ({ messageId, userId, emoji, conversationId }) => {
      if (activeConversation && conversationId === activeConversation.id) {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== messageId) return m;
            return {
              ...m,
              reactions: (m.reactions || []).filter(
                (r) => !(r.userId === userId && r.emoji === emoji)
              )
            };
          })
        );
      }
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('messageEdited');
      socket.off('messageDeleted');
      socket.off('typing');
      socket.off('stopTyping');
      socket.off('readReceipt');
      socket.off('reactionAdded');
      socket.off('reactionRemoved');
    };
  }, [socket, activeConversation, fetchConversations]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        typingUsers: activeConversation ? Array.from(typingUsers[activeConversation.id] || []) : [],
        loading,
        fetchConversations,
        selectConversation,
        sendMessage,
        uploadFile,
        editMessage,
        deleteMessage,
        addReaction,
        removeReaction,
        setTypingState
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  return context;
};

export default ChatContext;
