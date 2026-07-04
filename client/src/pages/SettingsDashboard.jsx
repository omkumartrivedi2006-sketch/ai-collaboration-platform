import React, { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Loader from '../components/Loader';
import { Link } from 'react-router-dom';
import { User, ShieldCheck, Bell, Palette, Eye, Activity, Key, CheckCircle, AlertTriangle } from 'lucide-react';

export const SettingsDashboard = () => {
  const { user } = useAuth();
  const { preferences, fetchPreferences, sessions, fetchSessions, devices, fetchDevices } = useSettings();

  useEffect(() => {
    fetchPreferences();
    fetchSessions();
    fetchDevices();
  }, [fetchPreferences, fetchSessions, fetchDevices]);

  if (!preferences || !user) {
    return <Loader size="lg" message="Reading security parameters..." fullPage />;
  }

  const activeSessionsCount = sessions.length;
  const trustedDevicesCount = devices.length;

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Account Personalization & Security Control</h2>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">
          Manage your system identity, access logs, UI theme overlays, and notification preferences
        </p>
      </div>

      {/* Grid of panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Profile card summary */}
        <Card
          title="Account Profile"
          subtitle="Your workspace member details"
          className="border border-slate-200 bg-white p-5 shadow-2xs relative flex flex-col justify-between"
        >
          <div className="flex gap-4 items-center mt-3">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
              alt={user.name}
              className="h-14 w-14 rounded-full object-cover border-2 border-indigo-150"
            />
            <div>
              <p className="font-black text-slate-805 text-sm">{user.name}</p>
              <p className="text-[10px] text-slate-400 font-semibold">{user.email}</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-sm inline-block">
                {user.role} • {user.designation || 'Collaborator'}
              </p>
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3">
            <Link
              to="/settings/profile"
              className="cursor-pointer text-indigo-605 font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>Edit Profile Details</span>
              <span>→</span>
            </Link>
          </div>
        </Card>

        {/* Security & Access logs summary */}
        <Card
          title="Security Health"
          subtitle="Overview of active credentials and logins"
          className="border border-slate-200 bg-white p-5 shadow-2xs relative flex flex-col justify-between"
        >
          <div className="space-y-3 mt-3">
            <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg text-emerald-800">
              <span className="font-bold inline-flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Password status:</span>
              </span>
              <span className="font-bold">Active</span>
            </div>
            
            <div className="flex justify-between items-center text-slate-655 font-bold">
              <span>Active Sessions:</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{activeSessionsCount}</span>
            </div>

            <div className="flex justify-between items-center text-slate-655 font-bold">
              <span>Trusted Fingerprints:</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{trustedDevicesCount}</span>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3 flex justify-between">
            <Link
              to="/settings/security"
              className="cursor-pointer text-indigo-650 font-bold hover:underline"
            >
              Update Password
            </Link>
            <Link
              to="/settings/sessions"
              className="cursor-pointer text-indigo-650 font-bold hover:underline"
            >
              View Login History
            </Link>
          </div>
        </Card>

        {/* Preferences / Customization summary */}
        <Card
          title="Personalization Stats"
          subtitle="Active theme overlays and accessibility options"
          className="border border-slate-200 bg-white p-5 shadow-2xs relative flex flex-col justify-between"
        >
          <div className="space-y-3 mt-3">
            <div className="flex justify-between items-center text-slate-655 font-bold">
              <span>Active Theme:</span>
              <span className="font-black text-indigo-605">{preferences.theme}</span>
            </div>
            <div className="flex justify-between items-center text-slate-655 font-bold">
              <span>System Language:</span>
              <span className="font-black text-indigo-605">{preferences.language}</span>
            </div>
            <div className="flex justify-between items-center text-slate-655 font-bold">
              <span>Accessibility scaling:</span>
              <span className="font-black text-indigo-605">{preferences.fontSize} font</span>
            </div>
            <div className="flex justify-between items-center text-slate-655 font-bold">
              <span>High Contrast Mode:</span>
              <span className="font-black text-indigo-605">{preferences.highContrast ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3 flex justify-between">
            <Link
              to="/settings/appearance"
              className="cursor-pointer text-indigo-650 font-bold hover:underline"
            >
              Configure Theme
            </Link>
            <Link
              to="/settings/accessibility"
              className="cursor-pointer text-indigo-650 font-bold hover:underline"
            >
              Accessibility Options
            </Link>
          </div>
        </Card>

      </div>

      {/* Settings Navigation links cards */}
      <h3 className="font-black text-slate-805 text-xs uppercase tracking-wider mt-6">Settings Quick Controls</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        
        <Link to="/settings/profile" className="cursor-pointer p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-350 hover:shadow-2xs text-center transition-all flex flex-col items-center justify-center gap-2">
          <User className="h-6 w-6 text-indigo-500" />
          <span className="font-bold text-slate-700">Profile Details</span>
        </Link>

        <Link to="/settings/security" className="cursor-pointer p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-350 hover:shadow-2xs text-center transition-all flex flex-col items-center justify-center gap-2">
          <Key className="h-6 w-6 text-indigo-500" />
          <span className="font-bold text-slate-700">Change Password</span>
        </Link>

        <Link to="/settings/notifications" className="cursor-pointer p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-350 hover:shadow-2xs text-center transition-all flex flex-col items-center justify-center gap-2">
          <Bell className="h-6 w-6 text-indigo-500" />
          <span className="font-bold text-slate-700">Notifications</span>
        </Link>

        <Link to="/settings/appearance" className="cursor-pointer p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-350 hover:shadow-2xs text-center transition-all flex flex-col items-center justify-center gap-2">
          <Palette className="h-6 w-6 text-indigo-500" />
          <span className="font-bold text-slate-700">Theme & Lang</span>
        </Link>

        <Link to="/settings/accessibility" className="cursor-pointer p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-350 hover:shadow-2xs text-center transition-all flex flex-col items-center justify-center gap-2">
          <Eye className="h-6 w-6 text-indigo-500" />
          <span className="font-bold text-slate-700">Accessibility</span>
        </Link>

        <Link to="/settings/sessions" className="cursor-pointer p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-350 hover:shadow-2xs text-center transition-all flex flex-col items-center justify-center gap-2">
          <Activity className="h-6 w-6 text-indigo-500" />
          <span className="font-bold text-slate-700">Active Sessions</span>
        </Link>

        <Link to="/settings/devices" className="cursor-pointer p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-350 hover:shadow-2xs text-center transition-all flex flex-col items-center justify-center gap-2 col-span-2 sm:col-span-1">
          <ShieldCheck className="h-6 w-6 text-indigo-500" />
          <span className="font-bold text-slate-700">Trusted Devices</span>
        </Link>

      </div>

    </div>
  );
};

export default SettingsDashboard;
