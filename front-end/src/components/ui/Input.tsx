import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--color-foreground)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error) || undefined}
          className={cn(
            'w-full h-10 rounded-lg border bg-[var(--color-surface)] px-3 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]/70 transition-colors',
            error
              ? 'border-[var(--color-destructive)] focus:outline-none focus:ring-2 focus:ring-[var(--color-destructive)]/30'
              : 'border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]/20',
            'disabled:cursor-not-allowed disabled:opacity-60',
            className,
          )}
          {...props}
        />
        {error ? (
          <p role="alert" className="text-xs text-[var(--color-destructive)]">
            {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-[var(--color-muted-foreground)]">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
