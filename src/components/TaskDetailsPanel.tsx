import { useEffect, useState } from 'react';
import { X, Check, Plus, Trash2, Eye, Edit3, Calendar, Columns } from 'lucide-react';
import { clsx } from 'clsx';
import Markdown from 'react-markdown';
import { useKanbanStore, Priority, Status, Subtask, Task } from '../store/kanbanStore';

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' }
];

export const TaskDetailsPanel = () => {
  const { tasks, activeTaskId, setActiveTaskId, updateTask, deleteTask, isCreatingTask, setIsCreatingTask, addTaskFull } = useKanbanStore();
  
  const existingTask = tasks.find(t => t.id === activeTaskId);
  const isCreateMode = isCreatingTask && !existingTask;
  
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<Status>('todo');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  
  const [newSubtask, setNewSubtask] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setPriority(existingTask.priority);
      setStatus(existingTask.status);
      setDeadline(existingTask.deadline || '');
      setNotes(existingTask.notes || '');
      setSubtasks(existingTask.subtasks || []);
    } else if (isCreateMode) {
      setTitle('');
      setPriority('medium');
      setStatus('todo');
      setDeadline('');
      setNotes('');
      setSubtasks([]);
      setIsPreviewMode(false);
    }
  }, [existingTask, isCreateMode]);

  if (!existingTask && !isCreateMode) {
    return null;
  }

  const handleClose = () => {
    setActiveTaskId(null);
    setIsCreatingTask(false);
  };

  const updateField = <K extends keyof Task>(field: K, value: Task[K]) => {
    if (field === 'title') setTitle(value as string);
    if (field === 'priority') setPriority(value as Priority);
    if (field === 'status') setStatus(value as Status);
    if (field === 'deadline') setDeadline(value as string);
    if (field === 'subtasks') setSubtasks(value as Subtask[]);
    
    if (existingTask) {
      updateTask(existingTask.id, { [field]: value });
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleNotesBlur = () => {
    if (existingTask) {
      updateTask(existingTask.id, { notes, hasNotes: notes.trim().length > 0 });
    }
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    const updatedSubtasks = [...subtasks, { id: crypto.randomUUID(), title: newSubtask.trim(), completed: false }];
    updateField('subtasks', updatedSubtasks);
    setNewSubtask('');
  };

  const toggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
    updateField('subtasks', updatedSubtasks);
  };

  const removeSubtask = (subtaskId: string) => {
    const updatedSubtasks = subtasks.filter(s => s.id !== subtaskId);
    updateField('subtasks', updatedSubtasks);
  };

  const handleCreate = () => {
    if (!title.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      status,
      priority,
      deadline: deadline || undefined,
      subtasks,
      hasNotes: notes.trim().length > 0,
      notes: notes.trim()
    };
    addTaskFull(newTask);
    handleClose();
  };

  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const progressPercent = totalSubtasks === 0 ? 0 : Math.round((completedSubtasks / totalSubtasks) * 100);

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-2xl z-[50] flex items-center justify-center p-4 sm:p-6 md:p-12 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-full bg-[var(--bg-primary)]/90 backdrop-blur-2xl border border-[var(--glass-border)] rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <header className="flex flex-col sm:flex-row sm:items-start justify-between p-6 border-b border-[var(--glass-border)] shrink-0 gap-4">
          <div className="flex-1">
             <input
                type="text"
                placeholder="Task Title..."
                value={title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full bg-transparent border-none outline-none text-2xl font-semibold text-[var(--text-main)] mb-4 placeholder-[var(--text-muted)]"
             />
             <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 bg-[var(--glass-darker)] p-1 rounded-xl border border-[var(--glass-border)] h-[38px]">
                  {(['critical', 'medium', 'low'] as Priority[]).map(p => (
                    <button
                      key={p}
                      onClick={() => updateField('priority', p)}
                      className={clsx(
                        "text-[10px] font-bold uppercase tracking-wider px-2.5 h-full rounded-lg transition-all duration-300",
                        priority === p 
                          ? (p === 'critical' ? 'bg-red-500/20 text-red-500 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                            : p === 'medium' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                            : 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.4)]')
                          : "bg-transparent text-[var(--text-muted)] border border-transparent hover:text-[var(--text-main)]"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div className="relative flex items-center bg-[var(--glass-darker)] backdrop-blur-md rounded-xl border border-[var(--glass-border)] focus-within:ring-1 focus-within:ring-[var(--glow-low)] focus-within:border-[var(--glow-low)] transition-all h-[38px] px-3">
                  <Columns className="w-3.5 h-3.5 text-[var(--text-muted)] mr-2 shrink-0" />
                  <select 
                    value={status}
                    onChange={(e) => updateField('status', e.target.value as Status)}
                    className="appearance-none bg-transparent text-xs font-medium text-[var(--text-main)] outline-none cursor-pointer min-w-[90px] pr-4"
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-[var(--bg-primary)] text-[var(--text-main)]">{opt.label}</option>
                    ))}
                  </select>
                  {/* Custom select arrow */}
                  <div className="pointer-events-none absolute right-3 flex items-center text-[var(--text-muted)]">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>

                <div className="flex items-center bg-[var(--glass-darker)] backdrop-blur-md rounded-xl border border-[var(--glass-border)] focus-within:ring-1 focus-within:ring-[var(--glow-low)] focus-within:border-[var(--glow-low)] transition-all h-[38px] px-3">
                  <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)] mr-2 shrink-0" />
                  <input 
                    type="date"
                    value={deadline}
                    onChange={(e) => updateField('deadline', e.target.value)}
                    className="bg-transparent text-xs font-medium text-[var(--text-main)] outline-none cursor-pointer w-[110px]"
                  />
                </div>
             </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
            {isCreateMode ? (
              <button 
                onClick={handleCreate}
                disabled={!title.trim()}
                className="px-4 py-2 bg-[var(--glow-low)] text-black text-sm font-semibold rounded-lg hover:shadow-[0_0_20px_var(--glow-low)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Task
              </button>
            ) : existingTask ? (
              <button
                onClick={() => {
                  deleteTask(existingTask.id);
                  handleClose();
                }}
                title="Delete Task"
                className="text-[var(--text-muted)] hover:text-red-500 transition-colors bg-[var(--glass-panel)] border border-[var(--glass-border)] p-2 rounded-full hover:border-red-500/30"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            ) : null}
            <button 
              onClick={handleClose}
              className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors bg-[var(--glass-panel)] border border-[var(--glass-border)] p-2 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col gap-8">
          
          <section>
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold tracking-wide text-[var(--text-main)] opacity-80 uppercase">Subtasks</h3>
                <span className="text-xs font-mono text-[var(--text-muted)]">{progressPercent}%</span>
             </div>
             
             <div className="h-1.5 w-full bg-[var(--glass-darker)] rounded-full overflow-hidden mb-4 border border-[var(--glass-border)]">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
             </div>

             <div className="flex flex-col gap-2">
                {subtasks.map(subtask => (
                  <div key={subtask.id} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--glass-panel)] border border-transparent hover:border-[var(--glass-border)] transition-all duration-300">
                    <button
                      onClick={() => toggleSubtask(subtask.id)}
                      className={clsx(
                        "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors duration-300",
                        subtask.completed ? "bg-[var(--glow-low)] border-transparent" : "border-[var(--glass-border)] hover:border-[var(--text-muted)]"
                      )}
                    >
                      {subtask.completed && <Check className="w-3.5 h-3.5 text-black" />}
                    </button>
                    <span className={clsx(
                      "flex-1 text-sm transition-all duration-300",
                      subtask.completed ? "text-[var(--text-muted)] line-through" : "text-[var(--text-main)] opacity-90"
                    )}>
                      {subtask.title}
                    </span>
                    <button 
                      onClick={() => removeSubtask(subtask.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-red-500 transition-all duration-300 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <form onSubmit={handleAddSubtask} className="mt-2 relative group">
                  <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--glow-low)] transition-colors" />
                  <input
                    type="text"
                    placeholder="Add a subtask..."
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    className="w-full bg-[var(--glass-darker)] border border-[var(--glass-border)] rounded-lg py-2.5 pl-10 pr-4 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--glow-low)] transition-colors duration-300"
                  />
                </form>
             </div>
          </section>

          <section className="flex-1 flex flex-col">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold tracking-wide text-[var(--text-main)] opacity-80 uppercase">Notes</h3>
                <div className="flex items-center bg-[var(--glass-darker)] p-1 rounded-lg border border-[var(--glass-border)]">
                  <button 
                    onClick={() => setIsPreviewMode(false)}
                    className={clsx("p-1.5 rounded-md transition-colors duration-300", !isPreviewMode ? "bg-[var(--glass-panel)] text-[var(--text-main)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-main)]")}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => setIsPreviewMode(true)}
                    className={clsx("p-1.5 rounded-md transition-colors duration-300", isPreviewMode ? "bg-[var(--glass-panel)] text-[var(--text-main)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-main)]")}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
             </div>
             
             {!isPreviewMode ? (
               <textarea
                 value={notes}
                 onChange={handleNotesChange}
                 onBlur={handleNotesBlur}
                 placeholder="Write your notes here... Markdown is supported if previewed."
                 className="flex-1 min-h-[200px] bg-[var(--glass-darker)] border border-[var(--glass-border)] rounded-xl p-4 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--glow-low)] transition-colors duration-300 resize-none no-scrollbar font-mono leading-relaxed"
               />
             ) : (
               <div className="flex-1 min-h-[200px] bg-[var(--glass-darker)] border border-[var(--glass-border)] rounded-xl p-4 text-sm text-[var(--text-main)] overflow-y-auto no-scrollbar prose max-w-none">
                  {notes.trim() ? (
                    <Markdown>{notes}</Markdown>
                  ) : (
                    <p className="text-[var(--text-muted)] italic">No notes written yet.</p>
                  )}
               </div>
             )}
          </section>

        </div>
      </div>
    </div>
  );
};
