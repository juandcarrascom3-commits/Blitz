import { create } from 'zustand';

export type Priority = 'critical' | 'medium' | 'low';
export type Status = 'todo' | 'in-progress' | 'review' | 'done';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  deadline?: string;
  subtasks: Subtask[];
  hasNotes: boolean;
  notes?: string;
}

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

interface KanbanState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  activeTaskId: string | null;
  isCreatingTask: boolean;
  searchQuery: string;

  // Acciones asíncronas hacia FastAPI con Actualizaciones Optimistas
  fetchTasks: () => Promise<void>;
  addTask: (title: string, priority: Priority) => Promise<void>;
  addTaskFull: (task: Task) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  moveTask: (id: string, newStatus: Status) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Manejo de estado local
  setTasks: (tasks: Task[]) => void;
  setActiveTaskId: (id: string | null) => void;
  setIsCreatingTask: (isCreating: boolean) => void;
  setSearchQuery: (query: string) => void;
}

const initialTasks: Task[] = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    title: 'Diseñar arquitectura de red isométrica',
    status: 'todo',
    priority: 'critical',
    deadline: '24 Oct',
    subtasks: [
      { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', title: 'Definir nodos principales', completed: true },
      { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', title: 'Crear shaders de pulso', completed: false }
    ],
    hasNotes: true,
    notes: 'Documentación inicial del terreno low-poly.'
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    title: 'Implementar caché local con Zustand persist',
    status: 'in-progress',
    priority: 'medium',
    subtasks: [
      { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', title: 'Configurar middleware', completed: true },
      { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', title: 'Filtrar tabs en UI', completed: true },
      { id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', title: 'Hydration wrapper', completed: false }
    ],
    hasNotes: false,
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88',
    title: 'Refinar paleta Cyber-Glass extrema',
    status: 'review',
    priority: 'low',
    deadline: '26 Oct',
    subtasks: [],
    hasNotes: true,
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99',
    title: 'Configurar variables de entorno y DND',
    status: 'done',
    priority: 'critical',
    subtasks: [
      { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380aaa', title: 'Instalar @dnd-kit/core', completed: true },
      { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380abb', title: 'Configurar context', completed: true }
    ],
    hasNotes: false,
  }
];

export const useKanbanStore = create<KanbanState>((set, get) => ({
  tasks: initialTasks,
  isLoading: false,
  error: null,
  activeTaskId: null,
  isCreatingTask: false,
  searchQuery: '',

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        set({ tasks: data, isLoading: false, error: null });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.warn('Backend fetchTasks failed, maintaining current state:', err);
      set({ 
        isLoading: false, 
        error: err instanceof Error ? err.message : 'Error al conectar con la API' 
      });
    }
  },

  addTask: async (title, priority) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      status: 'todo',
      priority,
      subtasks: [],
      hasNotes: false,
      notes: '',
    };

    // Actualización Optimista inmediata
    const previousTasks = get().tasks;
    set({ tasks: [newTask, ...previousTasks] });

    try {
      const res = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (!res.ok) {
        throw new Error(`Failed to add task: ${res.status}`);
      }

      const created = await res.json();
      if (created && typeof created === 'object') {
        set((state) => ({
          tasks: state.tasks.map(t => t.id === newTask.id ? { ...newTask, ...created } : t)
        }));
      }
    } catch (err) {
      console.error('Error in addTask, rolling back optimistically:', err);
      // Rollback en caso de error
      set({ tasks: previousTasks });
    }
  },

  addTaskFull: async (task) => {
    // Actualización Optimista inmediata
    const previousTasks = get().tasks;
    set({ tasks: [task, ...previousTasks] });

    try {
      const res = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(task),
      });

      if (!res.ok) {
        throw new Error(`Failed to add task: ${res.status}`);
      }

      const created = await res.json();
      if (created && typeof created === 'object') {
        set((state) => ({
          tasks: state.tasks.map(t => t.id === task.id ? { ...task, ...created } : t)
        }));
      }
    } catch (err) {
      console.error('Error in addTaskFull, rolling back optimistically:', err);
      set({ tasks: previousTasks });
    }
  },

  updateTask: async (id, updates) => {
    // Actualización Optimista inmediata
    const previousTasks = get().tasks;
    set((state) => ({
      tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    }));

    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        throw new Error(`Failed to update task ${id}: ${res.status}`);
      }

      const updated = await res.json();
      if (updated && typeof updated === 'object') {
        set((state) => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, ...updated } : t)
        }));
      }
    } catch (err) {
      console.error(`Error in updateTask for ${id}, rolling back optimistically:`, err);
      set({ tasks: previousTasks });
    }
  },

  moveTask: async (id, newStatus) => {
    // Actualización Optimista inmediata
    const previousTasks = get().tasks;
    set((state) => ({
      tasks: state.tasks.map(t => t.id === id ? { ...t, status: newStatus } : t)
    }));

    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error(`Failed to move task ${id}: ${res.status}`);
      }
    } catch (err) {
      console.error(`Error in moveTask for ${id}, rolling back optimistically:`, err);
      set({ tasks: previousTasks });
    }
  },

  deleteTask: async (id) => {
    // Actualización Optimista inmediata
    const previousTasks = get().tasks;
    const previousActiveTaskId = get().activeTaskId;

    set((state) => ({
      tasks: state.tasks.filter(t => t.id !== id),
      activeTaskId: state.activeTaskId === id ? null : state.activeTaskId,
    }));

    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!res.ok && res.status !== 204) {
        throw new Error(`Failed to delete task ${id}: ${res.status}`);
      }
    } catch (err) {
      console.error(`Error in deleteTask for ${id}, rolling back optimistically:`, err);
      set({ tasks: previousTasks, activeTaskId: previousActiveTaskId });
    }
  },

  setTasks: (tasks) => set({ tasks }),
  setActiveTaskId: (id) => set({ activeTaskId: id }),
  setIsCreatingTask: (isCreating) => set({ isCreatingTask: isCreating }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
