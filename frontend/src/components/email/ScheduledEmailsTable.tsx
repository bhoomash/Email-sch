import React from 'react';
import { EmailItem, Pagination } from '../../types/email';
import { EmailStatusBadge } from './EmailStatusBadge';
import { Spinner } from '../ui/Spinner';
import { EmptyState } from '../ui/EmptyState';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiClock, FiMail } from 'react-icons/fi';

interface ScheduledEmailsTableProps {
  emails: EmailItem[];
  pagination?: Pagination;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onSelectEmail: (email: EmailItem) => void;
}

export const ScheduledEmailsTable: React.FC<ScheduledEmailsTableProps> = ({
  emails,
  pagination,
  isLoading,
  onPageChange,
  onSelectEmail,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-gray-300 rounded-none shadow-sm">
        <Spinner size="lg" />
        <p className="mt-4 text-xs text-gray-600 font-medium">Loading scheduled emails...</p>
      </div>
    );
  }

  if (!emails || emails.length === 0) {
    return (
      <EmptyState
        icon={<FiClock className="w-6 h-6" />}
        title="No scheduled emails"
        description="You have no emails currently scheduled. Click '+ Compose New Email' to launch a new campaign."
      />
    );
  }

  return (
    <div className="bg-white border border-gray-300 rounded-none overflow-hidden shadow-sm w-full">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-gray-200 bg-[#f8faf9] text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <th className="py-3 px-3.5">Recipient</th>
              <th className="py-3 px-3.5">Subject</th>
              <th className="py-3 px-3.5">Sender</th>
              <th className="py-3 px-3.5">Scheduled Time</th>
              <th className="py-3 px-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {emails.map((email) => (
              <tr
                key={email.id}
                onClick={() => onSelectEmail(email)}
                className="hover:bg-[#f4f6f4] transition-colors cursor-pointer"
              >
                <td className="py-3 px-3.5 font-bold text-gray-900">
                  <div className="flex items-center gap-2">
                    <FiMail className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="truncate max-w-[160px] sm:max-w-none">{email.recipient}</span>
                  </div>
                </td>
                <td className="py-3 px-3.5 text-gray-800 max-w-xs truncate">{email.subject}</td>
                <td className="py-3 px-3.5 text-gray-600 text-xs truncate max-w-[140px]">{email.sender?.email || email.senderId}</td>
                <td className="py-3 px-3.5 text-gray-700 text-xs whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <FiCalendar className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span>{new Date(email.scheduledAt).toLocaleString()}</span>
                  </div>
                </td>
                <td className="py-3 px-3.5 whitespace-nowrap">
                  <EmailStatusBadge status={email.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-gray-200 bg-[#f8faf9] text-xs text-gray-600">
          <div>
            Showing <span className="font-bold text-gray-900">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-bold text-gray-900">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-bold text-gray-900">{pagination.total}</span> emails
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 border border-gray-300 rounded-none hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 border border-gray-300 rounded-none hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

};

