import { Moon, Sun } from '@phosphor-icons/react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from './Button';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={className}
      aria-label={isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
      title={isDark ? 'Modo claro' : 'Modo escuro'}
    >
      {isDark ? (
        <Sun size={18} weight="duotone" aria-hidden="true" />
      ) : (
        <Moon size={18} weight="duotone" aria-hidden="true" />
      )}
    </Button>
  );
}
