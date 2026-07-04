import React, { useState, useRef } from 'react';
import { Send, Paperclip, X, Image as ImageIcon } from 'lucide-react';
import Button from './Button';

const MessageInput = ({ onSendMessage, onFileUpload, onTypingChange, replyTo, onClearReply }) => {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setText(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      onTypingChange(true);
    }

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      setIsTyping(false);
      onTypingChange(false);
    }, 2000);
    setTypingTimeout(timeout);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (typingTimeout) clearTimeout(typingTimeout);
    setIsTyping(false);
    onTypingChange(false);

    onSendMessage(text);
    setText('');
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    
    await onFileUpload(formData);
    e.target.value = '';
  };

  return (
    <div className="border-t border-slate-100 p-3 bg-white space-y-2">
      {/* Reply Banner */}
      {replyTo && (
        <div className="flex justify-between items-center bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-[10px] text-slate-500 font-bold">
          <span className="truncate">Replying to {replyTo.sender?.name}: "{replyTo.message}"</span>
          <button onClick={onClearReply} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <button
          type="button"
          onClick={handleFileClick}
          className="p-2 text-slate-400 hover:text-indigo-650 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
          title="Attach File"
        >
          <Paperclip className="h-4.5 w-4.5" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,application/pdf,application/zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        />

        <input
          type="text"
          value={text}
          onChange={handleChange}
          placeholder={replyTo ? 'Type your reply...' : 'Type a message...'}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
        />

        <Button type="submit" disabled={!text.trim()} size="sm" className="px-3 py-2 rounded-xl">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default MessageInput;
