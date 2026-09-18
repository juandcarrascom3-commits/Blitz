import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, useKanbanStore } from '../store/kanbanStore';
import { FileText, Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface KanbanCardProps {
  task: Task;
}

export const KanbanCard = ({ task }: KanbanCardProps) => {
  const { setActiveTaskId } = useKanbanStore();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'Task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Smart Progress Calculation
  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const progressPercent = totalSubtasks === 0 ? 0 : Math.round((completedSubtasks / totalSubtasks) * 100);

  const getPriorityGlow = () => {
    switch (task.priority) {
      case 'critical': return 'shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] border-red-500/30 hover:border-red-400/50';
      case 'medium': return 'shadow-[0_0_15px_rgba(234,179,8,0.2)] hover:shadow-[0_0_25px_rgba(234,179,8,0.4)] border-yellow-500/20 hover:border-yellow-400/40';
      case 'low': return 'shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] border-cyan-500/30 hover:border-cyan-400/50';
      default: return 'border-[var(--glass-border)] hover:border-[var(--text-muted)]';
    }
  };

  const getPriorityColor = () => {
     switch (task.priority) {
         case 'critical': return 'text-red-500 bg-red-500/10';
         case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10';
         case 'low': return 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10';
         default: return 'text-[var(--text-muted)] bg-[var(--glass-darker)]';
     }
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[120px] rounded-2xl border-2 border-dashed border-[var(--glow-low)] bg-[var(--glass-panel)] backdrop-blur-xl opacity-50"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => setActiveTaskId(task.id)}
      className={clsx(
        "p-4 rounded-2xl bg-[var(--glass-panel)] backdrop-blur-md border transition-all duration-300 ease-out cursor-grab active:cursor-grabbing hover:-translate-y-1 relative group flex flex-col min-h-[120px]",
        getPriorityGlow()
      )}
    >
       <div className="flex justify-between items-start mb-3">
          <span className={clsx("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md", getPriorityColor())}>
             {task.priority}
          </span>
          {task.hasNotes && (
              <FileText className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors" />
          )}
       </div>

       <h3 className="text-[var(--text-main)] opacity-90 font-medium text-sm mb-4 leading-snug">{task.title}</h3>

       {(totalSubtasks > 0 || task.deadline) && (
           <div className="flex items-center justify-between mt-auto">
              {totalSubtasks > 0 ? (
                  <div className="flex items-center gap-2 w-full max-w-[60%]">
                      <div className="h-1.5 flex-1 bg-[var(--glass-darker)] rounded-full overflow-hidden">
                          <div
                              className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-500"
                              style={{ width: `${progressPercent}%` }}
                          />
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono font-medium">
                          {completedSubtasks}/{totalSubtasks}
                      </span>
                  </div>
              ) : <div />}

              {task.deadline && (
                  <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[10px] uppercase tracking-wider font-semibold">{task.deadline}</span>
                  </div>
              )}
           </div>
       )}
    </div>
  );
};
