import React, { useEffect, useRef } from 'react';
import useAuth from '../hooks/useAuth';
import Avatar from './Avatar';
import MarkdownRenderer from './MarkdownRenderer';
import Loader from './Loader';

export const ChatWindow = ({ messages = [], loading = false }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, loading]);

  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-4 font-sans text-xs bg-slate-50/20 max-h-[500px]">
      {messages.map((m) => {
        const isAssistant = m.role === 'ASSISTANT' || m.role === 'SYSTEM';
        return (
          <div key={m.id} className={`flex items-start gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
            {isAssistant && (
              <div className="flex-shrink-0 bg-indigo-50 border border-indigo-150 p-1.5 rounded-lg text-indigo-600 font-bold text-[9px] uppercase tracking-wide">
                AI
              </div>
            )}
            <div className={`max-w-[75%] rounded-xl p-3 border ${
              isAssistant ? 'bg-white border-slate-200 text-slate-800' : 'bg-indigo-650 border-indigo-700 text-white'
            }`}>
              {isAssistant ? (
                <MarkdownRenderer content={m.content} />
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed font-semibold">{m.content}</p>
              )}
            </div>
            {!isAssistant && (
              <Avatar src={user?.avatar} name={user?.name} size="sm" />
            )}
          </div>
        );
      })}
      {loading && (
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 bg-indigo-50 border border-indigo-155 p-1.5 rounded-lg text-indigo-600 font-bold text-[9px] uppercase tracking-wide animate-pulse">
            AI
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <Loader size="xs" message="AI is processing..." />
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;
