import React from 'react';
import useAuth from '../hooks/useAuth';
import { usePresence } from '../context/PresenceContext';
import { Hash } from 'lucide-react';
import Avatar from './Avatar';

const ConversationList = ({ conversations = [], activeId, onSelect }) => {
  const { user } = useAuth();
  const { isUserOnline } = usePresence();

  const getDirectChatNameAndAvatar = (conv) => {
    const otherMember = conv.members.find(m => m.userId !== user?.id);
    return {
      name: otherMember?.user?.name || 'Direct Chat',
      avatar: otherMember?.user?.avatar,
      userId: otherMember?.userId,
      isOnline: otherMember ? isUserOnline(otherMember.userId) : false
    };
  };

  const getUnreadStatus = (conv) => {
    const member = conv.members.find(m => m.userId === user?.id);
    if (!member) return false;
    const latest = conv.messages?.[0];
    if (latest && new Date(latest.createdAt) > new Date(member.lastReadAt) && latest.senderId !== user?.id) {
      return true;
    }
    return false;
  };

  const channels = conversations.filter(c => c.type === 'GROUP');
  const directChats = conversations.filter(c => c.type === 'DIRECT');

  return (
    <div className="space-y-6 font-sans">
      <div>
        <div className="px-3 mb-2 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Channels & Project Chats</span>
        </div>
        <div className="space-y-0.5">
          {channels.map((c) => {
            const isActive = c.id === activeId;
            const isUnread = getUnreadStatus(c);
            return (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-750 font-bold'
                    : 'text-slate-650 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Hash className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="truncate">{c.name}</span>
                </div>
                {isUnread && (
                  <span className="h-2 w-2 rounded-full bg-indigo-650 flex-shrink-0" />
                )}
              </button>
            );
          })}
          {channels.length === 0 && (
            <p className="px-3 text-[10px] text-slate-400 italic">No channels active.</p>
          )}
        </div>
      </div>

      <div>
        <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Direct Messages</span>
        </div>
        <div className="space-y-0.5">
          {directChats.map((c) => {
            const isActive = c.id === activeId;
            const isUnread = getUnreadStatus(c);
            const details = getDirectChatNameAndAvatar(c);
            return (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-755 font-bold'
                    : 'text-slate-650 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative flex-shrink-0">
                    <Avatar src={details.avatar} name={details.name} size="xs" />
                    <span className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white ${
                      details.isOnline ? 'bg-emerald-500' : 'bg-slate-350'
                    }`} />
                  </div>
                  <span className="truncate">{details.name}</span>
                </div>
                {isUnread && (
                  <span className="h-2 w-2 rounded-full bg-indigo-650 flex-shrink-0" />
                )}
              </button>
            );
          })}
          {directChats.length === 0 && (
            <p className="px-3 text-[10px] text-slate-400 italic font-bold">No active direct chats.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationList;
