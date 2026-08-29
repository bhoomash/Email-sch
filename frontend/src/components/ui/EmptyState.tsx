import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-gray-300 rounded-none my-4 shadow-sm">
      {icon && <div className="mb-4 text-[#00a854] bg-[#e6f4ea] p-3 rounded-none border border-emerald-300">{icon}</div>}
      <h4 className="text-base font-bold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
};

