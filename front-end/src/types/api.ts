export interface Usuario {
  id_usuario: number;
  apelido: string;
  email: string;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  usuario: Usuario;
}

export interface RegisterPayload {
  apelido: string;
  email: string;
  senha: string;
}

export interface RegisterResponse {
  message: string;
  data: Usuario;
}

export interface UpdateUsuarioPayload {
  apelido: string;
  email: string;
}

export interface Categoria {
  id: number;
  nome: string;
  descricao: string;
}

export interface CategoriaPayload {
  nome: string;
  descricao: string;
}

export interface Arquivo {
  id_arquivo: number;
  nome: string;
  caminho: string;
  descricao: string;
  tamanho: number;
  categoria_id: number;
  usuario_id: number;
  data_criacao: string;
  data_alteracao: string;
}

export interface UploadArquivoPayload {
  arquivo: File;
  nome: string;
  caminho?: string;
  descricao: string;
  categoria_id: number;
}

export interface UpdateArquivoPayload {
  descricao: string;
  categoria_id: number;
}

export interface LogEntry {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  message: string;
  user_id: number;
  action: string;
}

export interface ApiErrorResponse {
  error?: string;
  message?: string;
}
