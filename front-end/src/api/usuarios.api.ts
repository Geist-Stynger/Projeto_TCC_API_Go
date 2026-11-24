import { apiClient } from './client';
import type { UpdateUsuarioPayload, Usuario } from '@/types/api';

export const usuariosApi = {
  async getById(id: number): Promise<Usuario> {
    const { data } = await apiClient.get<{ data: Usuario }>(`/usuarios/read/${id}`);
    return data.data;
  },

  async update(id: number, payload: UpdateUsuarioPayload): Promise<{ message: string }> {
    const { data } = await apiClient.put<{ message: string }>(`/usuarios/update/${id}`, payload);
    return data;
  },

  async delete(id: number): Promise<{ message: string; id_usuario: string }> {
    const { data } = await apiClient.delete<{ message: string; id_usuario: string }>(
      `/usuarios/delete/${id}`,
    );
    return data;
  },
};
