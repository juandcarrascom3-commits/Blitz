import { LayoutDashboard, KanbanSquare, FileText, AreaChart, Settings, Hexagon, X, LucideIcon } from 'lucide-react';
import { useAppStore, Tab } from '../store/store';
import { clsx } from 'clsx';
import { useEffect } from 'react';

const navItems: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'kanban', label: 'Kanban', icon: KanbanSquare },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'analytics', label: 'Analytics & 3D', icon: AreaChart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar = () => {
  const { activeTab, setActiveTab, isMobileMenuOpen, setMobileMenuOpen } = useAppStore();

  // Cerrar el drawer móvil con la tecla Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setMobileMenuOpen]);

  return (
    <>
      {/* Overlay Móvil */}
      <div 
        className={clsx(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden",
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Menú Sidebar */}
      <aside 
        className={clsx(
          "fixed md:relative z-50 w-64 min-w-[16rem] flex-shrink-0 shrink-0 h-[calc(100%-2rem)] md:h-[calc(100%-3rem)] glass-panel-extreme flex flex-col p-6 m-4 md:my-6 md:ml-6 rounded-[2rem] transition-transform duration-300 ease-out max-h-dvh overflow-y-auto no-scrollbar",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-[120%] md:translate-x-0"
        )}
      >
        {/* Botón de Cierre Móvil */}
        <button 
          className="md:hidden absolute top-6 right-6 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          onClick={() => setMobileMenuOpen(false)}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Branding */}
        <div className="flex items-center gap-4 mb-12 mt-2 md:mt-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/80 to-cyan-500/80 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            <Hexagon className="text-white w-7 h-7" />
          </div>
          <span className="font-bold text-2xl tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-main)] to-[var(--text-muted)]">
            Nexus
          </span>
        </div>

        {/* Navegación */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false); // Auto close on mobile
                }}
                className={clsx(
                  "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ease-out group outline-none hover:-translate-y-1",
                  isActive 
                    ? "bg-[var(--glass-panel)] text-[var(--text-main)] shadow-[0_8px_16px_rgba(0,0,0,0.1)] border border-[var(--glass-border)]" 
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--glass-panel)] hover:shadow-lg border border-transparent hover:border-[var(--glass-border)]"
                )}
              >
                <Icon className={clsx(
                  "w-5 h-5 transition-transform duration-300", 
                  isActive ? "scale-110 drop-shadow-[0_0_8px_var(--glow-low)] text-[var(--glow-low)]" : "group-hover:scale-110"
                )} />
                <span className="font-medium tracking-wide text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Personal */}
        <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-[var(--glass-panel)] to-transparent border border-[var(--glass-border)]">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-semibold mb-1">Entorno</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--glow-low)] animate-pulse shadow-[0_0_8px_var(--glow-low)]"></div>
            <p className="text-sm text-[var(--text-main)] opacity-80 font-mono">Espacio Personal</p>
          </div>
        </div>
      </aside>
    </>
  );
};
