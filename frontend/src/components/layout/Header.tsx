import React from 'react';
import { User } from '../../types/auth';
import { SlackConnection } from '../slack/SlackConnection';
import { LogOut, Mail, Server } from 'lucide-react';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 tracking-tight text-base">ReachInbox</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Email Scheduler
                </span>
              </div>
            </div>
          </div>

          {/* Controls & Profile */}
          <div className="flex items-center gap-4 sm:gap-6">
            <a
              href="http://localhost:5000/admin/queues"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg"
            >
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              Bull Board Monitoring
            </a>

            <SlackConnection />

            <div className="h-4 w-px bg-slate-800"></div>

            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-semibold text-xs text-indigo-300">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</p>
                <p className="text-[11px] text-slate-400 leading-tight">{user.email}</p>
              </div>

              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
