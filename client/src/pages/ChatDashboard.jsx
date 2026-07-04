import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { usePresence } from '../context/PresenceContext';
import useAuth from '../hooks/useAuth';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import Button from '../components/Button';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import { Plus, X, MessageSquare, Users, Hash, Search } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ChatDashboard = () => {
  const { user } = useAuth();
  const { conversations, activeConversation, selectConversation, fetchConversations } = useChat();
  const { directoryUsers } = usePresence();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('DIRECT'); // 'DIRECT' | 'GROUP'
  const [selectedUser, setSelectedUser] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const startDirectChat = async (targetUserId) => {
    setCreating(true);
    try {
      const res = await api.post('/chat/conversations', {
        type: 'DIRECT',
        userIds: [targetUserId]
      });
      await fetchConversations();
      selectConversation(res.data.data.conversation.id);
      setModalOpen(false);
      setSelectedUser('');
      toast.success('Conversation started!');
    } catch (err) {
      toast.error('Failed to start chat');
    } finally {
      setCreating(false);
    }
  };

  const startGroupChat = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || groupMembers.length === 0) return;
    setCreating(true);
    try {
      const res = await api.post('/chat/conversations', {
        type: 'GROUP',
        name: groupName,
        userIds: groupMembers
      });
      await fetchConversations();
      selectConversation(res.data.data.conversation.id);
      setModalOpen(false);
      setGroupName('');
      setGroupMembers([]);
      toast.success('Group chat created!');
    } catch (err) {
      toast.error('Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const handleGroupMemberToggle = (id) => {
    setGroupMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleMessageSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await api.get(`/chat/messages/search?q=${searchQuery}`);
      setSearchResults(res.data.data.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const eligibleUsers = directoryUsers.filter((u) => u.id !== user?.id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 font-sans">
      {/* Left Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-800">Messages</h3>
            <button
              onClick={() => setModalOpen(true)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-indigo-600 cursor-pointer transition-all border border-slate-200 bg-white"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Search messages input */}
          <form onSubmit={handleMessageSearch} className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!e.target.value) setSearchResults([]);
              }}
              placeholder="Search in messages..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </form>

          {/* Search Results listing */}
          {searchResults.length > 0 ? (
            <div className="mb-4 space-y-2 max-h-48 overflow-y-auto">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Search Results</span>
              {searchResults.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => selectConversation(msg.conversationId)}
                  className="p-2 border border-slate-100 rounded-lg bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors text-left"
                >
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                    <span>{msg.sender?.name}</span>
                    <span className="bg-slate-200 px-1 rounded uppercase">{msg.conversation?.type}</span>
                  </div>
                  <p className="text-[10px] text-slate-600 font-semibold truncate mt-0.5">{msg.message}</p>
                </div>
              ))}
            </div>
          ) : searchQuery && !searching ? (
            <p className="text-center py-2 text-[10px] text-slate-400 italic">No matching messages.</p>
          ) : null}

          {/* Conversations sidebar list */}
          <ConversationList
            conversations={conversations}
            activeId={activeConversation?.id}
            onSelect={selectConversation}
          />
        </Card>
      </div>

      {/* Main chat window container */}
      <div className="lg:col-span-3">
        <ChatWindow />
      </div>

      {/* Create Conversation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-indigo-650" /> Start Collaboration Chat
            </h3>

            {/* Selector tabs */}
            <div className="flex border-b border-slate-100 mb-4 text-xs font-bold text-slate-500">
              <button
                onClick={() => setModalType('DIRECT')}
                className={`flex-1 pb-2 border-b-2 text-center cursor-pointer ${
                  modalType === 'DIRECT' ? 'border-indigo-600 text-indigo-600' : 'border-transparent'
                }`}
              >
                Direct Message
              </button>
              <button
                onClick={() => setModalType('GROUP')}
                className={`flex-1 pb-2 border-b-2 text-center cursor-pointer ${
                  modalType === 'GROUP' ? 'border-indigo-600 text-indigo-600' : 'border-transparent'
                }`}
              >
                Custom Group Chat
              </button>
            </div>

            {/* Direct Message selection */}
            {modalType === 'DIRECT' ? (
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Select Team Member</span>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {eligibleUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => startDirectChat(u.id)}
                      disabled={creating}
                      className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-lg text-left text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <Avatar src={u.avatar} name={u.name} size="sm" />
                      <div>
                        <div className="font-bold text-slate-800">{u.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{u.department} • {u.designation}</div>
                      </div>
                    </button>
                  ))}
                  {eligibleUsers.length === 0 && (
                    <p className="text-center py-6 text-xs text-slate-400 italic">No directory users available.</p>
                  )}
                </div>
              </div>
            ) : (
              // Group Chat creator
              <form onSubmit={startGroupChat} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Group Name</label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                    placeholder="e.g. Design Sync"
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 w-full"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Select Group Members</span>
                  <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-lg p-2 divide-y divide-slate-100">
                    {eligibleUsers.map((u) => {
                      const isSelected = groupMembers.includes(u.id);
                      return (
                        <div
                          key={u.id}
                          onClick={() => handleGroupMemberToggle(u.id)}
                          className="flex items-center justify-between p-2 hover:bg-slate-50 rounded cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5 text-xs font-semibold">
                            <Avatar src={u.avatar} name={u.name} size="xs" />
                            <span>{u.name}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="h-3.5 w-3.5 text-indigo-650 border-slate-300 rounded cursor-pointer"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="submit" loading={creating} disabled={!groupName.trim() || groupMembers.length === 0}>
                    Create Group
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatDashboard;
