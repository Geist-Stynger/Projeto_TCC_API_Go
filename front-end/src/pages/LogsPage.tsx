import { useMemo, useState } from 'react';
import { ClockCounterClockwise, MagnifyingGlass } from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { useLogs } from '@/hooks/useLogs';
import { formatDateTime } from '@/utils/format';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

function getActionVariant(action: string): 'success' | 'destructive' | 'primary' | 'default' {
  const upper = action.toUpperCase();
  if (upper.includes('UPLOAD') || upper.includes('CRIAR')) return 'success';
  if (upper.includes('DELETE') || upper.includes('EXCLUIR')) return 'destructive';
  if (upper.includes('UPDATE') || upper.includes('ALTERAR')) return 'primary';
  return 'default';
}

export function LogsPage() {
  const { user } = useAuth();
  const [scope, setScope] = useState<'all' | 'mine'>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const { data: logs = [], isLoading } = useLogs(scope === 'mine' ? user?.id_usuario : undefined);

  const uniqueActions = useMemo(() => {
    const set = new Set<string>();
    for (const entry of logs) {
      if (entry.action) set.add(entry.action);
    }
    return Array.from(set).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...logs]
      .sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime())
      .filter((entry) => {
        if (actionFilter !== 'all' && entry.action !== actionFilter) return false;
        if (q) {
          return (
            entry.message.toLowerCase().includes(q) ||
            entry.action.toLowerCase().includes(q) ||
            String(entry.user_id).includes(q)
          );
        }
        return true;
      });
  }, [logs, actionFilter, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Logs de Atividade</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Histórico de operações registradas pela API (uploads, exclusões e categorias).
        </p>
      </div>

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
              placeholder="Buscar por mensagem ou ação..."
              aria-label="Buscar logs"
              className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-3 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]/70 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]/20"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            aria-label="Filtrar por ação"
            className="h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]/20"
          >
            <option value="all">Todas as ações</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>

        <div className="inline-flex rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1 self-start">
          <button
            type="button"
            onClick={() => setScope('all')}
            aria-pressed={scope === 'all'}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              scope === 'all'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
            }`}
          >
            Todos os logs
          </button>
          <button
            type="button"
            onClick={() => setScope('mine')}
            aria-pressed={scope === 'mine'}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              scope === 'mine'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
            }`}
          >
            Meus logs
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
            />
          ))}
        </div>
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon={<ClockCounterClockwise size={24} weight="duotone" />}
          title="Nenhum log encontrado"
          description="Não há registros correspondentes aos filtros aplicados."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)]/60 text-xs uppercase tracking-wider text-[var(--color-muted-foreground)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Data / Hora</th>
                <th className="px-4 py-3 font-semibold">Ação</th>
                <th className="px-4 py-3 font-semibold">Mensagem</th>
                <th className="px-4 py-3 font-semibold text-right hidden sm:table-cell">
                  Usuário
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filteredLogs.map((log) => (
                <tr key={log.ID} className="hover:bg-[var(--color-surface-subtle)]/40">
                  <td className="px-4 py-3 font-mono text-xs text-[var(--color-muted-foreground)] whitespace-nowrap">
                    {formatDateTime(log.CreatedAt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge variant={getActionVariant(log.action)}>{log.action}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--color-foreground)]">
                    {log.message}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-[var(--color-muted-foreground)] hidden sm:table-cell whitespace-nowrap">
                    {log.user_id > 0 ? `#${log.user_id}` : 'Sistema'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
