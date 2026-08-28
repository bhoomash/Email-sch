import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { User } from '../types/auth';

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const res = await api.get('/auth/me');
        return res.data.data;
      } catch (err: any) {
        if (err.response?.status === 401) {
          return null;
        }
        throw err;
      }
    },
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null);
      window.location.href = '/login';
    },
  });

  const devLoginMutation = useMutation({
    mutationFn: async (payload: { email: string; name?: string }) => {
      const res = await api.post('/auth/dev-login', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    logout: () => logoutMutation.mutate(),
    devLogin: (email: string, name?: string) => devLoginMutation.mutateAsync({ email, name }),
  };
}
