import { useQuery } from '@tanstack/react-query';
import { logsApi } from '@/api/logs.api';

export function useLogs(userId?: number) {
  return useQuery({
    queryKey: userId ? ['logs', 'user', userId] : ['logs', 'all'],
    queryFn: () => (userId ? logsApi.listByUser(userId) : logsApi.listAll()),
  });
}
