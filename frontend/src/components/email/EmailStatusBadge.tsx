import React from 'react';
import { EmailStatus } from '../../types/email';

interface EmailStatusBadgeProps {
  status: EmailStatus;
}

export const EmailStatusBadge: React.FC<EmailStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'SCHEDULED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
          Scheduled
        </span>
      );
    case 'PROCESSING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
          Processing
        </span>
      );
    case 'SENT':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Sent
        </span>
      );
    case 'FAILED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          Failed
        </span>
      );
    case 'RATE_LIMITED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
          Rate Limited
        </span>
      );
    default:
      return <span className="text-xs text-slate-400">{status}</span>;
  }
};
