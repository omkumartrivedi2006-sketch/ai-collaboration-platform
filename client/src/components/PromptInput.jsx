import React, { useState, useRef } from 'react';
import { Send, Square } from 'lucide-react';

export const PromptInput = ({ onSend, onStop, loading = false, placeholder = "Ask AI Assistant..." }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    setInput(e.target.value);
    // Auto grow textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500 font-sans text-xs">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        className="w-full bg-transparent resize-none border-none outline-none pr-10 focus:ring-0 text-slate-700 font-semibold max-h-24 py-0.5"
      />
      <div className="absolute right-2 top-2">
        {loading ? (
          <button
            type="button"
            onClick={onStop}
            className="p-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg cursor-pointer transition-colors"
            title="Stop generation"
          >
            <Square className="h-3.5 w-3.5 fill-white" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-1.5 bg-indigo-650 hover:bg-indigo-750 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-lg cursor-pointer transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </form>
  );
};

export default PromptInput;
