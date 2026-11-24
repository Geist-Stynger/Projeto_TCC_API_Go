import { apiClient } from './client';
import type { Categoria, CategoriaPayload } from '@/types/api';

export const categoriasApi = {
  async listAll(): Promise<Categoria[]> {
    const { data } = await apiClient.get<Categoria[]>('/categorias/read_all');
    return Array.isArray(data) ? data : [];
  },

  async getById(id: number): Promise<Categoria> {
    const { data } = await apiClient.get<Categoria>(`/categorias/read/${id}`);
    return data;
  },

  async create(payload: CategoriaPayload): Promise<Categoria> {
    const { data } = await apiClient.post<Categoria>('/categorias/create', payload);
    return data;
  },

  async update(id: number, payload: CategoriaPayload): Promise<{ message: string }> {
    const { data } = await apiClient.put<{ message: string }>(`/categorias/update/${id}`, payload);
    return data;
  },

  async delete(id: number): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(`/categorias/delete/${id}`);
    return data;
  },
};
