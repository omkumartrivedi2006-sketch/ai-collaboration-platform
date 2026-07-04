import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, LogOut, ShieldAlert, Users, Building, FolderGit2, CheckSquare, MessageSquare, Bell, FolderOpen } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useNotifications } from '../context/NotificationContext';
import Avatar from './Avatar';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Admin', 'Manager', 'Employee']
    },
    {
      name: 'Projects',
      path: '/projects',
      icon: FolderGit2,
      roles: ['Admin', 'Manager', 'Employee']
    },
    {
      name: 'File Manager',
      path: '/files',
      icon: FolderOpen,
      roles: ['Admin', 'Manager', 'Employee']
    },
    {
      name: 'Tasks',
      path: '/tasks',
      icon: CheckSquare,
      roles: ['Admin', 'Manager', 'Employee']
    },
    {
      name: 'Chat Room',
      path: '/chat',
      icon: MessageSquare,
      roles: ['Admin', 'Manager', 'Employee']
    },
    {
      name: 'Notifications',
      path: '/notifications',
      icon: Bell,
      roles: ['Admin', 'Manager', 'Employee']
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: User,
      roles: ['Admin', 'Manager', 'Employee']
    },
    {
      name: 'Team Directory',
      path: '/team',
      icon: Users,
      roles: ['Admin', 'Manager']
    },
    {
      name: 'Admin Panel',
      path: '/admin',
      icon: ShieldAlert,
      roles: ['Admin']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 text-slate-300 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col justify-between">
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950">
            <div className="flex items-center gap-2.5">
              <Building className="h-6 w-6 text-indigo-400" />
              <span className="text-sm font-extrabold text-white tracking-wider uppercase">
                CollabSphere
              </span>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-slate-400 hover:text-white cursor-pointer"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <Avatar src={user?.avatar} name={user?.name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 font-semibold truncate capitalize mt-0.5">
                  {user?.role} • {user?.department || 'General'}
                </p>
              </div>
            </div>
          </div>

          <nav className="mt-6 px-3 flex flex-col gap-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                        : 'hover:bg-slate-800 hover:text-white text-slate-400'
                    }`
                  }
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span className="flex-1 flex justify-between items-center">
                    <span>{item.name}</span>
                    {item.name === 'Notifications' && unreadCount > 0 && (
                      <span className="bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                        {unreadCount}
                      </span>
                    )}
                  </span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/20">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide hover:bg-rose-950/30 hover:text-rose-400 text-slate-400 transition-all cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
