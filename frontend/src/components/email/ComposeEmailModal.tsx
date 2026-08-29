import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useSenders } from '../../hooks/useSenders';
import { parseCsvFrontend } from '../../utils/csv';
import { ScheduleCampaignPayload } from '../../types/campaign';
import {
  FiUpload,
  FiAlertCircle,
  FiPlus,
  FiMail,
  FiX,
  FiClock,
  FiBold,
  FiItalic,
  FiUnderline,
  FiLink,
  FiList,
  FiPaperclip,
  FiChevronDown,
} from 'react-icons/fi';

interface ComposeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (payload: ScheduleCampaignPayload) => Promise<void>;
  isScheduling: boolean;
}

export const ComposeEmailModal: React.FC<ComposeEmailModalProps> = ({
  isOpen,
  onClose,
  onSchedule,
  isScheduling,
}) => {
  const { senders, createEtherealSender, isCreating } = useSenders();

  const [selectedSenderId, setSelectedSenderId] = useState<string>('');
  const [recipientInput, setRecipientInput] = useState<string>('');
  const [recipients, setRecipients] = useState<string[]>([
    'tommy@gmail.com',
    'brian@gmail.com',
    'diana@gmail.com',
  ]);
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [delayMs, setDelayMs] = useState<number>(2000);
  const [hourlyLimit, setHourlyLimit] = useState<number>(50);

  // Send Later Popover state
  const [isSendLaterOpen, setIsSendLaterOpen] = useState<boolean>(false);
  const [selectedScheduleTime, setSelectedScheduleTime] = useState<string>(
    new Date(Date.now() + 3600000).toISOString().slice(0, 16)
  );

  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (senders.length > 0 && !selectedSenderId) {
      setSelectedSenderId(senders[0].id);
    }
  }, [senders, selectedSenderId]);

  const handleAddRecipient = (emailStr: string) => {
    const trimmed = emailStr.trim().replace(/,/g, '');
    if (trimmed && !recipients.includes(trimmed) && trimmed.includes('@')) {
      setRecipients([...recipients, trimmed]);
      setRecipientInput('');
    }
  };

  const handleRecipientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      handleAddRecipient(recipientInput);
    }
  };

  const handleRemoveRecipient = (emailToRemove: string) => {
    setRecipients(recipients.filter((r) => r !== emailToRemove));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCsvFrontend(text);
      if (parsed.validEmails.length > 0) {
        const uniqueCombined = Array.from(new Set([...recipients, ...parsed.validEmails]));
        setRecipients(uniqueCombined);
      }
    };
    reader.readAsText(file);
  };

  const handleScheduleSubmit = async (customStartTime?: string) => {
    setErrorMsg('');

    if (!selectedSenderId) {
      setErrorMsg('Please select or create an email sender.');
      return;
    }
    if (recipients.length === 0) {
      setErrorMsg('Please enter at least one recipient email address.');
      return;
    }
    if (!subject.trim()) {
      setErrorMsg('Please provide a subject line.');
      return;
    }
    if (!body.trim()) {
      setErrorMsg('Please provide email body content.');
      return;
    }

    const finalStartTime = customStartTime || selectedScheduleTime;

    try {
      await onSchedule({
        senderId: selectedSenderId,
        subject,
        body,
        startTime: new Date(finalStartTime).toISOString(),
        delayMs: Number(delayMs),
        hourlyLimit: Number(hourlyLimit),
        recipients,
      });

      // Reset form
      setSubject('');
      setBody('');
      setRecipients(['tommy@gmail.com', 'brian@gmail.com', 'diana@gmail.com']);
      setIsSendLaterOpen(false);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to schedule campaign');
    }
  };

  const setPresetScheduleTime = (hoursAhead: number) => {
    const target = new Date(Date.now() + hoursAhead * 3600000);
    setSelectedScheduleTime(target.toISOString().slice(0, 16));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Compose New Email" maxWidth="2xl">
      <div className="space-y-5 relative">
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-300 rounded-none text-xs text-rose-800">
            <FiAlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Sender Dropdown (From) */}
        <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
          <label className="text-xs font-semibold text-gray-600 w-16 shrink-0">From</label>
          <div className="flex-1 flex items-center justify-between">
            {senders.length > 0 ? (
              <select
                value={selectedSenderId}
                onChange={(e) => setSelectedSenderId(e.target.value)}
                className="bg-[#f4f6f4] border border-gray-300 rounded-none px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#00a854] font-medium"
              >
                {senders.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.email} ({s.smtpHost})
                  </option>
                ))}
              </select>
            ) : (
              <button
                type="button"
                onClick={() => createEtherealSender()}
                disabled={isCreating}
                className="text-xs text-[#00a854] font-bold hover:underline flex items-center gap-1"
              >
                <FiPlus className="w-3.5 h-3.5" />
                {isCreating ? 'Generating Sender...' : '+ Create Test Sender'}
              </button>
            )}
          </div>
        </div>

        {/* Recipient Input (To) with Email Address Pills & Upload List Button */}
        <div className="flex items-start gap-3 border-b border-gray-200 pb-3">
          <label className="text-xs font-semibold text-gray-600 w-16 shrink-0 pt-2">To</label>
          <div className="flex-1 flex flex-wrap items-center gap-1.5 bg-[#f4f6f4] border border-gray-300 rounded-none p-2 min-h-[42px]">
            {recipients.map((email) => (
              <span
                key={email}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs font-semibold bg-[#e6f4ea] text-emerald-950 border border-emerald-300"
              >
                <span>{email}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRecipient(email)}
                  className="text-emerald-800 hover:text-rose-600 transition-colors"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            ))}

            <input
              type="text"
              placeholder={recipients.length === 0 ? 'Enter email recipient addresses...' : 'Add more...'}
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              onKeyDown={handleRecipientKeyDown}
              onBlur={() => handleAddRecipient(recipientInput)}
              className="flex-1 min-w-[140px] bg-transparent border-none text-xs text-gray-900 placeholder-gray-400 focus:outline-none px-1"
            />

            {/* Upload List CSV Button */}
            <label className="ml-auto shrink-0 flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-emerald-50 border border-gray-300 hover:border-emerald-500 rounded-none text-xs font-bold text-[#00a854] cursor-pointer transition-colors">
              <FiUpload className="w-3.5 h-3.5" />
              <span>Upload List</span>
              <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Subject Line */}
        <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
          <label className="text-xs font-semibold text-gray-600 w-16 shrink-0">Subject</label>
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 bg-transparent border-none text-xs text-gray-900 placeholder-gray-400 focus:outline-none font-medium"
            required
          />
        </div>

        {/* Campaign Delay & Rate Parameters */}
        <div className="flex flex-wrap items-center gap-4 bg-[#f8faf9] p-3 rounded-none border border-gray-300 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">Delay between 2 emails:</span>
            <input
              type="number"
              min={2000}
              step={500}
              value={delayMs}
              onChange={(e) => setDelayMs(Number(e.target.value))}
              className="w-16 bg-white border border-gray-300 rounded-none px-2 py-1 text-center font-bold text-gray-900 focus:ring-1 focus:ring-[#00a854]"
            />
            <span className="text-gray-500 text-[11px]">ms</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">Hourly Limit:</span>
            <input
              type="number"
              min={1}
              value={hourlyLimit}
              onChange={(e) => setHourlyLimit(Number(e.target.value))}
              className="w-16 bg-white border border-gray-300 rounded-none px-2 py-1 text-center font-bold text-gray-900 focus:ring-1 focus:ring-[#00a854]"
            />
          </div>
        </div>

        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 border-b border-gray-200 pb-2 text-gray-500">
          <button type="button" className="p-1.5 hover:text-gray-900 rounded-none hover:bg-gray-100">
            <FiBold className="w-3.5 h-3.5" />
          </button>
          <button type="button" className="p-1.5 hover:text-gray-900 rounded-none hover:bg-gray-100">
            <FiItalic className="w-3.5 h-3.5" />
          </button>
          <button type="button" className="p-1.5 hover:text-gray-900 rounded-none hover:bg-gray-100">
            <FiUnderline className="w-3.5 h-3.5" />
          </button>
          <div className="h-3 w-px bg-gray-300 mx-1"></div>
          <button type="button" className="p-1.5 hover:text-gray-900 rounded-none hover:bg-gray-100">
            <FiLink className="w-3.5 h-3.5" />
          </button>
          <button type="button" className="p-1.5 hover:text-gray-900 rounded-none hover:bg-gray-100">
            <FiList className="w-3.5 h-3.5" />
          </button>
          <button type="button" className="p-1.5 hover:text-gray-900 rounded-none hover:bg-gray-100">
            <FiPaperclip className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Email Body Editor Textarea */}
        <div>
          <textarea
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type your reply or campaign body content here..."
            className="w-full bg-[#f8faf9] border border-gray-300 rounded-none p-3.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00a854] font-sans"
            required
          />
        </div>

        {/* Modal Bottom Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isScheduling}>
            Cancel
          </Button>

          <div className="flex items-center gap-2 relative">
            <Button
              type="button"
              variant="primary"
              isLoading={isScheduling}
              onClick={() => handleScheduleSubmit()}
              leftIcon={<FiMail className="w-4 h-4" />}
            >
              Send
            </Button>

            {/* Send Later Popover Trigger */}
            <button
              type="button"
              onClick={() => setIsSendLaterOpen(!isSendLaterOpen)}
              className="px-3 py-2 bg-[#e6f4ea] hover:bg-[#d8edd9] text-[#00a854] border border-emerald-300 font-bold rounded-none text-xs flex items-center gap-1.5 transition-colors"
            >
              <FiClock className="w-3.5 h-3.5" />
              <span>Send Later</span>
              <FiChevronDown className="w-3 h-3" />
            </button>

            {/* Send Later Floating Date/Time Popover Modal */}
            {isSendLaterOpen && (
              <div className="absolute right-0 bottom-12 z-50 w-72 bg-white border border-gray-300 rounded-none shadow-xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-xs font-bold text-gray-900">Pick date & time</span>
                  <button
                    type="button"
                    onClick={() => setIsSendLaterOpen(false)}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setPresetScheduleTime(24)}
                    className="w-full text-left px-3 py-2 hover:bg-[#e6f4ea] rounded-none text-gray-800 font-medium transition-colors"
                  >
                    Tomorrow, 10:00 AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetScheduleTime(27)}
                    className="w-full text-left px-3 py-2 hover:bg-[#e6f4ea] rounded-none text-gray-800 font-medium transition-colors"
                  >
                    Tomorrow, 1:00 PM
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetScheduleTime(29)}
                    className="w-full text-left px-3 py-2 hover:bg-[#e6f4ea] rounded-none text-gray-800 font-medium transition-colors"
                  >
                    Tomorrow, 3:00 PM
                  </button>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Custom Schedule Time
                  </label>
                  <input
                    type="datetime-local"
                    value={selectedScheduleTime}
                    onChange={(e) => setSelectedScheduleTime(e.target.value)}
                    className="w-full bg-[#f4f6f4] border border-gray-300 rounded-none px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#00a854]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSendLaterOpen(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-none border border-transparent hover:border-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScheduleSubmit()}
                    className="px-3 py-1.5 text-xs font-bold bg-[#00a854] text-white rounded-none border border-[#00a854] hover:bg-[#00964b]"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

