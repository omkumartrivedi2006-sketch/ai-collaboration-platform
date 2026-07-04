import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { MessageSquare, FolderGit2, CheckSquare, Shield, Bell, Check } from 'lucide-react';

const NotificationPanel = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case 'MESSAGE':
        return <MessageSquare className="h-4 w-4 text-indigo-500" />;
      case 'PROJECT':
        return <FolderGit2 className="h-4 w-4 text-amber-500" />;
      case 'TASK':
        return <CheckSquare className="h-4 w-4 text-emerald-500" />;
      default:
        return <Shield className="h-4 w-4 text-slate-500" />;
    }
  };

  const handleNotificationClick = async (notif) => {
    // Mark as read (pass originalIds array if grouped notification)
    await markAsRead(notif.id, notif.ids);
    onClose();

    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
  };

  const unreadList = notifications.unread || [];

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-xl shadow-lg z-50 overflow-hidden font-sans">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Bell className="h-4 w-4 text-slate-500" /> Notifications
        </div>
        {unreadList.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-[10px] font-bold text-indigo-650 hover:text-indigo-750 flex items-center gap-0.5 cursor-pointer hover:underline"
          >
            <Check className="h-3 w-3" /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
        {unreadList.map((n) => (
          <div
            key={n.id}
            onClick={() => handleNotificationClick(n)}
            className="flex gap-3 p-3.5 hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <div className="p-2 bg-slate-50 rounded-lg h-8 w-8 flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-100/50">
              {getIcon(n.type)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[11px] font-bold text-slate-800 leading-snug">{n.title}</h4>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5 leading-relaxed">{n.description}</p>
              <span className="text-[9px] text-slate-400 font-bold mt-1 block">
                {new Date(n.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
        {unreadList.length === 0 && (
          <div className="text-center py-8 text-xs text-slate-400 font-semibold italic">
            You're all caught up! No unread notifications.
          </div>
        )}
      </div>

      {/* Footer link to Notification Center */}
      <div className="bg-slate-50 border-t border-slate-100 p-2 text-center">
        <button
          onClick={() => {
            navigate('/notifications');
            onClose();
          }}
          className="text-[10px] font-bold text-indigo-650 hover:text-indigo-755 hover:underline cursor-pointer"
        >
          View all notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationPanel;
