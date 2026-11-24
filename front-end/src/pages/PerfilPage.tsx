import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FloppyDisk, Trash, UserCircle, Warning } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { usuariosApi } from '@/api/usuarios.api';
import { getApiErrorMessage } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/EmptyState';

const perfilSchema = z.object({
  apelido: z.string().trim().min(2, 'O apelido deve ter pelo menos 2 caracteres'),
  email: z.string().trim().email('Informe um e-mail válido'),
});

type PerfilFormValues = z.infer<typeof perfilSchema>;

export function PerfilPage() {
  const { user, updateLocalUser, logout } = useAuth();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PerfilFormValues>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      apelido: user?.apelido ?? '',
      email: user?.email ?? '',
    },
  });

  useEffect(() => {
    if (!user?.id_usuario) return;
    usuariosApi
      .getById(user.id_usuario)
      .then((fresh) => {
        updateLocalUser(fresh);
        reset({ apelido: fresh.apelido, email: fresh.email });
      })
      .catch(() => {
        // fallback to cached user
      });
  }, [user?.id_usuario, reset, updateLocalUser]);

  const onSubmit = async (values: PerfilFormValues) => {
    if (!user) return;
    try {
      await usuariosApi.update(user.id_usuario, values);
      const updated = { ...user, ...values };
      updateLocalUser(updated);
      reset(values);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Não foi possível atualizar o perfil.'));
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await usuariosApi.delete(user.id_usuario);
      toast.success('Conta excluída com sucesso.');
      logout();
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erro ao excluir a conta.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Gerencie suas informações de acesso ao sistema.
        </p>
      </div>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div className="mb-5 flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <UserCircle size={28} weight="duotone" aria-hidden="true" />
          </div>
          <div>
            <p className="text-base font-semibold text-[var(--color-foreground)]">
              {user?.apelido}
            </p>
            <p className="font-mono text-xs text-[var(--color-muted-foreground)]">
              ID #{user?.id_usuario} • {user?.email}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Apelido"
            error={errors.apelido?.message}
            {...register('apelido')}
          />
          <Input
            label="E-mail"
            type="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
              <FloppyDisk size={16} aria-hidden="true" />
              Salvar alterações
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-[var(--color-destructive)]/30 bg-[var(--color-surface)] p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-destructive)]/10 text-[var(--color-destructive)]">
            <Warning size={20} weight="duotone" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-[var(--color-destructive)]">
              Zona de Perigo
            </h2>
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              Ao excluir sua conta, seu usuário será removido permanentemente do banco de dados e
              você perderá o acesso autenticado.
            </p>
            <div className="mt-4">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash size={15} aria-hidden="true" />
                Excluir minha conta
              </Button>
            </div>
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Excluir conta permanentemente"
        description={`Tem certeza que deseja excluir o usuário "${user?.apelido}" (${user?.email})? Essa ação não pode ser desfeita.`}
        confirmLabel="Sim, excluir conta"
        loading={deleting}
      />
    </div>
  );
}
