import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useKanbanStore } from '../store/kanbanStore';

// Abstract nodes representing tasks floating in the background
const AmbientNetwork = () => {
  const { tasks } = useKanbanStore();
  const { viewport } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const particlesCount = Math.max(10, tasks.length * 3);
  
  const { positions, linePositions } = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    const linePos: number[] = [];
    
    for (let i = 0; i < particlesCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * viewport.width * 1.5;
      pos[i * 3 + 1] = (Math.random() - 0.5) * viewport.height * 1.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5 - 2;
    }

    for (let i = 0; i < particlesCount; i++) {
      for (let j = i + 1; j < particlesCount; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        if (dist < 2.5) {
          linePos.push(
            pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2],
            pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]
          );
        }
      }
    }
    
    return { 
      positions: pos, 
      linePositions: new Float32Array(linePos) 
    };
  }, [tasks.length, viewport.width, viewport.height]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
      groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#38bdf8" transparent opacity={0.4} sizeAttenuation />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
           <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#38bdf8" transparent opacity={0.1} />
      </lineSegments>
    </group>
  );
};

// Base for 3D isometric diorama
const DioramaBase = () => {
  const { tasks } = useKanbanStore();
  const { viewport } = useThree();
  const doneTasksCount = tasks.filter(t => t.status === 'done').length;
  
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  if (doneTasksCount === 0) return null;

  return (
    <group position={[viewport.width / 2 - 2, -viewport.height / 2 + 2, -2]} ref={groupRef} rotation={[Math.PI / 6, Math.PI / 4, 0]}>
      {Array.from({ length: Math.min(doneTasksCount, 10) }).map((_, i) => (
        <mesh key={`box-${i}`} position={[0, i * 0.2, 0]}>
          <boxGeometry args={[1, 0.15, 1]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.8} wireframe={i === Math.min(doneTasksCount, 10) - 1} />
        </mesh>
      ))}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
    </group>
  );
};

// Main VectorCanvas component
export const VectorCanvas = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas orthographic camera={{ position: [0, 0, 5], zoom: 100 }}>
        <AmbientNetwork />
        <DioramaBase />
      </Canvas>
    </div>
  );
};
