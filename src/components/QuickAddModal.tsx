import { useState, useEffect, useRef } from 'react';
import { Command } from 'lucide-react';
import { clsx } from 'clsx';
import { useKanbanStore, Priority } from '../store/kanbanStore';
import { useAppStore } from '../store/store';

export const QuickAddModal = () => {
  const { isQuickAddOpen, setQuickAddOpen } = useAppStore();
  const { addTask } = useKanbanStore();
  const [inputValue, setInputValue] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const inputRef = useRef<HTMLInputElement>(null);

  // Global listener for Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setQuickAddOpen(true);
      }
      if (e.key === 'Escape' && isQuickAddOpen) {
        setQuickAddOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickAddOpen, setQuickAddOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isQuickAddOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setPriority('medium');
    } else {
      setInputValue('');
    }
  }, [isQuickAddOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Shortcuts Alt+1, Alt+2, Alt+3 or Ctrl+1, Ctrl+2, Ctrl+3
    if ((e.altKey || e.ctrlKey || e.metaKey) && e.key === '1') {
      e.preventDefault();
      setPriority('critical');
    } else if ((e.altKey || e.ctrlKey || e.metaKey) && e.key === '2') {
      e.preventDefault();
      setPriority('medium');
    } else if ((e.altKey || e.ctrlKey || e.metaKey) && e.key === '3') {
      e.preventDefault();
      setPriority('low');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val.includes('!1')) {
      setPriority('critical');
      val = val.replace('!1', '');
    } else if (val.includes('!2')) {
      setPriority('medium');
      val = val.replace('!2', '');
    } else if (val.includes('!3')) {
      setPriority('low');
      val = val.replace('!3', '');
    }
    setInputValue(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = inputValue.trim();
    if (!cleanTitle) return;

    addTask(cleanTitle, priority);
    
    setQuickAddOpen(false);
    setInputValue('');
  };

  if (!isQuickAddOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-2xl transition-opacity"
        onClick={() => setQuickAddOpen(false)}
      />
      
      {/* Modal */}
      <form 
        onSubmit={handleSubmit}
        className="relative w-full max-w-2xl mx-4 bg-[var(--bg-primary)]/90 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-[var(--glass-border)] overflow-hidden transform transition-all animate-in fade-in slide-in-from-top-10 duration-200"
      >
        <div className="flex flex-col gap-4 px-6 py-6">
          <div className="flex items-center gap-4">
            <Command className="w-6 h-6 text-[var(--glow-low)] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a new task... (or use !1, !2, !3)"
              className="flex-1 bg-transparent border-none outline-none text-xl text-[var(--text-main)] placeholder-[var(--text-muted)] opacity-80"
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
        
        <div className="px-6 py-4 bg-[var(--glass-panel)] border-t border-[var(--glass-border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {(['critical', 'medium', 'low'] as Priority[]).map((p, index) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={clsx(
                  "text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-all duration-300 border flex items-center justify-center min-w-[80px]",
                  priority === p 
                    ? (p === 'critical' ? 'bg-red-500/10 text-red-500 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                      : p === 'medium' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                      : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.5)]')
                    : "bg-transparent text-[var(--text-muted)] border-transparent hover:border-[var(--glass-border)] hover:text-[var(--text-main)]"
                )}
              >
                <span>{p}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-muted)]">
            <span className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded bg-[var(--glass-darker)] border border-[var(--glass-border)] text-[var(--text-main)]">↵</span> to add</span>
            <span className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded bg-[var(--glass-darker)] border border-[var(--glass-border)] text-[var(--text-main)]">esc</span> to close</span>
          </div>
        </div>
      </form>
    </div>
  );
};
