import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Campaign, ScheduleCampaignPayload } from '../types/campaign';

export function useCampaigns() {
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading } = useQuery<Campaign[]>({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const res = await api.get('/campaigns');
      return res.data.data;
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: async (payload: ScheduleCampaignPayload) => {
      const res = await api.post('/campaigns/schedule', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });

  return {
    campaigns: campaigns || [],
    isLoading,
    scheduleCampaign: (payload: ScheduleCampaignPayload) => scheduleMutation.mutateAsync(payload),
    isScheduling: scheduleMutation.isPending,
  };
}
