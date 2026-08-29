import React from 'react';
import { Modal } from '../ui/Modal';
import { EmailItem } from '../../types/email';
import { EmailStatusBadge } from './EmailStatusBadge';
import { FiMail, FiAlertTriangle } from 'react-icons/fi';

interface EmailDetailModalProps {
  email: EmailItem | null;
  onClose: () => void;
}

export const EmailDetailModal: React.FC<EmailDetailModalProps> = ({ email, onClose }) => {
  if (!email) return null;

  return (
    <Modal isOpen={!!email} onClose={onClose} title="Email Details" maxWidth="lg">
      <div className="space-y-4">
        {/* Status Header */}
        <div className="flex items-center justify-between p-3.5 bg-[#f8faf9] border border-gray-300 rounded-none">
          <div className="flex items-center gap-2">
            <FiMail className="w-4 h-4 text-[#00a854]" />
            <span className="text-sm font-bold text-gray-900">{email.recipient}</span>
          </div>
          <EmailStatusBadge status={email.status} />
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[#f4f6f4] border border-gray-300 rounded-none">
            <span className="text-gray-600 block mb-0.5 font-medium">Scheduled At</span>
            <span className="text-gray-900 font-semibold">{new Date(email.scheduledAt).toLocaleString()}</span>
          </div>
          <div className="p-3 bg-[#f4f6f4] border border-gray-300 rounded-none">
            <span className="text-gray-600 block mb-0.5 font-medium">Sent At</span>
            <span className="text-gray-900 font-semibold">
              {email.sentAt ? new Date(email.sentAt).toLocaleString() : 'Not sent yet'}
            </span>
          </div>
          <div className="p-3 bg-[#f4f4f4] border border-gray-300 rounded-none">
            <span className="text-gray-600 block mb-0.5 font-medium">Job ID</span>
            <span className="text-gray-900 font-mono text-[11px] truncate block">{email.bullJobId}</span>
          </div>
          <div className="p-3 bg-[#f4f6f4] border border-gray-300 rounded-none">
            <span className="text-gray-600 block mb-0.5 font-medium">SMTP Message ID</span>
            <span className="text-gray-900 font-mono text-[11px] truncate block">{email.messageId || 'N/A'}</span>
          </div>
        </div>

        {/* Error message if failed */}
        {email.errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-none text-xs text-rose-900 flex items-start gap-2">
            <FiAlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Failure Cause</span>
              <span>{email.errorMessage}</span>
            </div>
          </div>
        )}

        {/* Subject & Body */}
        <div>
          <span className="text-xs font-bold text-gray-800 block mb-1">Subject</span>
          <div className="p-3 bg-[#f4f6f4] border border-gray-300 rounded-none text-sm text-gray-900 font-bold">
            {email.subject}
          </div>
        </div>

        <div>
          <span className="text-xs font-bold text-gray-800 block mb-1">Body Content</span>
          <div className="p-3.5 bg-[#f4f6f4] border border-gray-300 rounded-none text-xs text-gray-900 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
            {email.body}
          </div>
        </div>
      </div>
    </Modal>
  );
};

