import { describe, expect, it } from 'vitest';
import type { Arquivo } from '@/types/api';
import { buildBreadcrumbs, getFolderContents, getParentFolder } from './folders';

const mockFiles: Arquivo[] = [
  {
    id_arquivo: 1,
    nome: 'raiz.txt',
    caminho: 'raiz.txt',
    descricao: 'Arquivo na raiz',
    tamanho: 100,
    categoria_id: 1,
    usuario_id: 1,
    data_criacao: '2026-11-24T10:00:00Z',
    data_alteracao: '2026-11-24T10:00:00Z',
  },
  {
    id_arquivo: 2,
    nome: 'cap1.pdf',
    caminho: 'tcc/capitulos/cap1.pdf',
    descricao: 'Capítulo 1',
    tamanho: 2048,
    categoria_id: 1,
    usuario_id: 1,
    data_criacao: '2026-11-24T11:00:00Z',
    data_alteracao: '2026-11-24T11:00:00Z',
  },
  {
    id_arquivo: 3,
    nome: 'capa.png',
    caminho: 'tcc/capa.png',
    descricao: 'Capa',
    tamanho: 4096,
    categoria_id: 2,
    usuario_id: 1,
    data_criacao: '2026-11-24T12:00:00Z',
    data_alteracao: '2026-11-24T12:00:00Z',
  },
];

describe('folders utils', () => {
  it('extracts parent folders accurately', () => {
    expect(getParentFolder('raiz.txt')).toBe('');
    expect(getParentFolder('tcc/capa.png')).toBe('tcc');
    expect(getParentFolder('tcc/capitulos/cap1.pdf')).toBe('tcc/capitulos');
  });

  it('lists subfolders and files for root and nested folders', () => {
    const root = getFolderContents(mockFiles, '');
    expect(root.files.map((f) => f.nome)).toEqual(['raiz.txt']);
    expect(root.subfolders).toEqual([{ name: 'tcc', fullPath: 'tcc', fileCount: 2 }]);

    const tcc = getFolderContents(mockFiles, 'tcc');
    expect(tcc.files.map((f) => f.nome)).toEqual(['capa.png']);
    expect(tcc.subfolders).toEqual([
      { name: 'capitulos', fullPath: 'tcc/capitulos', fileCount: 1 },
    ]);
  });

  it('builds breadcrumbs from folder paths', () => {
    expect(buildBreadcrumbs('')).toEqual([]);
    expect(buildBreadcrumbs('tcc/capitulos')).toEqual([
      { label: 'tcc', path: 'tcc' },
      { label: 'capitulos', path: 'tcc/capitulos' },
    ]);
  });
});
