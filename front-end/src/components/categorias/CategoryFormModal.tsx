import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import type { Categoria } from '@/types/api';
import { useCreateCategoria, useUpdateCategoria } from '@/hooks/useCategorias';
import { getApiErrorMessage } from '@/api/client';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const categoriaSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome da categoria'),
  descricao: z.string().trim().min(1, 'Informe uma descrição'),
});

type CategoriaFormValues = z.infer<typeof categoriaSchema>;

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  editing?: Categoria | null;
  onCreated?: (categoria: Categoria) => void;
}

export function CategoryFormModal({
  open,
  onClose,
  editing,
  onCreated,
}: CategoryFormModalProps) {
  const createMutation = useCreateCategoria();
  const updateMutation = useUpdateCategoria();
  const isEditing = Boolean(editing);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoriaFormValues>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nome: '',
      descricao: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        nome: editing?.nome ?? '',
        descricao: editing?.descricao ?? '',
      });
    }
  }, [open, editing, reset]);

  const onSubmit = async (values: CategoriaFormValues) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload: values });
        toast.success('Categoria atualizada com sucesso!');
      } else {
        const created = await createMutation.mutateAsync(values);
        toast.success('Categoria criada com sucesso!');
        onCreated?.(created);
      }
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erro ao salvar categoria.'));
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Editar Categoria' : 'Nova Categoria'}
      description={
        isEditing
          ? 'Atualize o nome ou a descrição da categoria.'
          : 'Organize seus arquivos agrupando-os por categoria.'
      }
      size="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Nome"
          placeholder="Ex.: Documentos TCC"
          error={errors.nome?.message}
          {...register('nome')}
        />
        <div className="space-y-1.5">
          <label
            htmlFor="cat-descricao"
            className="block text-sm font-medium text-[var(--color-foreground)]"
          >
            Descrição
          </label>
          <textarea
            id="cat-descricao"
            rows={3}
            placeholder="Descreva que tipos de arquivos pertencem a esta categoria..."
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]/70 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]/20"
            {...register('descricao')}
          />
          {errors.descricao && (
            <p role="alert" className="text-xs text-[var(--color-destructive)]">
              {errors.descricao.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" loading={isPending}>
            {isEditing ? 'Salvar alterações' : 'Criar categoria'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
