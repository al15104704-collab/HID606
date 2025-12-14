
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';

const Satellite = () => {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (group.current) {
      const t = state.clock.getElapsedTime();
      // Orbit logic
      group.current.position.x = Math.sin(t * 0.5) * 3.5;
      group.current.position.z = Math.cos(t * 0.5) * 3.5;
      group.current.position.y = Math.sin(t * 0.2) * 1.5;
      group.current.rotation.y = -t * 0.5;
    }
  });

  return (
    <group ref={group}>
      {/* Satellite Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Solar Panels */}
      <mesh position={[0.6, 0, 0]}>
        <boxGeometry args={[0.8, 0.02, 0.3]} />
        <meshStandardMaterial color="#1E3A8A" metalness={0.5} roughness={0.1} />
      </mesh>
      <mesh position={[-0.6, 0, 0]}>
        <boxGeometry args={[0.8, 0.02, 0.3]} />
        <meshStandardMaterial color="#1E3A8A" metalness={0.5} roughness={0.1} />
      </mesh>
    </group>
  );
};

const Earth = () => {
  return (
    <Sphere args={[2, 64, 64]} position={[0, 0, 0]}>
      <meshStandardMaterial
        color="#4B9CD3"
        roughness={0.7}
        metalness={0.1}
        wireframe={true}
        transparent
        opacity={0.3}
      />
    </Sphere>
  );
};

const InnerEarth = () => {
    return (
        <Sphere args={[1.95, 64, 64]} position={[0,0,0]}>
            <meshStandardMaterial color="#0F4C81" />
        </Sphere>
    )
}

export const HeroScene: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
      <Canvas camera={{ position: [0, 2, 6], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4caf50" />
        
        <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
          <Earth />
          <InnerEarth />
          <Satellite />
        </Float>

        <Environment preset="city" />
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />
      </Canvas>
    </div>
  );
};
