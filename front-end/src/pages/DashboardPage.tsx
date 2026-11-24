import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ClockCounterClockwise,
  Database,
  File as FileIcon,
  FolderSimple,
  Tag,
  UploadSimple,
} from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { useArquivos } from '@/hooks/useArquivos';
import { useCategorias } from '@/hooks/useCategorias';
import { useLogs } from '@/hooks/useLogs';
import { formatBytes, formatDateTime } from '@/utils/format';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

function getActionBadgeVariant(action: string): 'success' | 'destructive' | 'primary' | 'default' {
  const upper = action.toUpperCase();
  if (upper.includes('UPLOAD') || upper.includes('CRIAR')) return 'success';
  if (upper.includes('DELETE') || upper.includes('EXCLUIR')) return 'destructive';
  if (upper.includes('UPDATE') || upper.includes('ALTERAR')) return 'primary';
  return 'default';
}

export function DashboardPage() {
  const { user } = useAuth();
  const { data: arquivos = [], isLoading: loadingFiles } = useArquivos();
  const { data: categorias = [], isLoading: loadingCats } = useCategorias();
  const { data: logs = [], isLoading: loadingLogs } = useLogs();

  const totalBytes = useMemo(
    () => arquivos.reduce((acc, item) => acc + (item.tamanho || 0), 0),
    [arquivos],
  );

  const recentFiles = useMemo(() => {
    return [...arquivos]
      .sort(
        (a, b) =>
          new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime(),
      )
      .slice(0, 5);
  }, [arquivos]);

  const recentLogs = useMemo(() => {
    return [...logs]
      .sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime())
      .slice(0, 6);
  }, [logs]);

  const categoryMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of categorias) map.set(c.id, c.nome);
    return map;
  }, [categorias]);

  const stats = [
    {
      label: 'Total de Arquivos',
      value: loadingFiles ? '—' : String(arquivos.length),
      icon: FolderSimple,
      accent: 'text-[var(--color-primary)] bg-[var(--color-primary)]/12',
    },
    {
      label: 'Espaço Utilizado',
      value: loadingFiles ? '—' : formatBytes(totalBytes),
      icon: Database,
      accent: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    },
    {
      label: 'Categorias',
      value: loadingCats ? '—' : String(categorias.length),
      icon: Tag,
      accent: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
    },
    {
      label: 'Eventos nos Logs',
      value: loadingLogs ? '—' : String(logs.length),
      icon: ClockCounterClockwise,
      accent: 'text-violet-600 dark:text-violet-400 bg-violet-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Olá, {user?.apelido ?? 'usuário'}
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Visão geral do seu armazenamento interno de arquivos.
          </p>
        </div>
        <Link to="/arquivos?upload=1">
          <Button>
            <UploadSimple size={16} weight="bold" aria-hidden="true" />
            Enviar Arquivo
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, accent }) => (
          <div
            key={label}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--color-muted-foreground)]">
                {label}
              </span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
                <Icon size={18} weight="duotone" aria-hidden="true" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-[var(--color-foreground)]">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Two columns: Recent Files + Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Arquivos Recentes</h2>
            <Link
              to="/arquivos"
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline"
            >
              Ver todos
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>

          {loadingFiles ? (
            <div className="space-y-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-lg bg-[var(--color-surface-subtle)]"
                />
              ))}
            </div>
          ) : recentFiles.length === 0 ? (
            <p className="py-8 text-center text-xs text-[var(--color-muted-foreground)]">
              Nenhum arquivo enviado ainda.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {recentFiles.map((file) => (
                <li key={file.id_arquivo} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-subtle)] text-[var(--color-primary)]">
                      <FileIcon size={18} weight="duotone" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--color-foreground)]">
                        {file.nome}
                      </p>
                      <p className="truncate text-xs text-[var(--color-muted-foreground)]">
                        {formatBytes(file.tamanho)} • {formatDateTime(file.data_criacao)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="primary">
                    {categoryMap.get(file.categoria_id) ?? `#${file.categoria_id}`}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lg:col-span-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Atividade Recente</h2>
            <Link
              to="/logs"
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline"
            >
              Ver logs
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>

          {loadingLogs ? (
            <div className="space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-11 animate-pulse rounded-lg bg-[var(--color-surface-subtle)]"
                />
              ))}
            </div>
          ) : recentLogs.length === 0 ? (
            <p className="py-8 text-center text-xs text-[var(--color-muted-foreground)]">
              Nenhum registro de atividade ainda.
            </p>
          ) : (
            <ul className="space-y-3">
              {recentLogs.map((log) => (
                <li
                  key={log.ID}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-subtle)]/40 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={getActionBadgeVariant(log.action)}>{log.action}</Badge>
                    <span className="font-mono text-[11px] text-[var(--color-muted-foreground)]">
                      {formatDateTime(log.CreatedAt)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--color-foreground)]">{log.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
