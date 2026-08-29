import React from 'react';
import { FiClock, FiSend, FiPlus, FiChevronDown } from 'react-icons/fi';
import { User } from '../../types/auth';

interface SidebarProps {
  user: User;
  activeTab: 'scheduled' | 'sent';
  onTabChange: (tab: 'scheduled' | 'sent') => void;
  onOpenCompose: () => void;
  scheduledCount?: number;
  sentCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeTab,
  onTabChange,
  onOpenCompose,
  scheduledCount = 0,
  sentCount = 0,
}) => {
  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-300 min-h-[calc(100vh-4rem)] flex flex-col p-4 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xl tracking-tight text-gray-900">ONB</span>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="flex items-center gap-3 p-2 bg-[#f8faf9] rounded-none border border-gray-300 mb-5">
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-none object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-none bg-[#e6f4ea] text-[#00a854] font-bold text-xs flex items-center justify-center border border-emerald-300">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
          <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
        </div>
        <FiChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
      </div>

      {/* Primary Action Button: + Compose */}
      <button
        onClick={onOpenCompose}
        className="w-full mb-6 py-2.5 px-4 bg-white border border-[#00a854] text-[#00a854] hover:bg-[#e6f4ea] font-bold text-xs rounded-none flex items-center justify-start gap-2.5 transition-colors group"
      >
        <div className="w-5 h-5 rounded-none bg-[#e6f4ea] group-hover:bg-[#00a854] group-hover:text-white flex items-center justify-center transition-colors">
          <FiPlus className="w-3.5 h-3.5" />
        </div>
        <span>Compose</span>
      </button>

      {/* Navigation Menu */}
      <div className="space-y-1 flex-1">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">
          Core
        </div>

        <button
          onClick={() => onTabChange('scheduled')}
          className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-none border transition-colors ${
            activeTab === 'scheduled'
              ? 'bg-[#e6f4ea] text-[#00a854] border-emerald-400'
              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-transparent'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FiClock className={`w-4 h-4 ${activeTab === 'scheduled' ? 'text-[#00a854]' : 'text-gray-400'}`} />
            <span>Scheduled</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-none text-[10px] font-bold ${
              activeTab === 'scheduled' ? 'bg-[#00a854] text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {scheduledCount}
          </span>
        </button>

        <button
          onClick={() => onTabChange('sent')}
          className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-none border transition-colors ${
            activeTab === 'sent'
              ? 'bg-[#e6f4ea] text-[#00a854] border-emerald-400'
              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-transparent'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FiSend className={`w-4 h-4 ${activeTab === 'sent' ? 'text-[#00a854]' : 'text-gray-400'}`} />
            <span>Sent</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-none text-[10px] font-bold ${
              activeTab === 'sent' ? 'bg-[#00a854] text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {sentCount}
          </span>
        </button>
      </div>
    </aside>
  );
};

