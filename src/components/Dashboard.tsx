import { useKanbanStore } from '../store/kanbanStore';
import { useAppStore } from '../store/store';
import { Target, CheckCircle2, ListTodo, Activity } from 'lucide-react';

export const Dashboard = () => {
  const { tasks } = useKanbanStore();
  const { setActiveTab } = useAppStore();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const pendingTasks = totalTasks - completedTasks;
  const criticalTasks = tasks.filter(t => t.priority === 'critical' && t.status !== 'done').length;

  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="h-full w-full flex flex-col p-6 md:p-12 relative z-10 overflow-y-auto no-scrollbar">
      <header className="mb-8 shrink-0">
        <h1 className="text-3xl md:text-4xl font-light tracking-wide text-[var(--text-main)] mb-2">Dashboard</h1>
        <p className="text-[var(--text-muted)] tracking-wide">Métricas de rendimiento y estado del entorno.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-8">
        {/* Paneles de Métricas (Cuellos de botella) */}
        <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 h-fit">
          {/* Metric 1 */}
          <div 
            onClick={() => setActiveTab('kanban')}
            className="cursor-pointer bg-[var(--glass-panel)] backdrop-blur-xl p-6 rounded-3xl border border-[var(--glass-border)] flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)] font-medium tracking-wide group-hover:text-[var(--text-main)] transition-colors">Total Tareas</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <ListTodo className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <span className="text-4xl font-light text-[var(--text-main)]">{totalTasks}</span>
          </div>

          {/* Metric 2 */}
          <div 
            onClick={() => setActiveTab('kanban')}
            className="cursor-pointer bg-[var(--glass-panel)] backdrop-blur-xl p-6 rounded-3xl border border-[var(--glass-border)] flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)] font-medium tracking-wide group-hover:text-[var(--text-main)] transition-colors">Completadas</span>
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-cyan-500" />
              </div>
            </div>
            <span className="text-4xl font-light text-[var(--text-main)]">{completedTasks}</span>
          </div>

          {/* Metric 3 */}
          <div 
            onClick={() => setActiveTab('kanban')}
            className="cursor-pointer bg-[var(--glass-panel)] backdrop-blur-xl p-6 rounded-3xl border border-[var(--glass-border)] flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(234,179,8,0.15)] group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)] font-medium tracking-wide group-hover:text-[var(--text-main)] transition-colors">Pendientes</span>
              <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                <Target className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
            <span className="text-4xl font-light text-[var(--text-main)]">{pendingTasks}</span>
          </div>

          {/* Metric 4 */}
          <div 
            onClick={() => setActiveTab('kanban')}
            className="cursor-pointer bg-[var(--glass-panel)] backdrop-blur-xl p-6 rounded-3xl border border-[var(--glass-border)] shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_25px_rgba(239,68,68,0.25)] flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)] font-medium tracking-wide group-hover:text-[var(--text-main)] transition-colors">Críticas Activas</span>
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                <Activity className="w-5 h-5 text-red-500 animate-pulse" />
              </div>
            </div>
            <span className="text-4xl font-light text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]">{criticalTasks}</span>
          </div>
        </div>

        {/* Global Progress */}
        <div className="xl:col-span-1 flex flex-col">
          <section className="h-full bg-[var(--glass-panel)] backdrop-blur-xl p-6 md:p-8 rounded-[2rem] border border-[var(--glass-border)] relative group flex flex-col justify-center">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--glow-low)] blur-[100px] opacity-10 rounded-full group-hover:opacity-20 transition-opacity"></div>
             <h2 className="text-xl font-medium text-[var(--text-main)] mb-8 tracking-wide">Progreso Global del Entorno</h2>
             
             <div className="flex flex-col items-center gap-8">
                <div className="relative w-48 h-48 flex shrink-0 items-center justify-center overflow-visible">
                   <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
                      <circle
                         cx="50"
                         cy="50"
                         r="40"
                         fill="transparent"
                         stroke="var(--glass-darker)"
                         strokeWidth="8"
                      />
                      <circle
                         cx="50"
                         cy="50"
                         r="40"
                         fill="transparent"
                         stroke="currentColor"
                         strokeWidth="8"
                         strokeDasharray="251.2"
                         strokeDashoffset={251.2 - (251.2 * progressPercent) / 100}
                         className="text-[var(--glow-low)] drop-shadow-[0_0_10px_currentColor] transition-all duration-1000 ease-out"
                      />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-light text-[var(--text-main)]">{progressPercent}%</span>
                      <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest mt-1">Done</span>
                   </div>
                </div>

                <div className="w-full space-y-6">
                   <div>
                      <div className="flex justify-between text-sm mb-2">
                         <span className="text-[var(--text-main)] opacity-80">Rendimiento Base</span>
                         <span className="text-[var(--glow-low)] font-mono">{progressPercent}%</span>
                      </div>
                      <div className="h-2 w-full bg-[var(--glass-darker)] rounded-full overflow-hidden">
                         <div 
                            className="h-full bg-[var(--glow-low)] rounded-full transition-all duration-1000"
                            style={{ width: `${progressPercent}%` }}
                         />
                      </div>
                   </div>

                   <div className="p-4 bg-[var(--glass-darker)] border border-[var(--glass-border)] rounded-2xl">
                      <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                         El motor isométrico está renderizando {totalTasks} nodos en el entorno.
                         Actualmente tienes {pendingTasks} tareas estructuradas en las colas activas.
                      </p>
                   </div>
                </div>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};
