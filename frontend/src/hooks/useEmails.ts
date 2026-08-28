import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { EmailItem, Pagination } from '../types/email';

export function useScheduledEmails(page = 1, limit = 20) {
  return useQuery<{ items: EmailItem[]; pagination: Pagination }>({
    queryKey: ['emails', 'scheduled', page, limit],
    queryFn: async () => {
      const res = await api.get('/emails/scheduled', { params: { page, limit } });
      return res.data.data;
    },
    refetchInterval: 3000, // Poll every 3s to reflect worker status transitions
  });
}

export function useSentEmails(page = 1, limit = 20) {
  return useQuery<{ items: EmailItem[]; pagination: Pagination }>({
    queryKey: ['emails', 'sent', page, limit],
    queryFn: async () => {
      const res = await api.get('/emails/sent', { params: { page, limit } });
      return res.data.data;
    },
    refetchInterval: 3000,
  });
}

export function useSearchEmails(query: string) {
  return useQuery<EmailItem[]>({
    queryKey: ['emails', 'search', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const res = await api.get('/emails/search', { params: { q: query } });
      return res.data.data.items || [];
    },
    enabled: !!query.trim(),
  });
}
