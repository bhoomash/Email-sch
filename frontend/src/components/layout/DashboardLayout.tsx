import React from 'react';
import { User } from '../../types/auth';
import { Header } from './Header';

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, onLogout, children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header user={user} onLogout={onLogout} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
};
