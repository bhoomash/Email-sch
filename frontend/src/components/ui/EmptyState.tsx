import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-xl my-4">
      {icon && <div className="mb-4 text-slate-500 bg-slate-900 p-3 rounded-xl border border-slate-800">{icon}</div>}
      <h4 className="text-base font-semibold text-slate-200 mb-1">{title}</h4>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
};
