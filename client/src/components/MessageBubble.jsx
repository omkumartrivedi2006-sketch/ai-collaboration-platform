import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import Avatar from './Avatar';
import EmojiPicker from './EmojiPicker';
import TranslationCard from './TranslationCard';
import { CornerUpLeft, Edit3, Trash2, FileText, Image as ImageIcon, CheckCheck } from 'lucide-react';

const MessageBubble = ({ message, onReply, onEdit, onDelete, onAddReaction, onRemoveReaction }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.message);

  const isOwner = message.senderId === user?.id;
  const isAdmin = user?.role === 'Admin';
  const canModify = isOwner || isAdmin;

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    try {
      await onEdit(message.id, editText);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const getGroupedReactions = () => {
    const groups = {};
    message.reactions?.forEach((r) => {
      if (!groups[r.emoji]) {
        groups[r.emoji] = { count: 0, users: [], hasReacted: false };
      }
      groups[r.emoji].count++;
      groups[r.emoji].users.push(r.userId);
      if (r.userId === user?.id) {
        groups[r.emoji].hasReacted = true;
      }
    });
    return groups;
  };

  const handleReactionClick = (emoji, group) => {
    if (group.hasReacted) {
      onRemoveReaction(message.id, emoji);
    } else {
      onAddReaction(message.id, emoji);
    }
  };

  const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const downloadUrl = `${apiBase}${message.message}`;

  const reactionsGroup = getGroupedReactions();

  return (
    <div className={`flex gap-3 group relative p-2 rounded-lg hover:bg-slate-50/50 transition-colors ${
      isOwner ? 'flex-row-reverse text-right' : 'text-left'
    }`}>
      <Avatar src={message.sender?.avatar} name={message.sender?.name} size="sm" className="mt-0.5" />
      
      <div className={`flex flex-col max-w-[70%] min-w-0 ${isOwner ? 'items-end' : 'items-start'}`}>
        <div className="flex gap-2 items-center text-[10px] text-slate-400 font-bold">
          <span className="text-slate-700 font-extrabold">{message.sender?.name}</span>
          <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Parent reply reference */}
        {message.parentMessage && (
          <div className="flex items-center gap-1 mt-1 text-[9px] bg-slate-100/70 border border-slate-200/50 px-2 py-1 rounded text-slate-500 font-bold">
            <span className="italic">Replied to {message.parentMessage.sender?.name}:</span>
            <span className="truncate max-w-[150px]">{message.parentMessage.message}</span>
          </div>
        )}

        {/* Main content body */}
        <div className="mt-1 min-w-0 w-full">
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="flex gap-1.5 mt-1 w-full max-w-sm">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="flex-1 px-3 py-1 bg-white border border-slate-250 rounded text-xs focus:outline-none"
              />
              <button type="submit" className="px-2.5 py-1 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-750 cursor-pointer">
                Save
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="px-2.5 py-1 bg-slate-150 text-slate-600 rounded text-xs font-bold hover:bg-slate-200 cursor-pointer">
                Cancel
              </button>
            </form>
          ) : (
            <div className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed break-words text-left inline-block ${
              isOwner
                ? 'bg-indigo-650 text-white rounded-tr-none'
                : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/40'
            }`}>
              {message.messageType === 'IMAGE' ? (
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="block max-w-[240px] overflow-hidden rounded">
                  <img src={downloadUrl} alt="attachment" className="object-cover hover:opacity-90 max-h-[160px]" />
                </a>
              ) : message.messageType === 'FILE' ? (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 font-bold hover:underline ${
                    isOwner ? 'text-indigo-100' : 'text-indigo-650'
                  }`}
                >
                  <FileText className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate max-w-[160px]">{message.message.split('/').pop()}</span>
                </a>
              ) : (
                <div>
                  <p className="whitespace-pre-wrap">{message.message}</p>
                  <TranslationCard originalText={message.message} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reaction badges */}
        <div className="flex gap-1 flex-wrap mt-1.5 items-center">
          {Object.entries(reactionsGroup).map(([emoji, group]) => (
            <button
              key={emoji}
              onClick={() => handleReactionClick(emoji, group)}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                group.hasReacted
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100/50'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span>{emoji}</span>
              <span>{group.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Floating Action Menu */}
      <div className={`absolute top-0 z-10 hidden group-hover:flex gap-1 bg-white border border-slate-200 shadow-sm p-1 rounded-lg ${
        isOwner ? 'left-4' : 'right-4'
      }`}>
        <button
          onClick={() => onReply(message)}
          className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-650 rounded-md cursor-pointer transition-colors"
          title="Reply"
        >
          <CornerUpLeft className="h-3.5 w-3.5" />
        </button>

        <EmojiPicker onSelect={(emoji) => onAddReaction(message.id, emoji)} />

        {isOwner && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-650 rounded-md cursor-pointer transition-colors"
            title="Edit"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
        )}

        {canModify && (
          <button
            onClick={() => {
              if (window.confirm('Delete message?')) onDelete(message.id);
            }}
            className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer transition-colors"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
