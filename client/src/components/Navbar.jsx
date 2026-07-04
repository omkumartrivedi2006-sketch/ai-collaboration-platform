import React from 'react';
import { Menu, Bell } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import Avatar from './Avatar';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 cursor-pointer"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-base font-bold text-slate-800">
          Collaboration Workspace
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg relative cursor-pointer">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-indigo-600 rounded-full ring-2 ring-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-100"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800 leading-tight">
              {user?.name}
            </p>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase mt-0.5">
              {user?.role}
            </p>
          </div>
          <Avatar src={user?.avatar} name={user?.name} size="sm" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
