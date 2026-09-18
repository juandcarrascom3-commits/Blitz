/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { VectorCanvas } from './components/VectorCanvas';
import { useAppStore } from './store/store';
import { useKanbanStore } from './store/kanbanStore';
import { KanbanBoard } from './components/KanbanBoard';
import { Dashboard } from './components/Dashboard';
import { QuickAddModal } from './components/QuickAddModal';
import { TaskDetailsPanel } from './components/TaskDetailsPanel';
import { AnalyticsView } from './components/AnalyticsView';
import { Settings } from './components/Settings';

// Placeholder de la Fase 1
const PlaceholderView = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="h-full flex flex-col p-6 md:p-12 text-[var(--text-main)] glow-container">
    <h2 className="text-4xl font-light tracking-wide mb-4">{title}</h2>
    <p className="text-[var(--text-muted)] max-w-lg leading-relaxed">{subtitle}</p>
    
    <div className="mt-12 bg-[var(--glass-panel)] backdrop-blur-md rounded-3xl h-[400px] flex items-center justify-center border-dashed border-[var(--glass-border)]">
      <p className="text-[var(--text-muted)] font-mono text-sm">[ Espacio de Trabajo Preparado ]</p>
    </div>
  </div>
);

export default function App() {
  const { initTheme, activeTab, setMobileMenuOpen } = useAppStore();
  const { fetchTasks } = useKanbanStore();

  useEffect(() => {
    initTheme();
    fetchTasks();
  }, [initTheme, fetchTasks]);

  // Controlador de Vistas
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'kanban':
        return <KanbanBoard />;
      case 'notes':
        return <PlaceholderView title="Notes" subtitle="Editor Markdown hiper-enfocado vinculado a tus tareas." />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-dvh flex relative bg-[var(--bg-primary)]">
      {/* 3D Network Background (siempre al fondo, solo si no estamos en Analytics que tiene el suyo) */}
      {activeTab !== 'analytics' && <VectorCanvas />}
      
      {/* Navegación Lateral (Maneja su propio Off-canvas en móviles) */}
      <Sidebar />

      {/* Área Principal de Contenido */}
      <main className="min-w-0 flex-1 flex flex-col min-h-0 relative z-10">
        
        {/* Cabecera Móvil (Solo visible en pantallas pequeñas) */}
        <header className="md:hidden flex items-center justify-between p-5 bg-[var(--glass-panel)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl mx-4 mt-4 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="text-[var(--text-main)] hover:text-[var(--glow-low)] transition-colors outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-lg tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-main)] to-[var(--text-muted)]">
              Nexus
            </span>
          </div>
        </header>

        {/* Viewport de Tab dinámico */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar relative z-10">
          {renderContent()}
        </div>
      </main>
      
      {/* Viñeta de Profundidad Suavizada */}
      <div className="pointer-events-none fixed inset-0 shadow-[inset_0_0_200px_rgba(15,23,42,0.4)] z-50 mix-blend-overlay"></div>
      
      {/* Modals y Overlays */}
      <QuickAddModal />
      <TaskDetailsPanel />
    </div>
  );
}

