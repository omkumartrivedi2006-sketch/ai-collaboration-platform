import React, { useEffect, useRef, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { useChat } from '../context/ChatContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import Loader from './Loader';
import { Hash, Phone, Video, Search } from 'lucide-react';
import Avatar from './Avatar';

const ChatWindow = () => {
  const { user } = useAuth();
  const {
    activeConversation,
    messages,
    typingUsers,
    loading,
    sendMessage,
    uploadFile,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    setTypingState
  } = useChat();

  const [replyTarget, setReplyTarget] = useState(null);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const handleSendMessage = async (text) => {
    await sendMessage(text, replyTarget?.id);
    setReplyTarget(null);
  };

  const handleFileUpload = async (formData) => {
    if (replyTarget) {
      formData.append('parentMessageId', replyTarget.id);
    }
    await uploadFile(formData);
    setReplyTarget(null);
  };

  const getDirectChatHeader = () => {
    const otherMember = activeConversation?.members.find(m => m.userId !== user?.id);
    return {
      title: otherMember?.user?.name || 'Direct Chat',
      subtitle: otherMember?.user?.isOnline ? 'Online' : 'Offline',
      avatar: otherMember?.user?.avatar
    };
  };

  const getTypingText = () => {
    if (!typingUsers || typingUsers.length === 0) return null;
    const names = typingUsers
      .map((uid) => {
        const member = activeConversation?.members.find((m) => m.userId === uid);
        return member?.user?.name || 'Someone';
      })
      .filter((name) => name !== 'Someone');

    if (names.length === 0) return null;
    if (names.length === 1) return `${names[0]} is typing...`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
    return 'Several users are typing...';
  };

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 text-slate-400 font-sans p-6 text-center select-none">
        <Hash className="h-10 w-10 text-slate-300 mb-2 stroke-[1.5]" />
        <h3 className="text-sm font-bold text-slate-700">No conversation selected</h3>
        <p className="text-xs text-slate-400 max-w-xs font-semibold mt-1">
          Choose a channel or direct message thread from the sidebar list to start collaborating in real time.
        </p>
      </div>
    );
  }

  const isDirect = activeConversation.type === 'DIRECT';
  const header = isDirect ? getDirectChatHeader() : { title: activeConversation.name, subtitle: 'Channel Conversation' };

  return (
    <div className="flex-1 flex flex-col h-[75vh] bg-white border border-slate-100 rounded-xl overflow-hidden shadow-2xs font-sans">
      {/* Header bar */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-2.5 min-w-0">
          {isDirect ? (
            <Avatar src={header.avatar} name={header.title} size="sm" />
          ) : (
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Hash className="h-4.5 w-4.5" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-800 truncate leading-snug">{header.title}</h3>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 capitalize">{header.subtitle}</span>
          </div>
        </div>
      </div>

      {/* Feed area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30"
      >
        {loading ? (
          <Loader size="md" />
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onReply={(m) => setReplyTarget(m)}
                onEdit={editMessage}
                onDelete={deleteMessage}
                onAddReaction={addReaction}
                onRemoveReaction={removeReaction}
              />
            ))}
            
            {/* Typing status notification */}
            {getTypingText() && (
              <div className="text-[10px] text-slate-400 font-bold italic px-3 animate-pulse">
                {getTypingText()}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Composer composer input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileUpload}
        onTypingChange={setTypingState}
        replyTo={replyTarget}
        onClearReply={() => setReplyTarget(null)}
      />
    </div>
  );
};

export default ChatWindow;
