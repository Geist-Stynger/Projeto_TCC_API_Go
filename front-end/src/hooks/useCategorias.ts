import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriasApi } from '@/api/categorias.api';
import type { CategoriaPayload } from '@/types/api';

export const CATEGORIAS_QUERY_KEY = ['categorias'] as const;

export function useCategorias() {
  return useQuery({
    queryKey: CATEGORIAS_QUERY_KEY,
    queryFn: categoriasApi.listAll,
  });
}

export function useCreateCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoriaPayload) => categoriasApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIAS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
  });
}

export function useUpdateCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoriaPayload }) =>
      categoriasApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIAS_QUERY_KEY });
    },
  });
}

export function useDeleteCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoriasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIAS_QUERY_KEY });
    },
  });
}
