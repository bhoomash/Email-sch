import React from 'react';
import { User } from '../../types/auth';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

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
  return (
    <div className="min-h-screen bg-[#f8faf9] text-gray-900 flex flex-col font-sans">
      <Header user={user} onLogout={onLogout} />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          user={user}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onOpenCompose={onOpenCompose}
          scheduledCount={scheduledCount}
          sentCount={sentCount}
        />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
