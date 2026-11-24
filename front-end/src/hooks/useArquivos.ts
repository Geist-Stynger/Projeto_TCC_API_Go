import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { arquivosApi } from '@/api/arquivos.api';
import type { UpdateArquivoPayload, UploadArquivoPayload } from '@/types/api';

export const ARQUIVOS_QUERY_KEY = ['arquivos'] as const;

export function useArquivos() {
  return useQuery({
    queryKey: ARQUIVOS_QUERY_KEY,
    queryFn: arquivosApi.listAll,
  });
}

export function useUploadArquivo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      payload,
      onProgress,
    }: {
      payload: UploadArquivoPayload;
      onProgress?: (percent: number) => void;
    }) => arquivosApi.upload(payload, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ARQUIVOS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
  });
}

export function useUpdateArquivo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateArquivoPayload }) =>
      arquivosApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ARQUIVOS_QUERY_KEY });
    },
  });
}

export function useDeleteArquivo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => arquivosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ARQUIVOS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
  });
}
