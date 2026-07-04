import React, { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import SettingsHeader from '../components/SettingsHeader';
import Card from '../components/Card';
import Loader from '../components/Loader';
import { LogOut, Laptop, Smartphone, ShieldAlert, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';

export const SettingsSessions = () => {
  const { sessions, fetchSessions, revokeSession, revokeOtherSessions, loading } = useSettings();

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevoke = async (id) => {
    if (window.confirm('Are you sure you want to terminate this login session? The device will be prompted to log in again.')) {
      try {
        await revokeSession(id);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleRevokeOthers = async () => {
    // Find the ID of the current active session (which is the most recently active one at index 0)
    if (sessions.length <= 1) {
      toast.error('No other active sessions detected');
      return;
    }
    const currentSessionId = sessions[0].id;
    if (window.confirm('Are you sure you want to log out all other devices? This will invalidate all active sessions except your current tab.')) {
      try {
        await revokeOtherSessions(currentSessionId);
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (loading && sessions.length === 0) {
    return <Loader size="lg" message="Loading active sessions timeline..." fullPage />;
  }

  return (
    <div className="space-y-6 font-sans text-xs">
      <SettingsHeader
        title="Active User Sessions"
        subtitle="Review security logins, device formats, IP allocations, and force log out other active sessions"
      />

      {/* Revoke All Header option */}
      {sessions.length > 1 && (
        <div className="flex justify-end">
          <button
            onClick={handleRevokeOthers}
            className="cursor-pointer bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-750 font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="h-4 w-4 text-rose-600" />
            <span>Logout Other Sessions</span>
          </button>
        </div>
      )}

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((sess, idx) => {
          const isCurrent = idx === 0; // The first session in the ordered query represents the active session
          const IsMobile = sess.device.toLowerCase().includes('mobile');
          const Icon = IsMobile ? Smartphone : Monitor;

          return (
            <Card
              key={sess.id}
              className={`p-5 bg-white border rounded-2xl relative flex gap-4 ${
                isCurrent ? 'border-indigo-305 shadow-xs ring-1 ring-indigo-200' : 'border-slate-200'
              }`}
            >
              <div className="p-3 bg-indigo-50 border border-indigo-150 text-indigo-650 rounded-xl flex-shrink-0 self-start">
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-black text-slate-805 text-sm uppercase tracking-wide">
                      {sess.browser}
                    </span>
                    {isCurrent && (
                      <span className="ml-2 bg-emerald-50 border border-emerald-150 text-emerald-750 text-[8px] font-black uppercase px-1.5 py-0.5 rounded">
                        Current Session
                      </span>
                    )}
                  </div>

                  {!isCurrent && (
                    <button
                      onClick={() => handleRevoke(sess.id)}
                      className="cursor-pointer text-[10px] text-rose-500 hover:text-rose-750 font-black hover:underline"
                    >
                      Log Out
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-semibold mt-1">
                  <p>
                    <span className="font-bold text-slate-400">Device:</span> {sess.device}
                  </p>
                  <p>
                    <span className="font-bold text-slate-400">IP Address:</span> {sess.ipAddress}
                  </p>
                  <p>
                    <span className="font-bold text-slate-400">Location:</span> {sess.location || 'Unknown'}
                  </p>
                  <p>
                    <span className="font-bold text-slate-400">Last Active:</span> {new Date(sess.lastActive).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SettingsSessions;
