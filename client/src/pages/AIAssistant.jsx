import React, { useEffect, useState } from 'react';
import { useAI } from '../context/AIContext';
import ChatWindow from '../components/ChatWindow';
import PromptInput from '../components/PromptInput';
import Card from '../components/Card';
import Button from '../components/Button';
import { Sparkles, MessageSquare, Plus } from 'lucide-react';

export const AIAssistant = () => {
  const {
    conversations,
    currentConversationId,
    messages,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    startNewConversation
  } = useAI();

  const [activeTab, setActiveTab] = useState('chat'); // chat vs logs

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleSend = async (text) => {
    await sendMessage(text);
  };

  const handleSuggestionClick = (text) => {
    if (!loading) {
      sendMessage(text);
    }
  };

  const suggestions = [
    "What tasks are overdue?",
    "Summarize Project Alpha.",
    "What happened in today's meeting?",
    "Generate weekly project report."
  ];

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6 font-sans text-xs bg-slate-50/20 p-2 rounded-xl border border-slate-150">
      
      {/* Left conversation selector panel */}
      <div className="w-full lg:w-64 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 pr-0 lg:pr-6 gap-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 font-bold text-slate-805 uppercase tracking-wider text-[10px]">
            <Sparkles className="h-4 w-4 text-indigo-500" /> AI Conversations
          </span>
          <Button size="xs" onClick={startNewConversation} className="cursor-pointer flex items-center gap-1">
            <Plus className="h-3 w-3" /> New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-48 lg:max-h-none space-y-1">
          {conversations.map((c) => {
            const isActive = c.id === currentConversationId;
            return (
              <button
                key={c.id}
                onClick={() => fetchMessages(c.id)}
                className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-left text-xs font-semibold cursor-pointer transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-650 font-bold border border-indigo-150' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <MessageSquare className={`h-4 w-4 ${isActive ? 'text-indigo-550' : 'text-slate-400'}`} />
                <span className="truncate">{c.title}</span>
              </button>
            );
          })}
          {conversations.length === 0 && (
            <p className="text-center py-6 text-slate-400 italic font-semibold">No assistant chats yet.</p>
          )}
        </div>
      </div>

      {/* Main chat workspace */}
      <div className="flex-1 flex flex-col justify-between min-h-0 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        
        {/* Chat Header */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-xs">CollabSphere Assistant</h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              Context-Aware AI Intelligence Layer
            </p>
          </div>
        </div>

        {/* Suggestion Chips (only on empty conversations) */}
        {messages.length === 0 && (
          <div className="p-6 space-y-4 max-w-xl mx-auto text-center my-auto">
            <div className="inline-flex p-3 bg-indigo-50 rounded-2xl text-indigo-650 border border-indigo-100">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">Ask the CollabSphere Assistant</h4>
              <p className="text-[10px] text-slate-450 leading-relaxed font-semibold mt-1">
                Ask questions about your projects, task states, meeting notes, or schedule reports.
                The assistant accesses context metrics while strictly respecting your data permissions.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-left">
              {suggestions.map((text, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(text)}
                  className="p-3 bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 text-slate-700 font-bold rounded-xl text-[10px] text-left cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages Scroller */}
        {messages.length > 0 && (
          <ChatWindow messages={messages} loading={loading} />
        )}

        {/* Prompt Input Footer */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <PromptInput onSend={handleSend} loading={loading} />
        </div>

      </div>

    </div>
  );
};

export default AIAssistant;
