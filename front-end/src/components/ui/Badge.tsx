import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'destructive';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-surface-subtle)] text-[var(--color-muted-foreground)] border-[var(--color-border)]',
  primary: 'bg-[var(--color-primary)]/12 text-[var(--color-primary)] border-[var(--color-primary)]/25',
  success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  destructive: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
};

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
