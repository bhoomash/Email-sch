import React from 'react';
import { EmailItem } from '../../types/email';
import { EmailStatusBadge } from './EmailStatusBadge';
import {
  FiArrowLeft,
  FiStar,
  FiTrash2,
  FiCornerUpRight,
  FiFileText,
  FiDownload,
  FiCheckCircle,
  FiClock,
} from 'react-icons/fi';

interface EmailDetailViewProps {
  email: EmailItem | null;
  onBack: () => void;
}

export const EmailDetailView: React.FC<EmailDetailViewProps> = ({ email, onBack }) => {
  if (!email) return null;

  return (
    <div className="bg-white border border-gray-300 rounded-none shadow-sm overflow-hidden min-h-[550px] flex flex-col">
      {/* Top Navigation & Action Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-[#f8faf9]">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 rounded-none text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors border border-transparent hover:border-gray-300"
            title="Back to list"
          >
            <FiArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-base font-bold text-gray-900 truncate">
            {email.subject || 'No Subject'}
          </h2>
        </div>

        <div className="flex items-center gap-3 text-gray-500 shrink-0">
          <EmailStatusBadge status={email.status} />
          <div className="h-4 w-px bg-gray-300"></div>
          <button className="hover:text-amber-600 transition-colors p-1" title="Star">
            <FiStar className="w-4 h-4" />
          </button>
          <button className="hover:text-rose-600 transition-colors p-1" title="Delete">
            <FiTrash2 className="w-4 h-4" />
          </button>
          <button className="hover:text-gray-900 transition-colors p-1" title="Forward">
            <FiCornerUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Email Header (Sender & Recipient Info) */}
      <div className="p-6 space-y-6 flex-1">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-[#00a854] text-white font-bold flex items-center justify-center text-sm">
              {email.recipient.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-sm">{email.recipient}</span>
                <span className="text-xs text-gray-500">&lt;{email.recipient}&gt;</span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                From: <span className="font-bold text-gray-800">{email.sender?.email || email.senderId}</span>
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-gray-500">
            <p>{new Date(email.sentAt || email.scheduledAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Highlight Banner / Status Note */}
        {email.status === 'SENT' ? (
          <div className="p-3 bg-[#e6f4ea] border border-emerald-300 rounded-none text-xs text-emerald-950 flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <FiCheckCircle className="w-4 h-4 text-[#00a854] shrink-0" />
              <span>You've successfully SENT this email via SMTP transporter.</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-800 font-bold">ID: {email.messageId || email.id.slice(0, 8)}</span>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-none text-xs text-amber-950 flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <FiClock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Email is SCHEDULED to dispatch at {new Date(email.scheduledAt).toLocaleTimeString()}.</span>
            </div>
            <span className="font-mono text-[10px] text-amber-800 font-bold">Job: {email.bullJobId.slice(0, 12)}</span>
          </div>
        )}

        {/* Email Body Content */}
        <div className="prose max-w-none text-sm text-gray-900 leading-relaxed font-sans whitespace-pre-wrap py-2">
          {email.body}
        </div>

        {/* Attachments Section */}
        <div className="pt-6 border-t border-gray-200">
          <span className="text-xs font-bold text-gray-800 block mb-3">Attachments (2 files)</span>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-3 p-3 bg-[#f8faf9] border border-gray-300 rounded-none max-w-xs w-full shadow-sm hover:border-[#00a854] transition-colors">
              <div className="w-9 h-9 rounded-none bg-emerald-100 text-[#00a854] flex items-center justify-center shrink-0 border border-emerald-300">
                <FiFileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 truncate">Tennis_Coach_Profile.png</p>
                <p className="text-[10px] text-gray-500">5.2 MB</p>
              </div>
              <FiDownload className="w-4 h-4 text-gray-500 hover:text-gray-900 cursor-pointer shrink-0" />
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#f8faf9] border border-gray-300 rounded-none max-w-xs w-full shadow-sm hover:border-[#00a854] transition-colors">
              <div className="w-9 h-9 rounded-none bg-emerald-100 text-[#00a854] flex items-center justify-center shrink-0 border border-emerald-300">
                <FiFileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 truncate">Campaign_Schedule_Rules.pdf</p>
                <p className="text-[10px] text-gray-500">1.8 MB</p>
              </div>
              <FiDownload className="w-4 h-4 text-gray-500 hover:text-gray-900 cursor-pointer shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

