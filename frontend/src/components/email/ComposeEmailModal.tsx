import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useSenders } from '../../hooks/useSenders';
import { parseCsvFrontend, CsvParseResultFrontend } from '../../utils/csv';
import { ScheduleCampaignPayload } from '../../types/campaign';
import { Upload, CheckCircle2, AlertCircle, Plus, Mail } from 'lucide-react';

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
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [startTime, setStartTime] = useState<string>(
    new Date(Date.now() + 60000).toISOString().slice(0, 16)
  );
  const [delayMs, setDelayMs] = useState<number>(2000);
  const [hourlyLimit, setHourlyLimit] = useState<number>(50);

  const [csvText, setCsvText] = useState<string>('');
  const [manualRecipients, setManualRecipients] = useState<string>('');
  const [csvResult, setCsvResult] = useState<CsvParseResultFrontend | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (senders.length > 0 && !selectedSenderId) {
      setSelectedSenderId(senders[0].id);
    }
  }, [senders, selectedSenderId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      const parsed = parseCsvFrontend(text);
      setCsvResult(parsed);
    };
    reader.readAsText(file);
  };

  const handleManualRecipientChange = (text: string) => {
    setManualRecipients(text);
    if (text.trim()) {
      const parsed = parseCsvFrontend(text);
      setCsvResult(parsed);
    } else if (!csvText) {
      setCsvResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedSenderId) {
      setErrorMsg('Please select or create an email sender.');
      return;
    }
    if (!subject.trim()) {
      setErrorMsg('Please provide a subject line.');
      return;
    }
    if (!body.trim()) {
      setErrorMsg('Please provide email body text.');
      return;
    }

    const recipients = csvResult?.validEmails || [];
    if (recipients.length === 0) {
      setErrorMsg('Please upload a CSV or enter valid recipient email addresses.');
      return;
    }

    try {
      await onSchedule({
        senderId: selectedSenderId,
        subject,
        body,
        startTime: new Date(startTime).toISOString(),
        delayMs: Number(delayMs),
        hourlyLimit: Number(hourlyLimit),
        recipients,
      });

      // Reset form
      setSubject('');
      setBody('');
      setCsvText('');
      setManualRecipients('');
      setCsvResult(null);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to schedule campaign');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Compose & Schedule Campaign" maxWidth="2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-rose-950/40 border border-rose-500/30 rounded-lg text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Sender Selection */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-slate-300">Sender Email</label>
            <button
              type="button"
              onClick={() => createEtherealSender()}
              disabled={isCreating}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              {isCreating ? 'Creating Ethereal Sender...' : '+ Add Ethereal Sender'}
            </button>
          </div>
          {senders.length > 0 ? (
            <select
              value={selectedSenderId}
              onChange={(e) => setSelectedSenderId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {senders.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.email} ({s.smtpHost})
                </option>
              ))}
            </select>
          ) : (
            <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-lg text-xs text-amber-300 flex items-center justify-between">
              <span>No sender configured yet.</span>
              <Button type="button" size="sm" onClick={() => createEtherealSender()} isLoading={isCreating}>
                Generate Test SMTP Sender
              </Button>
            </div>
          )}
        </div>

        {/* Subject & Body */}
        <Input
          label="Subject"
          placeholder="Welcome to ReachInbox!"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Body</label>
          <textarea
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Hello {{name}}, welcome to our platform!"
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>

        {/* CSV Upload & Manual Recipient Input */}
        <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">Recipient Email Addresses</span>
            <span className="text-[11px] text-slate-400">CSV upload or paste emails</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <label className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Upload CSV File</span>
              <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
            <span className="text-xs text-slate-500">or</span>
            <input
              type="text"
              placeholder="Paste emails separated by commas..."
              value={manualRecipients}
              onChange={(e) => handleManualRecipientChange(e.target.value)}
              className="w-full sm:w-2/3 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500"
            />
          </div>

          {/* CSV Detection Summary Badge */}
          {csvResult && (
            <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-lg text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>{csvResult.totalDetected} valid email addresses detected</span>
              </div>
              <div className="text-slate-400 text-[11px] flex items-center gap-3">
                {csvResult.duplicatesRemoved > 0 && <span>• {csvResult.duplicatesRemoved} duplicates removed</span>}
                {csvResult.invalidIgnored > 0 && <span>• {csvResult.invalidIgnored} invalid addresses ignored</span>}
              </div>
            </div>
          )}
        </div>

        {/* Campaign Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Start Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Delay Between (ms)</label>
            <input
              type="number"
              min={2000}
              step={500}
              value={delayMs}
              onChange={(e) => setDelayMs(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Hourly Limit</label>
            <input
              type="number"
              min={1}
              value={hourlyLimit}
              onChange={(e) => setHourlyLimit(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
              required
            />
          </div>
        </div>

        {/* Modal Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isScheduling}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isScheduling} leftIcon={<Mail className="w-4 h-4" />}>
            Schedule Emails
          </Button>
        </div>
      </form>
    </Modal>
  );
};
