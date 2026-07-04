import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { MessageSquare, FolderGit2, CheckSquare, Shield, Check, ArrowRight } from 'lucide-react';

const NotificationCenter = () => {
  const { notifications, loading, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getIcon = (type) => {
    switch (type) {
      case 'MESSAGE':
        return <MessageSquare className="h-5 w-5 text-indigo-500" />;
      case 'PROJECT':
        return <FolderGit2 className="h-5 w-5 text-amber-500" />;
      case 'TASK':
        return <CheckSquare className="h-5 w-5 text-emerald-500" />;
      default:
        return <Shield className="h-5 w-5 text-slate-500" />;
    }
  };

  const handleNotificationClick = async (n) => {
    await markAsRead(n.id, n.ids);
    if (n.actionUrl) {
      navigate(n.actionUrl);
    }
  };

  const unread = notifications.unread || [];
  const read = notifications.read || [];

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Notification Center</h2>
          <p className="text-xs text-slate-400 font-semibold">Coordinate tasks, workspace alerts, and messages</p>
        </div>
        {unread.length > 0 && (
          <Button size="sm" onClick={markAllAsRead} className="flex items-center gap-1">
            <Check className="h-4 w-4" /> Mark All Read
          </Button>
        )}
      </div>

      {loading && unread.length === 0 && read.length === 0 ? (
        <Loader size="lg" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Card title={`Unread Alerts (${unread.reduce((acc, curr) => acc + (curr.ids ? curr.ids.length : 1), 0)})`}>
              <div className="divide-y divide-slate-100">
                {unread.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className="flex gap-4 py-4 first:pt-0 last:pb-0 hover:bg-slate-50/50 p-2 rounded-lg cursor-pointer transition-all border border-transparent hover:border-slate-150"
                  >
                    <div className="p-2.5 bg-slate-50 rounded-xl h-10 w-10 flex items-center justify-center flex-shrink-0 border border-slate-100">
                      {getIcon(n.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-850">{n.title}</h4>
                      <p className="text-xs text-slate-550 font-semibold mt-0.5 leading-relaxed">{n.description}</p>
                      <span className="text-[10px] text-slate-400 font-bold block mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center text-slate-350 hover:text-indigo-650 transition-colors">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                ))}
                {unread.length === 0 && (
                  <p className="text-center py-12 text-xs text-slate-400 font-bold italic">No unread alerts.</p>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card title="Past Notifications">
              <div className="space-y-4">
                {read.slice(0, 10).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => n.actionUrl && navigate(n.actionUrl)}
                    className="flex gap-3 border border-slate-100 p-3 rounded-lg bg-slate-50/20 opacity-70 hover:opacity-100 cursor-pointer transition-opacity"
                  >
                    <div className="p-2 bg-slate-50 rounded-lg h-8 w-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[10px] font-bold text-slate-700 leading-snug">{n.title}</h4>
                      <p className="text-[9px] text-slate-500 font-semibold mt-0.5 leading-relaxed">{n.description}</p>
                    </div>
                  </div>
                ))}
                {read.length === 0 && (
                  <p className="text-center py-6 text-[10px] text-slate-450 font-bold italic">No archive logs.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
