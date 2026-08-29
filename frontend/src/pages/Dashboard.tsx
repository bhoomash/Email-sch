import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useScheduledEmails, useSentEmails, useSearchEmails } from '../hooks/useEmails';
import { useCampaigns } from '../hooks/useCampaigns';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ScheduledEmailsTable } from '../components/email/ScheduledEmailsTable';
import { SentEmailsTable } from '../components/email/SentEmailsTable';
import { ComposeEmailModal } from '../components/email/ComposeEmailModal';
import { EmailDetailView } from '../components/email/EmailDetailView';
import { EmailItem } from '../types/email';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { FiSearch, FiPlus, FiClock, FiSend } from 'react-icons/fi';
import { Button } from '../components/ui/Button';

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
        `Successfully scheduled ${result.totalScheduled} email(s) into queue!`
      );
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to schedule campaign');
      throw err;
    }
  };

  if (!user) return null;

  const isSearching = searchQuery.trim().length > 0;

  return (
    <DashboardLayout
      user={user}
      onLogout={logout}
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab);
        setSelectedEmail(null);
      }}
      onOpenCompose={() => setIsComposeOpen(true)}
      scheduledCount={scheduledData?.pagination?.total || 0}
      sentCount={sentData?.pagination?.total || 0}
    >
      {/* Toast Layer */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>

      <div className="space-y-5">
        {/* Top Control Header with Search & Compose */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-1">
          {/* Search Box */}
          <div className="relative flex-1 w-full max-w-full sm:max-w-md">
            <FiSearch className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-none pl-10 pr-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00a854]"
            />
            {isSearchLoading && (
              <span className="text-[10px] text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 font-medium">
                Searching...
              </span>
            )}
          </div>

          <Button
            variant="primary"
            onClick={() => setIsComposeOpen(true)}
            leftIcon={<FiPlus className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Compose New Email
          </Button>
        </div>




        {/* View Switching: Detail View vs List View */}
        {selectedEmail ? (
          <EmailDetailView email={selectedEmail} onBack={() => setSelectedEmail(null)} />
        ) : isSearching ? (
          <div>
            <div className="mb-3 text-xs text-gray-600 flex items-center gap-2">
              <span>Search query results for:</span>
              <span className="font-bold text-[#00a854]">"{searchQuery}"</span>
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

      {/* Compose Email Modal */}
      <ComposeEmailModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSchedule={handleScheduleCampaign}
        isScheduling={isScheduling}
      />
    </DashboardLayout>
  );
};

