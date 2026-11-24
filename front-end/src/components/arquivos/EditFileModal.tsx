import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Arquivo } from '@/types/api';
import { useCategorias } from '@/hooks/useCategorias';
import { useUpdateArquivo } from '@/hooks/useArquivos';
import { getApiErrorMessage } from '@/api/client';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface EditFileModalProps {
  arquivo: Arquivo | null;
  onClose: () => void;
}

export function EditFileModal({ arquivo, onClose }: EditFileModalProps) {
  const { data: categorias = [] } = useCategorias();
  const updateMutation = useUpdateArquivo();

  const [descricao, setDescricao] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (arquivo) {
      setDescricao(arquivo.descricao);
      setCategoriaId(String(arquivo.categoria_id));
      setErrorMsg(null);
    }
  }, [arquivo]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!arquivo) return;
    if (!descricao.trim()) {
      setErrorMsg('A descrição é obrigatória.');
      return;
    }
    const parsedCat = Number(categoriaId);
    if (!parsedCat) {
      setErrorMsg('Selecione uma categoria válida.');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: arquivo.id_arquivo,
        payload: {
          descricao: descricao.trim(),
          categoria_id: parsedCat,
        },
      });
      toast.success('Metadados do arquivo atualizados!');
      onClose();
    } catch (error) {
      const msg = getApiErrorMessage(error, 'Erro ao atualizar arquivo.');
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <Modal
      open={Boolean(arquivo)}
      onClose={onClose}
      title="Editar Arquivo"
      description={arquivo ? `Alterando metadados de "${arquivo.nome}"` : undefined}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div
            role="alert"
            className="rounded-lg border border-[var(--color-destructive)]/30 bg-[var(--color-destructive)]/10 px-3.5 py-2.5 text-xs text-[var(--color-destructive)]"
          >
            {errorMsg}
          </div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="edit-categoria"
            className="block text-sm font-medium text-[var(--color-foreground)]"
          >
            Categoria
          </label>
          <select
            id="edit-categoria"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]/20"
          >
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="edit-descricao"
            className="block text-sm font-medium text-[var(--color-foreground)]"
          >
            Descrição
          </label>
          <textarea
            id="edit-descricao"
            rows={3}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]/20"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={updateMutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={updateMutation.isPending}>
            Salvar alterações
          </Button>
        </div>
      </form>
    </Modal>
  );
}
