import React from 'react';
import { EmailStatus } from '../../types/email';

interface EmailStatusBadgeProps {
  status: EmailStatus;
}

export const EmailStatusBadge: React.FC<EmailStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'SCHEDULED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none text-xs font-bold bg-blue-50 text-blue-800 border border-blue-300">
          <span className="w-1.5 h-1.5 bg-blue-600"></span>
          Scheduled
        </span>
      );
    case 'PROCESSING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
          <span className="w-1.5 h-1.5 bg-amber-600 animate-pulse"></span>
          Processing
        </span>
      );
    case 'SENT':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none text-xs font-bold bg-[#e6f4ea] text-emerald-950 border border-emerald-300">
          <span className="w-1.5 h-1.5 bg-[#00a854]"></span>
          Sent
        </span>
      );
    case 'FAILED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300">
          <span className="w-1.5 h-1.5 bg-rose-600"></span>
          Failed
        </span>
      );
    case 'RATE_LIMITED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none text-xs font-bold bg-purple-50 text-purple-900 border border-purple-300">
          <span className="w-1.5 h-1.5 bg-purple-600"></span>
          Rate Limited
        </span>
      );
    default:
      return <span className="text-xs text-gray-500 font-bold">{status}</span>;
  }
};

