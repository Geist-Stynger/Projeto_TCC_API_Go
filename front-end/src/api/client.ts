import axios, { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';

const TOKEN_STORAGE_KEY = 'vaultlocal_token';
const USER_STORAGE_KEY = 'vaultlocal_user';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status;
    const isAuthRoute =
      error.config?.url?.includes('/usuarios/login') ||
      error.config?.url?.includes('/usuarios/create');

    if (status === 401 && !isAuthRoute) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown, fallback = 'Ocorreu um erro inesperado.'): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data;
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    if (error.code === 'ERR_NETWORK') {
      return 'Não foi possível conectar ao servidor da API. Verifique se o back-end Go está em execução.';
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export { TOKEN_STORAGE_KEY, USER_STORAGE_KEY };
