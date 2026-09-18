import { useRef } from 'react';
import { useAppStore, Theme } from '../store/store';
import { useKanbanStore } from '../store/kanbanStore';
import { Download, Upload, Monitor, Palette, Database } from 'lucide-react';
import { clsx } from 'clsx';

export const Settings = () => {
  const { theme, setTheme } = useAppStore();
  const { tasks, setTasks } = useKanbanStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const themes: { id: Theme; name: string; desc: string }[] = [
    { id: 'cyber-glass', name: 'Cyber-Glass', desc: 'Tonos oscuros con cristal esmerilado y luces neón.' },
    { id: 'industrial', name: 'Industrial', desc: 'Gris oscuro, alto contraste y estética cruda.' },
    { id: 'minimal-light', name: 'Minimal Light', desc: 'Blanco puro, sombras suaves y alta legibilidad.' },
  ];

  const handleExport = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `nexus-backup-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedTasks = JSON.parse(content);
        if (Array.isArray(parsedTasks)) {
          setTasks(parsedTasks);
          alert('Backup restaurado exitosamente.');
        } else {
          alert('El archivo no tiene el formato correcto.');
        }
      } catch (error) {
        alert('Error al parsear el archivo JSON.');
        console.error(error);
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full h-full p-6 md:p-12 relative z-10 overflow-y-auto no-scrollbar">
      <header className="mb-12 shrink-0">
        <h1 className="text-3xl font-light tracking-wide text-[var(--text-main)] mb-2">Settings</h1>
        <p className="text-[var(--text-muted)] tracking-wide">Configuración del entorno y gestión de datos locales.</p>
      </header>

      <div className="max-w-4xl space-y-12 pb-12">
        
        {/* Theme Configuration */}
        <section className="glass-panel-extreme p-8 rounded-3xl border border-[var(--glass-border)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[var(--glass-darker)] rounded-lg">
              <Palette className="w-5 h-5 text-[var(--text-main)]" />
            </div>
            <h2 className="text-xl font-medium text-[var(--text-main)]">Apariencia Visual</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={clsx(
                  "p-5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group",
                  theme === t.id 
                    ? "bg-[var(--glass-panel)] border-[var(--glow-low)] shadow-[0_0_15px_rgba(56,189,248,0.15)]" 
                    : "bg-[var(--glass-darker)] border-[var(--glass-border)] hover:border-[var(--text-muted)] hover:bg-[var(--glass-panel)]"
                )}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[var(--text-main)]">{t.name}</span>
                    {theme === t.id && <span className="w-2 h-2 rounded-full bg-[var(--glow-low)] animate-pulse" />}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">{t.desc}</p>
                </div>
                {/* Decoration */}
                {theme === t.id && (
                   <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--glow-low)] blur-[50px] opacity-20 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Data Persistence */}
        <section className="glass-panel-extreme p-8 rounded-3xl border border-[var(--glass-border)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[var(--glass-darker)] rounded-lg">
              <Database className="w-5 h-5 text-[var(--text-main)]" />
            </div>
            <h2 className="text-xl font-medium text-[var(--text-main)]">Gestión de Datos (Local-First)</h2>
          </div>
          
          <p className="text-sm text-[var(--text-muted)] mb-8 max-w-2xl leading-relaxed">
            Tus datos viven en tu navegador. Puedes exportarlos como un archivo JSON para tener una copia de seguridad o para migrarlos a otro dispositivo. Restaurar un backup sobrescribirá tu estado actual.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-500 dark:text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all font-medium text-sm shadow-[0_0_15px_rgba(59,130,246,0.1)]"
            >
              <Download className="w-4 h-4" />
              Exportar Backup JSON
            </button>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--glass-darker)] border border-[var(--glass-border)] text-[var(--text-main)] hover:bg-[var(--glass-panel)] transition-all font-medium text-sm"
            >
              <Upload className="w-4 h-4" />
              Restaurar Backup
            </button>
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImport}
            />
          </div>
        </section>

        {/* System Info */}
        <section className="p-8 rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-panel)] backdrop-blur-xl">
           <div className="flex items-center gap-4 text-[var(--text-muted)] text-sm">
              <Monitor className="w-5 h-5 opacity-50" />
              <span>Nexus v1.0.0</span>
              <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]/40" />
              <span>Zustand Persist Engine</span>
              <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]/40" />
              <span>Local Storage Active</span>
           </div>
        </section>
      </div>
    </div>
  );
};
