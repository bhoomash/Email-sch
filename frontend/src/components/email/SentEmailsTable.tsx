import React from 'react';
import { EmailItem, Pagination } from '../../types/email';
import { EmailStatusBadge } from './EmailStatusBadge';
import { Spinner } from '../ui/Spinner';
import { EmptyState } from '../ui/EmptyState';
import { CheckCircle2, ChevronLeft, ChevronRight, Mail, Send } from 'lucide-react';

interface SentEmailsTableProps {
  emails: EmailItem[];
  pagination?: Pagination;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onSelectEmail: (email: EmailItem) => void;
}

export const SentEmailsTable: React.FC<SentEmailsTableProps> = ({
  emails,
  pagination,
  isLoading,
  onPageChange,
  onSelectEmail,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900/30 border border-slate-800 rounded-xl">
        <Spinner size="lg" />
        <p className="mt-4 text-xs text-slate-400 font-medium">Loading sent emails...</p>
      </div>
    );
  }

  if (!emails || emails.length === 0) {
    return (
      <EmptyState
        icon={<Send className="w-6 h-6" />}
        title="No sent emails"
        description="Emails that have completed sending or encountered errors will appear here."
      />
    );
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Recipient</th>
              <th className="py-3.5 px-4">Subject</th>
              <th className="py-3.5 px-4">Sender</th>
              <th className="py-3.5 px-4">Sent Time</th>
              <th className="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {emails.map((email) => (
              <tr
                key={email.id}
                onClick={() => onSelectEmail(email)}
                className="hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <td className="py-3.5 px-4 font-medium text-slate-200">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{email.recipient}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">{email.subject}</td>
                <td className="py-3.5 px-4 text-slate-400 text-xs">{email.sender?.email || email.senderId}</td>
                <td className="py-3.5 px-4 text-slate-300 text-xs">
                  {email.sentAt ? new Date(email.sentAt).toLocaleString() : 'N/A'}
                </td>
                <td className="py-3.5 px-4">
                  <EmailStatusBadge status={email.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-900/40 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-200">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-semibold text-slate-200">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-semibold text-slate-200">{pagination.total}</span> emails
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
