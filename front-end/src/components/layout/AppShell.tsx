import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ClockCounterClockwise,
  FolderSimple,
  HardDrives,
  List,
  SignOut,
  SquaresFour,
  Tag,
  UploadSimple,
  UserCircle,
  X,
} from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const navItems = [
  { to: '/', label: 'Dashboard', icon: SquaresFour, end: true },
  { to: '/arquivos', label: 'Meus Arquivos', icon: FolderSimple, end: false },
  { to: '/categorias', label: 'Categorias', icon: Tag, end: false },
  { to: '/logs', label: 'Logs de Atividade', icon: ClockCounterClockwise, end: false },
  { to: '/perfil', label: 'Meu Perfil', icon: UserCircle, end: false },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const renderNavLinks = (onClickItem?: () => void) => (
    <nav className="flex flex-col gap-1 px-3 py-4" aria-label="Navegação principal">
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onClickItem}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-foreground)]',
            )
          }
        >
          <Icon size={20} weight="duotone" aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex h-16 items-center gap-2.5 border-b border-[var(--color-border)] px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[var(--color-on-primary)]">
            <HardDrives size={20} weight="fill" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold tracking-tight text-[var(--color-foreground)] truncate">
              VaultLocal
            </p>
            <p className="text-[11px] text-[var(--color-muted-foreground)] truncate">
              Gestão Interna de Arquivos
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">{renderNavLinks()}</div>

        <div className="border-t border-[var(--color-border)] p-3">
          <div className="flex items-center gap-2.5 rounded-lg bg-[var(--color-surface-subtle)] px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/15 text-xs font-bold uppercase text-[var(--color-primary)]">
              {user?.apelido?.slice(0, 2) || 'US'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[var(--color-foreground)]">
                {user?.apelido}
              </p>
              <p className="truncate text-[11px] text-[var(--color-muted-foreground)]">
                {user?.email}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              aria-label="Sair da conta"
              title="Sair"
              className="h-8 w-8 shrink-0"
            >
              <SignOut size={16} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] px-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[var(--color-on-primary)]">
                  <HardDrives size={18} weight="fill" aria-hidden="true" />
                </div>
                <span className="text-sm font-bold text-[var(--color-foreground)]">VaultLocal</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fechar menu"
              >
                <X size={18} aria-hidden="true" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {renderNavLinks(() => setMobileMenuOpen(false))}
            </div>
            <div className="border-t border-[var(--color-border)] p-3">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <SignOut size={16} aria-hidden="true" />
                Sair ({user?.apelido})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-64 min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menu de navegação"
            >
              <List size={18} aria-hidden="true" />
            </Button>
            <span className="text-sm font-semibold text-[var(--color-foreground)] lg:hidden">
              VaultLocal
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              size="sm"
              onClick={() => navigate('/arquivos?upload=1')}
            >
              <UploadSimple size={16} weight="bold" aria-hidden="true" />
              <span className="hidden sm:inline">Enviar Arquivo</span>
              <span className="sm:hidden">Enviar</span>
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
