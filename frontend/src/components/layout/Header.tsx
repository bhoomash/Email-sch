import React from 'react';
import { User } from '../../types/auth';
import { SlackConnection } from '../slack/SlackConnection';
import { FiMail, FiServer, FiLogOut } from 'react-icons/fi';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-none bg-[#00a854] flex items-center justify-center text-white">
              <FiMail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 tracking-tight text-base">ReachInbox</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-none bg-[#e6f4ea] text-emerald-900 border border-emerald-300">
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
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-gray-800 hover:text-emerald-800 transition-colors bg-[#f4f6f4] hover:bg-[#e6f4ea] border border-gray-300 px-3 py-1.5 rounded-none"
            >
              <FiServer className="w-3.5 h-3.5 text-[#00a854]" />
              Bull Board Monitoring
            </a>

            <SlackConnection />

            <div className="h-4 w-px bg-gray-300"></div>

            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-none border border-emerald-300 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-none bg-[#e6f4ea] border border-emerald-400 flex items-center justify-center font-bold text-xs text-emerald-900">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-gray-900 leading-tight">{user.name}</p>
                <p className="text-[11px] text-gray-500 leading-tight">{user.email}</p>
              </div>

              <button
                onClick={onLogout}
                className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-gray-100 rounded-none transition-colors border border-transparent hover:border-gray-300"
                title="Logout"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

