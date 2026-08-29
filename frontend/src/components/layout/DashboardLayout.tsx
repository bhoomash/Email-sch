import React, { useState } from 'react';
import { User } from '../../types/auth';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { FiX } from 'react-icons/fi';

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  activeTab: 'scheduled' | 'sent';
  onTabChange: (tab: 'scheduled' | 'sent') => void;
  onOpenCompose: () => void;
  scheduledCount?: number;
  sentCount?: number;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  user,
  onLogout,
  activeTab,
  onTabChange,
  onOpenCompose,
  scheduledCount,
  sentCount,
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabChange = (tab: 'scheduled' | 'sent') => {
    onTabChange(tab);
    setIsMobileMenuOpen(false);
  };

  const handleOpenCompose = () => {
    onOpenCompose();
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] text-gray-900 flex flex-col font-sans">
      <Header
        user={user}
        onLogout={onLogout}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            user={user}
            activeTab={activeTab}
            onTabChange={onTabChange}
            onOpenCompose={onOpenCompose}
            scheduledCount={scheduledCount}
            sentCount={sentCount}
          />
        </div>

        {/* Mobile Slide-Over Sidebar Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/60 transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <div className="relative flex-1 max-w-xs w-full bg-white shadow-xl flex flex-col h-full z-10 animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <span className="font-extrabold text-lg text-gray-900">Navigation</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-none border border-transparent hover:border-gray-300"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar
                  user={user}
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  onOpenCompose={handleOpenCompose}
                  scheduledCount={scheduledCount}
                  sentCount={sentCount}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 overflow-y-auto w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

