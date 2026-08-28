import React from 'react';
import { Modal } from '../ui/Modal';
import { EmailItem } from '../../types/email';
import { EmailStatusBadge } from './EmailStatusBadge';
import { Calendar, Hash, Mail, MessageSquare, Send, AlertTriangle } from 'lucide-react';

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
        <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-slate-200">{email.recipient}</span>
          </div>
          <EmailStatusBadge status={email.status} />
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg">
            <span className="text-slate-500 block mb-0.5">Scheduled At</span>
            <span className="text-slate-200 font-medium">{new Date(email.scheduledAt).toLocaleString()}</span>
          </div>
          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg">
            <span className="text-slate-500 block mb-0.5">Sent At</span>
            <span className="text-slate-200 font-medium">
              {email.sentAt ? new Date(email.sentAt).toLocaleString() : 'Not sent yet'}
            </span>
          </div>
          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg">
            <span className="text-slate-500 block mb-0.5">BullMQ Job ID</span>
            <span className="text-slate-300 font-mono text-[11px] truncate block">{email.bullJobId}</span>
          </div>
          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg">
            <span className="text-slate-500 block mb-0.5">SMTP Message ID</span>
            <span className="text-slate-300 font-mono text-[11px] truncate block">{email.messageId || 'N/A'}</span>
          </div>
        </div>

        {/* Error message if failed */}
        {email.errorMessage && (
          <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Failure Cause</span>
              <span>{email.errorMessage}</span>
            </div>
          </div>
        )}

        {/* Subject & Body */}
        <div>
          <span className="text-xs font-medium text-slate-400 block mb-1">Subject</span>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 font-medium">
            {email.subject}
          </div>
        </div>

        <div>
          <span className="text-xs font-medium text-slate-400 block mb-1">Body Content</span>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
            {email.body}
          </div>
        </div>
      </div>
    </Modal>
  );
};
