import { apiClient } from './client';
import type {
  Arquivo,
  UpdateArquivoPayload,
  UploadArquivoPayload,
} from '@/types/api';

export const arquivosApi = {
  async listAll(): Promise<Arquivo[]> {
    const { data } = await apiClient.get<Arquivo[]>('/arquivos/read_all');
    return Array.isArray(data) ? data : [];
  },

  async getById(id: number): Promise<Arquivo> {
    const { data } = await apiClient.get<Arquivo>(`/arquivos/read/${id}`);
    return data;
  },

  async upload(
    payload: UploadArquivoPayload,
    onProgress?: (percent: number) => void,
  ): Promise<{ message: string; data: Arquivo }> {
    const formData = new FormData();
    formData.append('arquivo', payload.arquivo);
    formData.append('nome', payload.nome.trim());
    if (payload.caminho && payload.caminho.trim() !== '') {
      formData.append('caminho', payload.caminho.trim());
    }
    formData.append('descricao', payload.descricao.trim());
    formData.append('categoria_id', String(payload.categoria_id));

    const { data } = await apiClient.post<{ message: string; data: Arquivo }>(
      '/arquivos/create',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 0,
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            onProgress(Math.round((event.loaded * 100) / event.total));
          }
        },
      },
    );
    return data;
  },

  async update(id: number, payload: UpdateArquivoPayload): Promise<Arquivo> {
    const { data } = await apiClient.put<Arquivo>(`/arquivos/update/${id}`, payload);
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/arquivos/delete/${id}`);
  },

  async fetchBlob(id: number, inline = false): Promise<Blob> {
    const { data } = await apiClient.get<Blob>(`/arquivos/download/${id}`, {
      params: inline ? { inline: 'true' } : undefined,
      responseType: 'blob',
      timeout: 0,
    });
    return data;
  },
};
