import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Sender } from '../types/sender';

export function useSenders() {
  const queryClient = useQueryClient();

  const { data: senders, isLoading } = useQuery<Sender[]>({
    queryKey: ['senders'],
    queryFn: async () => {
      const res = await api.get('/senders');
      return res.data.data;
    },
  });

  const createEtherealMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/senders/ethereal');
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['senders'] });
    },
  });

  return {
    senders: senders || [],
    isLoading,
    createEtherealSender: () => createEtherealMutation.mutateAsync(),
    isCreating: createEtherealMutation.isPending,
  };
}
