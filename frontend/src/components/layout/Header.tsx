import React from 'react';
import { User } from '../../types/auth';
import { SlackConnection } from '../slack/SlackConnection';
import { FiMail, FiServer, FiLogOut, FiMenu } from 'react-icons/fi';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onToggleMobileMenu }) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-300 shadow-sm w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Left: Mobile Hamburger Button & Brand Text (No logo icon) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onToggleMobileMenu && (
              <button
                onClick={onToggleMobileMenu}
                className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-none lg:hidden focus:outline-none"
                title="Toggle menu"
              >
                <FiMenu className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-gray-900 tracking-tight text-base sm:text-lg">
                ReachInbox
              </span>
            </div>

          </div>



          {/* Right: Controls & User Profile */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
            <a
              href="http://localhost:5000/admin/queues"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-gray-800 hover:text-emerald-800 transition-colors bg-[#f4f6f4] hover:bg-[#e6f4ea] border border-gray-300 px-3 py-1.5 rounded-none"
            >
              <FiServer className="w-3.5 h-3.5 text-[#00a854]" />
              Bull Board Monitoring
            </a>

            <div className="hidden sm:block">
              <SlackConnection />
            </div>

            <div className="hidden sm:block h-4 w-px bg-gray-300"></div>

            <div className="flex items-center gap-2 sm:gap-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-none border border-emerald-300 object-cover shrink-0"
                />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-none bg-[#e6f4ea] border border-emerald-400 flex items-center justify-center font-bold text-xs text-emerald-900 shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden md:block text-left max-w-[200px] truncate">
                <p className="text-xs font-bold text-gray-900 leading-tight truncate">{user.name}</p>
                <p className="text-[11px] text-gray-500 leading-tight truncate">{user.email}</p>
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


