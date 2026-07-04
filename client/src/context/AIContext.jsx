import React, { createContext, useContext, useState, useCallback } from 'react';
import aiService from '../services/aiService';
import toast from 'react-hot-toast';

const AIContext = createContext(null);

export const AIProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await aiService.getConversations();
      setConversations(data.conversations || []);
    } catch (e) {
      console.error('Failed to load AI conversations:', e);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId) => {
    setLoading(true);
    try {
      const data = await aiService.getConversationMessages(conversationId);
      setMessages(data.messages || []);
      setCurrentConversationId(conversationId);
      return data.messages;
    } catch (e) {
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  }, []);

  const startNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  const sendMessage = async (messageText) => {
    // Optimistic User Message Update
    const tempUserMsg = {
      id: Math.random().toString(36).substring(7),
      role: 'USER',
      content: messageText,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const data = await aiService.chat(currentConversationId, messageText);
      
      // Update with exact message logs from database
      if (!currentConversationId) {
        setCurrentConversationId(data.conversationId);
        fetchConversations();
      }
      
      const updatedMessages = await aiService.getConversationMessages(data.conversationId);
      setMessages(updatedMessages.messages || []);
      return data;
    } catch (e) {
      toast.error('AI assistant request failed');
      // Remove the optimistically added user message to keep state clean
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
    } finally {
      setLoading(false);
    }
  };

  const translateText = async (text, targetLanguage) => {
    try {
      const data = await aiService.translate(text, targetLanguage);
      return data.translatedText;
    } catch (e) {
      toast.error('Translation service failed');
      throw e;
    }
  };

  const summarizeMeetingAI = async (meetingId) => {
    setLoading(true);
    try {
      const data = await aiService.summarizeMeeting(meetingId);
      toast.success('Meeting summarized successfully');
      return data.report;
    } catch (e) {
      toast.error('Summarizer service failed');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const generateTasksFromAI = async (summaryText) => {
    setLoading(true);
    try {
      const data = await aiService.generateTasks(summaryText);
      toast.success('Suggested tasks structured');
      return data.tasks;
    } catch (e) {
      toast.error('Tasks generator failed');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const generateReportAI = async (projectId, reportType) => {
    setLoading(true);
    try {
      const data = await aiService.projectReport(projectId, reportType);
      toast.success('Project report compiled');
      return data.report;
    } catch (e) {
      toast.error('Report generator failed');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const summarizeDocAI = async (content, filename) => {
    setLoading(true);
    try {
      const data = await aiService.documentSummary(content, filename);
      toast.success('Document audit complete');
      return data.report;
    } catch (e) {
      toast.error('Document summarizer failed');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = useCallback(async () => {
    try {
      const data = await aiService.getReports();
      setReports(data.reports || []);
    } catch (e) {
      console.error('Failed to fetch reports:', e);
    }
  }, []);

  return (
    <AIContext.Provider
      value={{
        conversations,
        currentConversationId,
        messages,
        reports,
        loading,
        fetchConversations,
        fetchMessages,
        sendMessage,
        startNewConversation,
        translateText,
        summarizeMeetingAI,
        generateTasksFromAI,
        generateReportAI,
        summarizeDocAI,
        fetchReports
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export default AIContext;
