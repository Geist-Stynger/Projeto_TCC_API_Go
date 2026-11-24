import { useMemo, useState } from 'react';
import { MagnifyingGlass, PencilSimple, Plus, Tag, Trash } from '@phosphor-icons/react';
import { toast } from 'sonner';
import type { Categoria } from '@/types/api';
import { useCategorias, useDeleteCategoria } from '@/hooks/useCategorias';
import { useArquivos } from '@/hooks/useArquivos';
import { getApiErrorMessage } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog, EmptyState } from '@/components/ui/EmptyState';
import { CategoryFormModal } from '@/components/categorias/CategoryFormModal';

export function CategoriasPage() {
  const { data: categorias = [], isLoading } = useCategorias();
  const { data: arquivos = [] } = useArquivos();
  const deleteMutation = useDeleteCategoria();

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [deleting, setDeleting] = useState<Categoria | null>(null);

  const fileCountByCategory = useMemo(() => {
    const counts = new Map<number, number>();
    for (const file of arquivos) {
      counts.set(file.categoria_id, (counts.get(file.categoria_id) ?? 0) + 1);
    }
    return counts;
  }, [arquivos]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categorias;
    return categorias.filter(
      (cat) =>
        cat.nome.toLowerCase().includes(q) || cat.descricao.toLowerCase().includes(q),
    );
  }, [categorias, search]);

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync(deleting.id);
      toast.success(`Categoria "${deleting.nome}" excluída.`);
      setDeleting(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erro ao excluir categoria.'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Classifique e organize os arquivos armazenados no sistema.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={16} weight="bold" aria-hidden="true" />
          Nova Categoria
        </Button>
      </div>

      <div className="relative max-w-sm">
        <MagnifyingGlass
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar categorias..."
          aria-label="Buscar categorias"
          className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-3 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]/70 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]/20"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="h-32 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Tag size={24} weight="duotone" />}
          title={search ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria cadastrada'}
          description={
            search
              ? 'Tente ajustar o termo de busca.'
              : 'Crie sua primeira categoria para começar a enviar e organizar arquivos.'
          }
          action={
            !search ? (
              <Button
                size="sm"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <Plus size={16} aria-hidden="true" />
                Criar categoria
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cat) => {
            const count = fileCountByCategory.get(cat.id) ?? 0;
            return (
              <div
                key={cat.id}
                className="flex flex-col justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-colors hover:border-[var(--color-primary)]/40"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                        <Tag size={18} weight="duotone" aria-hidden="true" />
                      </div>
                      <h2 className="truncate text-sm font-semibold text-[var(--color-foreground)]">
                        {cat.nome}
                      </h2>
                    </div>
                    <Badge variant="primary">
                      {count} {count === 1 ? 'arquivo' : 'arquivos'}
                    </Badge>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[var(--color-muted-foreground)] line-clamp-3">
                    {cat.descricao}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
                  <span className="font-mono text-[11px] text-[var(--color-muted-foreground)]">
                    ID #{cat.id}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Editar categoria ${cat.nome}`}
                      onClick={() => {
                        setEditing(cat);
                        setFormOpen(true);
                      }}
                    >
                      <PencilSimple size={16} aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Excluir categoria ${cat.nome}`}
                      className="text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10 hover:text-[var(--color-destructive)]"
                      onClick={() => setDeleting(cat)}
                    >
                      <Trash size={16} aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CategoryFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        editing={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Excluir categoria"
        description={`Tem certeza que deseja excluir a categoria "${deleting?.nome}"? Essa ação não pode ser desfeita.`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
