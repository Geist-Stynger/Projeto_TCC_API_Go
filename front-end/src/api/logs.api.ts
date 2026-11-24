import { apiClient } from './client';
import type { LogEntry } from '@/types/api';

export const logsApi = {
  async listAll(): Promise<LogEntry[]> {
    const { data } = await apiClient.get<LogEntry[]>('/logs/read_all');
    return Array.isArray(data) ? data : [];
  },

  async listByUser(userId: number): Promise<LogEntry[]> {
    const { data } = await apiClient.get<LogEntry[]>(`/logs/read_all/${userId}`);
    return Array.isArray(data) ? data : [];
  },
};
