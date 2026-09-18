import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Float, Sparkles } from '@react-three/drei';
import { useKanbanStore, Priority } from '../store/kanbanStore';

// 1. Componente Generativo: Nodos de Tareas Completadas
const SpawnedStructure = ({ position, priority, index }: { position: [number, number, number], priority: Priority, index: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetScale = useRef(new THREE.Vector3(1, 1, 1));
  
  // Configuración de forma y neón según la prioridad de la tarea
  const { color, emissive, geometry } = useMemo(() => {
    switch (priority) {
      case 'critical': 
        return { color: '#ef4444', emissive: '#ef4444', geometry: <octahedronGeometry args={[0.3, 0]} /> };
      case 'medium': 
        return { color: '#eab308', emissive: '#eab308', geometry: <boxGeometry args={[0.4, 0.4, 0.4]} /> };
      case 'low': 
      default:
        return { color: '#06b6d4', emissive: '#06b6d4', geometry: <coneGeometry args={[0.25, 0.7, 4]} /> };
    }
  }, [priority]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Efecto de levitación individual desfasado
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + index) * 0.05;
      meshRef.current.rotation.y += 0.01;
      // Animación de aparición (Pop-in)
      meshRef.current.scale.lerp(targetScale.current, delta * 5);
    }
  });

  return (
    <mesh ref={meshRef} position={[position[0], position[1] - 0.5, position[2]]} scale={[0,0,0]} castShadow>
      {geometry}
      <meshStandardMaterial 
        color={color} 
        emissive={emissive}
        emissiveIntensity={1.5}
        roughness={0.2}
        metalness={0.8}
      />
      {/* Malla holográfica superpuesta (Wireframe) */}
      <mesh scale={1.15}>
        {geometry}
        <meshBasicMaterial color={color} wireframe transparent opacity={0.3} />
      </mesh>
    </mesh>
  );
};

// 2. Diorama Principal: Isla Flotante y Cuadrícula
const Diorama = () => {
  const { tasks } = useKanbanStore();
  const completedTasks = tasks.filter(t => t.status === 'done');
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Rotación muy sutil de toda la estructura
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.1 + (Math.PI / 4);
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} position={[0, -2, -2]}>
        
        {/* Base del Terreno (Cilindro Hexagonal) */}
        <mesh position={[0, -0.2, 0]} receiveShadow>
          <cylinderGeometry args={[4, 3.5, 0.4, 6]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Grilla Holográfica */}
        <gridHelper args={[7, 7, '#00f0ff', '#ffffff']} position={[0, 0.01, 0]} material-opacity={0.15} material-transparent />
        
        {/* Instanciación reactiva de tareas completadas */}
        {completedTasks.map((task, i) => {
          // Algoritmo de distribución en espiral de Fermat para evitar colisiones
          const angle = i * 2.4;
          const radius = 0.5 + Math.sqrt(i) * 0.5;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          
          return (
            <SpawnedStructure 
              key={task.id} 
              index={i}
              position={[x, 0.4, z]} 
              priority={task.priority} 
            />
          );
        })}

        {/* Partículas ambientales de neón */}
        <Sparkles count={60} scale={8} size={2} speed={0.4} opacity={0.15} color="#00f0ff" />
      </group>
    </Float>
  );
};

// 3. Lienzo y Configuración de Escena
export const VectorCanvas = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas orthographic camera={{ position: [10, 10, 10], zoom: 65 }}>
        <ambientLight intensity={0.5} />
        {/* Iluminación dramática Cyber-Glass */}
        <directionalLight position={[10, 20, 10]} intensity={2.5} color="#ffffff" castShadow />
        <pointLight position={[-5, 5, -5]} intensity={1.5} color="#00f0ff" />
        <pointLight position={[5, -5, 5]} intensity={1.5} color="#ef4444" />
        
        <Diorama />
      </Canvas>
    </div>
  );
};