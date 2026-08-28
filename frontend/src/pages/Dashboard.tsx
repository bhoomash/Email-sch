import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useScheduledEmails, useSentEmails, useSearchEmails } from '../hooks/useEmails';
import { useCampaigns } from '../hooks/useCampaigns';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ScheduledEmailsTable } from '../components/email/ScheduledEmailsTable';
import { SentEmailsTable } from '../components/email/SentEmailsTable';
import { ComposeEmailModal } from '../components/email/ComposeEmailModal';
import { EmailDetailModal } from '../components/email/EmailDetailModal';
import { Button } from '../components/ui/Button';
import { EmailItem } from '../types/email';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { Clock, Send, Plus, Search, Mail, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'scheduled' | 'sent'>('scheduled');

  const [scheduledPage, setScheduledPage] = useState(1);
  const [sentPage, setSentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Queries
  const { data: scheduledData, isLoading: isScheduledLoading } = useScheduledEmails(scheduledPage, 20);
  const { data: sentData, isLoading: isSentLoading } = useSentEmails(sentPage, 20);
  const { data: searchResults, isLoading: isSearchLoading } = useSearchEmails(searchQuery);

  const { scheduleCampaign, isScheduling } = useCampaigns();

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleScheduleCampaign = async (payload: any) => {
    try {
      const result = await scheduleCampaign(payload);
      addToast(
        'success',
        `Successfully scheduled ${result.totalScheduled} email(s) into BullMQ delayed queue!`
      );
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to schedule campaign');
      throw err;
    }
  };

  if (!user) return null;

  const isSearching = searchQuery.trim().length > 0;

  return (
    <DashboardLayout user={user} onLogout={logout}>
      {/* Toast Notification Layer */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>

      <div className="space-y-6">
        {/* Top Header Controls & Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Campaign Control Center</h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage persistent scheduled email jobs, rates, and search indexed messages.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsComposeOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Compose New Email
          </Button>
        </div>

        {/* Stats Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium">Scheduled Jobs</span>
              <h3 className="text-xl font-bold text-slate-100">{scheduledData?.pagination?.total || 0}</h3>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium">Sent & Completed</span>
              <h3 className="text-xl font-bold text-slate-100">{sentData?.pagination?.total || 0}</h3>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium">Search Mode</span>
              <h3 className="text-sm font-semibold text-slate-200">Elasticsearch Indexed</h3>
            </div>
          </div>
        </div>

        {/* Search Bar & Tabs Navigation */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
          {/* Tabs */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 self-start">
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'scheduled'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Scheduled Emails</span>
              {scheduledData?.pagination?.total ? (
                <span className="px-1.5 py-0.5 rounded-full bg-slate-950/60 text-[10px]">
                  {scheduledData.pagination.total}
                </span>
              ) : null}
            </button>

            <button
              onClick={() => setActiveTab('sent')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'sent'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Sent Emails</span>
              {sentData?.pagination?.total ? (
                <span className="px-1.5 py-0.5 rounded-full bg-slate-950/60 text-[10px]">
                  {sentData.pagination.total}
                </span>
              ) : null}
            </button>
          </div>

          {/* Search Input */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search recipient, subject, body..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {isSearchLoading && (
              <span className="text-[10px] text-slate-400 absolute right-3 top-1/2 -translate-y-1/2">
                Searching...
              </span>
            )}
          </div>
        </div>

        {/* Content Table View */}
        {isSearching ? (
          <div>
            <div className="mb-3 text-xs text-slate-400 flex items-center gap-2">
              <span>Elasticsearch query results for:</span>
              <span className="font-semibold text-indigo-400">"{searchQuery}"</span>
            </div>
            <ScheduledEmailsTable
              emails={searchResults || []}
              isLoading={isSearchLoading}
              onPageChange={() => {}}
              onSelectEmail={(email) => setSelectedEmail(email)}
            />
          </div>
        ) : activeTab === 'scheduled' ? (
          <ScheduledEmailsTable
            emails={scheduledData?.items || []}
            pagination={scheduledData?.pagination}
            isLoading={isScheduledLoading}
            onPageChange={(page) => setScheduledPage(page)}
            onSelectEmail={(email) => setSelectedEmail(email)}
          />
        ) : (
          <SentEmailsTable
            emails={sentData?.items || []}
            pagination={sentData?.pagination}
            isLoading={isSentLoading}
            onPageChange={(page) => setSentPage(page)}
            onSelectEmail={(email) => setSelectedEmail(email)}
          />
        )}
      </div>

      {/* Modals */}
      <ComposeEmailModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSchedule={handleScheduleCampaign}
        isScheduling={isScheduling}
      />

      <EmailDetailModal email={selectedEmail} onClose={() => setSelectedEmail(null)} />
    </DashboardLayout>
  );
};
