import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const SettingsHeader = ({ title, subtitle }) => {
  const links = [
    { name: 'Dashboard', path: '/settings' },
    { name: 'Profile Details', path: '/settings/profile' },
    { name: 'Password & Security', path: '/settings/security' },
    { name: 'Notifications Switch', path: '/settings/notifications' },
    { name: 'Theme & Language', path: '/settings/appearance' },
    { name: 'Accessibility Options', path: '/settings/accessibility' },
    { name: 'Active Logins', path: '/settings/sessions' },
    { name: 'Trusted Devices', path: '/settings/devices' }
  ];

  return (
    <div className="space-y-4 font-sans text-xs mb-6">
      
      {/* Title */}
      <div className="flex gap-3 items-center">
        <NavLink
          to="/settings"
          className="p-1.5 hover:bg-slate-100 border border-slate-200 hover:border-slate-350 rounded-lg text-slate-500 cursor-pointer"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </NavLink>
        <div>
          <h2 className="text-xl font-bold text-slate-805 tracking-tight">{title}</h2>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Horizontal Nav Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-slate-150 scrollbar-none">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end
            className={({ isActive }) =>
              `cursor-pointer px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all flex-shrink-0 ${
                isActive
                  ? 'bg-indigo-605 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-655 hover:border-slate-350 hover:bg-slate-50'
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </div>

    </div>
  );
};

export default SettingsHeader;
