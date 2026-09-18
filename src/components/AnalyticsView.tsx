import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useKanbanStore, Priority } from '../store/kanbanStore';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts';

const LowPolyNode = ({ position, priority }: { position: [number, number, number], priority: Priority }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Animation logic
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const color = useMemo(() => {
    switch (priority) {
      case 'critical': return '#ef4444'; // red-500
      case 'medium': return '#eab308'; // yellow-500
      case 'low': return '#06b6d4'; // cyan-500
      default: return '#ffffff';
    }
  }, [priority]);

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <octahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color}
        emissiveIntensity={0.5}
        wireframe={false}
        roughness={0.2}
        metalness={0.8}
      />
      {/* Glow edge */}
      <mesh scale={[1.05, 1.05, 1.05]}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.3} />
      </mesh>
    </mesh>
  );
};

const IsometricGrid = () => {
  const { tasks } = useKanbanStore();
  const completedTasks = tasks.filter(t => t.status === 'done');
  const groupRef = useRef<THREE.Group>(null);

  // Slow rotation for the entire grid
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      {/* Base Grid plane */}
      <gridHelper args={[20, 20, '#ffffff', '#ffffff']} material-opacity={0.1} material-transparent />
      
      {completedTasks.map((task, i) => {
        // Grid placement logic: spiral or row-col
        const rowLength = 5;
        const row = Math.floor(i / rowLength);
        const col = i % rowLength;
        const spacing = 1.5;
        
        // Center the grid
        const x = (col - rowLength / 2) * spacing + (spacing / 2);
        const z = (row - Math.ceil(completedTasks.length / rowLength) / 2) * spacing;
        
        return (
          <LowPolyNode 
            key={task.id} 
            position={[x, 0.5, z]} 
            priority={task.priority} 
          />
        );
      })}
    </group>
  );
};

export const AnalyticsView = () => {
  const { tasks } = useKanbanStore();

  const columnData = [
    { name: 'To Do', count: tasks.filter(t => t.status === 'todo').length },
    { name: 'In Progress', count: tasks.filter(t => t.status === 'in-progress').length },
    { name: 'Review', count: tasks.filter(t => t.status === 'review').length },
    { name: 'Done', count: tasks.filter(t => t.status === 'done').length },
  ];

  // Mock trend data
  const trendData = [
    { day: 'Mon', completed: 2 },
    { day: 'Tue', completed: 4 },
    { day: 'Wed', completed: 3 },
    { day: 'Thu', completed: 6 },
    { day: 'Fri', completed: 5 },
    { day: 'Sat', completed: 8 },
    { day: 'Sun', completed: tasks.filter(t => t.status === 'done').length },
  ];

  return (
    <div className="relative w-full h-full flex flex-col p-6 md:p-8 overflow-hidden z-10">
      <header className="mb-8 shrink-0 relative z-20 pointer-events-none">
        <h1 className="text-3xl font-light tracking-wide text-[var(--text-main)]">Analítica & 3D</h1>
        <p className="text-[var(--text-muted)] tracking-wide">Representación isométrica de la carga de trabajo y progreso.</p>
      </header>

      {/* 3D Canvas Background for this specific view */}
      <div className="absolute inset-0 z-0">
        <Canvas orthographic camera={{ position: [10, 10, 10], zoom: 40 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 20, 5]} intensity={1.5} color="#ffffff" castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
          <IsometricGrid />
        </Canvas>
      </div>

      {/* Glassmorphism Overlay UI for Charts */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-6 items-end justify-end pointer-events-none pb-4">
        
        {/* Chart 1: Tasks by Column */}
        <div className="glass-panel-extreme p-5 rounded-2xl border border-[var(--glass-border)] w-full lg:w-[400px] h-[250px] pointer-events-auto flex flex-col">
          <h3 className="text-sm font-semibold text-[var(--text-main)] opacity-90 uppercase tracking-wider mb-4">Distribución de Tareas</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={columnData}>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'var(--glass-darker)' }} 
                  contentStyle={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-main)' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                  labelStyle={{ color: 'var(--text-main)' }}
                />
                <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Trend */}
        <div className="glass-panel-extreme p-5 rounded-2xl border border-[var(--glass-border)] w-full lg:w-[500px] h-[250px] pointer-events-auto flex flex-col">
          <h3 className="text-sm font-semibold text-[var(--text-main)] opacity-90 uppercase tracking-wider mb-4">Tendencia de Productividad</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-main)' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                  labelStyle={{ color: 'var(--text-main)' }}
                />
                <Line type="monotone" dataKey="completed" stroke="#ec4899" strokeWidth={3} dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
