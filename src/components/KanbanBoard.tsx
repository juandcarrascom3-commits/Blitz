import { useState, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Search, X } from 'lucide-react';
import { useKanbanStore, Status, Task } from '../store/kanbanStore';
import { useAppStore } from '../store/store';
import { KanbanCard } from './KanbanCard';

const COLUMNS: { id: Status; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];

const KanbanColumn = ({ id, title, tasks }: { id: Status; title: string; tasks: Task[] }) => {
  const { setNodeRef } = useDroppable({ id });
  
  return (
    <div className="flex flex-col w-[85vw] sm:w-[320px] shrink-0 snap-center">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-[var(--text-main)] opacity-80 font-semibold tracking-wide uppercase text-sm">{title}</h2>
        <span className="bg-[var(--glass-panel)] border border-[var(--glass-border)] text-[var(--text-muted)] text-xs py-0.5 px-2.5 rounded-full font-mono">
          {tasks.length}
        </span>
      </div>
      
      {/* Overflow visible is crucial for glowing shadows not getting clipped */}
      <div ref={setNodeRef} className="flex-1 overflow-visible p-4 -m-4 flex flex-col gap-4 min-h-[200px] no-scrollbar">
        <SortableContext id={id} items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export const KanbanBoard = () => {
  const { tasks, setTasks, moveTask, setIsCreatingTask, searchQuery, setSearchQuery } = useKanbanStore();
  const { setQuickAddOpen } = useAppStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredTasks = tasks.filter(t => {
    if (!searchQuery.trim()) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(lowerQuery) ||
      (t.notes && t.notes.toLowerCase().includes(lowerQuery)) ||
      t.subtasks.some(s => s.title.toLowerCase().includes(lowerQuery))
    );
  });

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;
  const dragStartStatusRef = useRef<{ id: string; status: Status } | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveId(id);
    const dragged = tasks.find(t => t.id === id);
    if (dragged) {
      dragStartStatusRef.current = { id: dragged.id, status: dragged.status };
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Disable drag during search
    if (searchQuery.trim()) return;

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeIndex = tasks.findIndex(t => t.id === activeId);
    const overIndex = tasks.findIndex(t => t.id === overId);

    const activeTask = tasks[activeIndex];
    const overTask = tasks[overIndex];

    if (!activeTask) return;

    const activeStatus = activeTask.status;
    const overStatus = overTask ? overTask.status : (overId as Status);

    if (activeStatus !== overStatus) {
      const newTasks = [...tasks];
      const [movedTask] = newTasks.splice(activeIndex, 1);
      movedTask.status = overStatus;

      if (overTask) {
        const newIndex = newTasks.findIndex(t => t.id === overId);
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;
        const modifier = isBelowOverItem ? 1 : 0;
        newTasks.splice(newIndex >= 0 ? newIndex + modifier : newTasks.length, 0, movedTask);
      } else {
        newTasks.push(movedTask);
      }
      setTasks(newTasks);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    // Disable drag end mutation during search
    if (searchQuery.trim()) {
      setActiveId(null);
      dragStartStatusRef.current = null;
      return;
    }

    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      dragStartStatusRef.current = null;
      return;
    }

    const activeIndex = tasks.findIndex(t => t.id === active.id);
    const overIndex = tasks.findIndex(t => t.id === over.id);

    if (activeIndex !== overIndex) {
      setTasks(arrayMove(tasks, activeIndex, overIndex));
    }

    // Sincronizar optimísticamente con el backend si cambió de columna/estado
    const droppedTask = tasks.find(t => t.id === active.id);
    if (
      droppedTask && 
      dragStartStatusRef.current && 
      dragStartStatusRef.current.id === droppedTask.id &&
      dragStartStatusRef.current.status !== droppedTask.status
    ) {
      moveTask(droppedTask.id, droppedTask.status);
    }
    dragStartStatusRef.current = null;
  };

  return (
    <div className="h-full w-full flex flex-col relative z-10 p-4 md:p-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 shrink-0 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-light tracking-wide text-[var(--text-main)]">Board</h1>
          
          {/* Global Search Bar */}
          <div 
            className={`relative flex items-center transition-all duration-300 ${isSearchFocused || searchQuery ? 'w-64' : 'w-48'} bg-[var(--glass-panel)] border rounded-xl overflow-hidden ${isSearchFocused ? 'border-[var(--glow-low)] shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'border-[var(--glass-border)]'}`}
          >
            <Search className="w-4 h-4 ml-3 text-[var(--text-muted)] shrink-0" />
            <input 
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full bg-transparent border-none outline-none text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] py-2 px-3"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="mr-2 p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {searchQuery && (
             <span className="text-xs text-[var(--text-muted)] font-mono">{filteredTasks.length} results</span>
          )}
        </div>

        <button 
          onClick={() => setIsCreatingTask(true)}
          className="flex items-center gap-2 px-3 py-1.5 md:gap-3 rounded-lg hover:bg-[var(--glass-panel)] transition-all duration-300 group cursor-pointer border border-transparent hover:border-[var(--glass-border)] self-start sm:self-auto"
        >
           <span className="text-[10px] md:text-xs text-[var(--text-muted)] border border-[var(--glass-border)] bg-[var(--glass-panel)] px-2 py-1 rounded-md font-mono group-hover:text-[var(--text-main)] transition-colors">
              ⌘ K
           </span>
           <span className="text-xs md:text-sm text-[var(--text-muted)] font-medium group-hover:text-[var(--text-main)] transition-colors">Nueva Tarea</span>
        </button>
      </header>

      {/* Board Scrollable Area with Mobile Snap */}
      <div className="flex-1 flex gap-4 md:gap-8 overflow-x-auto flex-nowrap snap-x snap-mandatory no-scrollbar items-start pb-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {COLUMNS.map(col => (
             <KanbanColumn
                key={col.id}
                id={col.id}
                title={col.title}
                tasks={filteredTasks.filter(t => t.status === col.id)}
             />
          ))}
          <DragOverlay>
            {activeTask ? <KanbanCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};
