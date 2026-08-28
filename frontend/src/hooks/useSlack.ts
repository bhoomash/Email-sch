import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { SlackStatus } from '../types/slack';

export function useSlack() {
  const queryClient = useQueryClient();

  const { data: status, isLoading } = useQuery<SlackStatus>({
    queryKey: ['slack', 'status'],
    queryFn: async () => {
      const res = await api.get('/slack/status');
      return res.data.data;
    },
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      const res = await api.get('/slack/connect');
      return res.data.data;
    },
  });

  const mockConnectMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/slack/mock-connect');
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slack', 'status'] });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      await api.delete('/slack/disconnect');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slack', 'status'] });
    },
  });

  return {
    status: status || { isConnected: false },
    isLoading,
    getConnectUrl: () => connectMutation.mutateAsync(),
    mockConnect: () => mockConnectMutation.mutateAsync(),
    disconnect: () => disconnectMutation.mutateAsync(),
    isDisconnecting: disconnectMutation.isPending,
  };
}
