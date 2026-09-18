import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Tab = 'dashboard' | 'kanban' | 'notes' | 'analytics' | 'settings';
export type Theme = 'cyber-glass' | 'industrial' | 'minimal-light';

interface AppState {
  // Navigation State
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  
  // Mobile Menu State
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;

  // OmniBar State
  isQuickAddOpen: boolean;
  setQuickAddOpen: (isOpen: boolean) => void;
  
  // Theme State
  theme: Theme;
  setTheme: (theme: Theme) => void;
  initTheme: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeTab: 'kanban', // Iniciamos en Kanban por defecto
      setActiveTab: (tab) => set({ activeTab: tab, isMobileMenuOpen: false }), // Navegar cierra el menú móvil
      
      isMobileMenuOpen: false,
      setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
      
      isQuickAddOpen: false,
      setQuickAddOpen: (isOpen) => set({ isQuickAddOpen: isOpen }),
      
      theme: 'cyber-glass',
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
      },
      initTheme: () => {
        document.documentElement.setAttribute('data-theme', get().theme);
      },
    }),
    {
      name: 'nexus-personal-storage',
      partialize: (state) => ({ theme: state.theme, activeTab: state.activeTab }), // Persistimos solo tema y pestaña activa
    }
  )
);
