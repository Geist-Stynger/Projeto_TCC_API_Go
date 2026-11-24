import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CaretRight,
  DownloadSimple,
  Eye,
  FileCode,
  FileImage,
  FilePdf,
  FileText,
  File as FileIcon,
  FolderSimple,
  House,
  ListBullets,
  MagnifyingGlass,
  PencilSimple,
  SquaresFour,
  Trash,
  UploadSimple,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import type { Arquivo } from '@/types/api';
import { arquivosApi } from '@/api/arquivos.api';
import { getApiErrorMessage } from '@/api/client';
import { useArquivos, useDeleteArquivo } from '@/hooks/useArquivos';
import { useCategorias } from '@/hooks/useCategorias';
import { formatBytes, formatDateTime, getFileExtension } from '@/utils/format';
import { buildBreadcrumbs, getFolderContents } from '@/utils/folders';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog, EmptyState } from '@/components/ui/EmptyState';
import { UploadFileModal } from '@/components/arquivos/UploadFileModal';
import { EditFileModal } from '@/components/arquivos/EditFileModal';
import { FilePreviewModal } from '@/components/arquivos/FilePreviewModal';

function renderFileIcon(filename: string) {
  const ext = getFileExtension(filename);
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
    return <FileImage size={20} weight="duotone" className="text-emerald-600 dark:text-emerald-400" />;
  }
  if (ext === 'pdf') {
    return <FilePdf size={20} weight="duotone" className="text-red-600 dark:text-red-400" />;
  }
  if (['go', 'ts', 'tsx', 'js', 'json', 'html', 'css', 'yml', 'yaml'].includes(ext)) {
    return <FileCode size={20} weight="duotone" className="text-violet-600 dark:text-violet-400" />;
  }
  if (['txt', 'md', 'csv', 'log', 'doc', 'docx'].includes(ext)) {
    return <FileText size={20} weight="duotone" className="text-blue-600 dark:text-blue-400" />;
  }
  return <FileIcon size={20} weight="duotone" className="text-[var(--color-muted-foreground)]" />;
}

export function ArquivosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: arquivos = [], isLoading } = useArquivos();
  const { data: categorias = [] } = useCategorias();
  const deleteMutation = useDeleteArquivo();

  const [currentFolder, setCurrentFolder] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewing, setPreviewing] = useState<Arquivo | null>(null);
  const [editing, setEditing] = useState<Arquivo | null>(null);
  const [deleting, setDeleting] = useState<Arquivo | null>(null);

  useEffect(() => {
    if (searchParams.get('upload') === '1') {
      setUploadOpen(true);
      searchParams.delete('upload');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const categoryMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const cat of categorias) {
      map.set(cat.id, cat.nome);
    }
    return map;
  }, [categorias]);

  const isFiltering = Boolean(search.trim() || selectedCategory !== 'all');

  const { subfolders, visibleFiles } = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filteredAll = arquivos.filter((file) => {
      if (selectedCategory !== 'all' && String(file.categoria_id) !== selectedCategory) {
        return false;
      }
      if (q) {
        return (
          file.nome.toLowerCase().includes(q) ||
          file.descricao.toLowerCase().includes(q) ||
          file.caminho.toLowerCase().includes(q)
        );
      }
      return true;
    });

    if (isFiltering) {
      return { subfolders: [], visibleFiles: filteredAll };
    }

    const { subfolders: folders, files } = getFolderContents(filteredAll, currentFolder);
    return { subfolders: folders, visibleFiles: files };
  }, [arquivos, currentFolder, search, selectedCategory, isFiltering]);

  const breadcrumbs = useMemo(() => buildBreadcrumbs(currentFolder), [currentFolder]);

  const handleDownload = async (arquivo: Arquivo) => {
    try {
      const blob = await arquivosApi.fetchBlob(arquivo.id_arquivo, false);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = arquivo.nome;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success(`Download iniciado: ${arquivo.nome}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erro ao baixar arquivo.'));
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync(deleting.id_arquivo);
      toast.success(`Arquivo "${deleting.nome}" excluído.`);
      setDeleting(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erro ao excluir arquivo.'));
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meus Arquivos</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Navegue por pastas, pré-visualize, baixe e gerencie seus arquivos locais.
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <UploadSimple size={16} weight="bold" aria-hidden="true" />
          Enviar Arquivo
        </Button>
      </div>

      {/* Filters & View Switcher */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlass
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, descrição ou pasta..."
              aria-label="Buscar arquivos"
              className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-3 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]/70 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]/20"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filtrar por categoria"
            className="h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]/20"
          >
            <option value="all">Todas as categorias</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="inline-flex rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1 self-start">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            aria-label="Visualização em lista"
            aria-pressed={viewMode === 'table'}
            className={`rounded-md px-2.5 py-1.5 text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
              viewMode === 'table'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
            }`}
          >
            <ListBullets size={15} aria-hidden="true" />
            Lista
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            aria-label="Visualização em grade"
            aria-pressed={viewMode === 'grid'}
            className={`rounded-md px-2.5 py-1.5 text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
              viewMode === 'grid'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
            }`}
          >
            <SquaresFour size={15} aria-hidden="true" />
            Grade
          </button>
        </div>
      </div>

      {/* Folder Breadcrumbs */}
      {!isFiltering && (
        <nav
          aria-label="Caminho de pastas"
          className="flex flex-wrap items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs"
        >
          <button
            type="button"
            onClick={() => setCurrentFolder('')}
            className={`inline-flex items-center gap-1.5 rounded px-1.5 py-1 font-medium transition-colors ${
              currentFolder === ''
                ? 'text-[var(--color-primary)]'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
            }`}
          >
            <House size={14} weight="duotone" aria-hidden="true" />
            Raiz
          </button>
          {breadcrumbs.map((crumb) => (
            <div key={crumb.path} className="flex items-center gap-1">
              <CaretRight size={12} className="text-[var(--color-muted-foreground)]" aria-hidden="true" />
              <button
                type="button"
                onClick={() => setCurrentFolder(crumb.path)}
                className={`rounded px-1.5 py-1 font-medium transition-colors ${
                  crumb.path === currentFolder
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
              >
                {crumb.label}
              </button>
            </div>
          ))}
        </nav>
      )}

      {/* Subfolders */}
      {!isLoading && subfolders.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {subfolders.map((folder) => (
            <button
              key={folder.fullPath}
              type="button"
              onClick={() => setCurrentFolder(folder.fullPath)}
              className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 text-left transition-colors hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface-subtle)]/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <FolderSimple size={22} weight="fill" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--color-foreground)]">
                  {folder.name}
                </p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {folder.fileCount} {folder.fileCount === 1 ? 'arquivo' : 'arquivos'}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Files Content */}
      {isLoading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="h-14 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
            />
          ))}
        </div>
      ) : visibleFiles.length === 0 && subfolders.length === 0 ? (
        <EmptyState
          icon={<FolderSimple size={24} weight="duotone" />}
          title={isFiltering ? 'Nenhum arquivo encontrado' : 'Esta pasta está vazia'}
          description={
            isFiltering
              ? 'Nenhum arquivo corresponde aos filtros atuais.'
              : 'Envie seu primeiro arquivo para começar a usar o repositório.'
          }
          action={
            !isFiltering ? (
              <Button size="sm" onClick={() => setUploadOpen(true)}>
                <UploadSimple size={15} aria-hidden="true" />
                Enviar arquivo
              </Button>
            ) : undefined
          }
        />
      ) : visibleFiles.length > 0 && viewMode === 'table' ? (
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)]/60 text-xs uppercase tracking-wider text-[var(--color-muted-foreground)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Arquivo</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Categoria</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Tamanho</th>
                <th className="px-4 py-3 font-semibold hidden lg:table-cell">Atualizado</th>
                <th className="px-4 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {visibleFiles.map((file) => {
                const catName = categoryMap.get(file.categoria_id) ?? `#${file.categoria_id}`;
                return (
                  <tr
                    key={file.id_arquivo}
                    className="transition-colors hover:bg-[var(--color-surface-subtle)]/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-subtle)]">
                          {renderFileIcon(file.nome)}
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => setPreviewing(file)}
                            className="block max-w-[220px] sm:max-w-[320px] truncate text-left font-medium text-[var(--color-foreground)] hover:text-[var(--color-primary)] hover:underline"
                          >
                            {file.nome}
                          </button>
                          <p className="max-w-[220px] sm:max-w-[320px] truncate text-xs text-[var(--color-muted-foreground)]">
                            {file.descricao}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge variant="primary">{catName}</Badge>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell font-mono text-xs text-[var(--color-muted-foreground)] whitespace-nowrap">
                      {formatBytes(file.tamanho)}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-[var(--color-muted-foreground)] whitespace-nowrap">
                      {formatDateTime(file.data_alteracao)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Visualizar ${file.nome}`}
                          title="Visualizar"
                          onClick={() => setPreviewing(file)}
                        >
                          <Eye size={16} aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Baixar ${file.nome}`}
                          title="Baixar"
                          onClick={() => handleDownload(file)}
                        >
                          <DownloadSimple size={16} aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Editar ${file.nome}`}
                          title="Editar"
                          onClick={() => setEditing(file)}
                        >
                          <PencilSimple size={16} aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Excluir ${file.nome}`}
                          title="Excluir"
                          className="text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10 hover:text-[var(--color-destructive)]"
                          onClick={() => setDeleting(file)}
                        >
                          <Trash size={16} aria-hidden="true" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : visibleFiles.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleFiles.map((file) => {
            const catName = categoryMap.get(file.categoria_id) ?? `#${file.categoria_id}`;
            return (
              <div
                key={file.id_arquivo}
                className="flex flex-col justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-primary)]/40"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-subtle)]">
                        {renderFileIcon(file.nome)}
                      </div>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => setPreviewing(file)}
                          className="block truncate text-left text-sm font-semibold text-[var(--color-foreground)] hover:text-[var(--color-primary)] hover:underline"
                        >
                          {file.nome}
                        </button>
                        <p className="font-mono text-[11px] text-[var(--color-muted-foreground)]">
                          {formatBytes(file.tamanho)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="primary">{catName}</Badge>
                  </div>
                  <p className="mt-3 text-xs text-[var(--color-muted-foreground)] line-clamp-2">
                    {file.descricao}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
                  <span className="text-[11px] text-[var(--color-muted-foreground)]">
                    {formatDateTime(file.data_alteracao)}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Visualizar ${file.nome}`}
                      onClick={() => setPreviewing(file)}
                    >
                      <Eye size={15} aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Baixar ${file.nome}`}
                      onClick={() => handleDownload(file)}
                    >
                      <DownloadSimple size={15} aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Editar ${file.nome}`}
                      onClick={() => setEditing(file)}
                    >
                      <PencilSimple size={15} aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Excluir ${file.nome}`}
                      className="text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10 hover:text-[var(--color-destructive)]"
                      onClick={() => setDeleting(file)}
                    >
                      <Trash size={15} aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <UploadFileModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        defaultFolder={currentFolder}
      />

      <EditFileModal arquivo={editing} onClose={() => setEditing(null)} />

      <FilePreviewModal
        arquivo={previewing}
        categoryName={previewing ? categoryMap.get(previewing.categoria_id) : undefined}
        onClose={() => setPreviewing(null)}
        onDownload={handleDownload}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Excluir arquivo"
        description={`Tem certeza que deseja excluir permanentemente "${deleting?.nome}"? O arquivo será removido do disco e do banco de dados.`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
