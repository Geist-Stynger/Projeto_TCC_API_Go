import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HardDrives, UserPlus } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getApiErrorMessage } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const registerSchema = z
  .object({
    apelido: z.string().trim().min(2, 'O apelido deve ter pelo menos 2 caracteres'),
    email: z.string().trim().email('Informe um e-mail válido'),
    senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmarSenha: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarSenha'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { register: registerUser, login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await registerUser({
        apelido: values.apelido,
        email: values.email,
        senha: values.senha,
      });
      await login({ email: values.email, senha: values.senha });
      toast.success('Conta criada com sucesso!');
      navigate('/', { replace: true });
    } catch (error) {
      const msg = getApiErrorMessage(error, 'Não foi possível criar a conta.');
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-foreground)]">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8 shadow-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)]">
              <HardDrives size={24} weight="fill" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Criar Conta</h1>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
              Cadastre um usuário interno para gerenciar arquivos
            </p>
          </div>

          {serverError && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-[var(--color-destructive)]/30 bg-[var(--color-destructive)]/10 px-3.5 py-2.5 text-xs text-[var(--color-destructive)]"
            >
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Apelido"
              autoComplete="name"
              placeholder="Ex.: Rafael"
              error={errors.apelido?.message}
              {...register('apelido')}
            />
            <Input
              label="E-mail"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Senha"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo de 6 caracteres"
              error={errors.senha?.message}
              {...register('senha')}
            />
            <Input
              label="Confirmar senha"
              type="password"
              autoComplete="new-password"
              placeholder="Repita a senha"
              error={errors.confirmarSenha?.message}
              {...register('confirmarSenha')}
            />
            <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
              <UserPlus size={18} aria-hidden="true" />
              Criar conta e entrar
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-muted-foreground)]">
            Já possui uma conta?{' '}
            <Link
              to="/login"
              className="font-semibold text-[var(--color-primary)] hover:underline"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
