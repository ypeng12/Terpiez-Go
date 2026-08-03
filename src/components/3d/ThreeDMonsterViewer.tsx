import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Terpiez } from '../../types/terpiez';

interface ThreeDMonsterViewerProps {
  terpiez: Terpiez;
  width?: number | string;
  height?: number | string;
}

// Type color mapping to Three.js hex colors
const TYPE_COLOR_MAP: Record<string, { primary: number; glow: number }> = {
  Water: { primary: 0x38bdf8, glow: 0x0284c7 },
  Fire: { primary: 0xf97316, glow: 0xd97706 },
  Electric: { primary: 0xeab308, glow: 0xca8a04 },
  Grass: { primary: 0x22c55e, glow: 0x15803d },
  Psychic: { primary: 0xec4899, glow: 0xbe185d },
  Dark: { primary: 0x64748b, glow: 0x1e293b },
  Dragon: { primary: 0x38bdf8, glow: 0x4338ca },
  Cyber: { primary: 0xa855f7, glow: 0x6b21a8 },
};

export const ThreeDMonsterViewer: React.FC<ThreeDMonsterViewerProps> = ({
  terpiez,
  width = '100%',
  height = 320,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const clientWidth = container.clientWidth || 400;
    const clientHeight = typeof height === 'number' ? height : 320;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f172a, 0.02);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, clientWidth / clientHeight, 0.1, 1000);
    camera.position.set(0, 2.5, 6.5);
    camera.lookAt(0, 0.5, 0);

    // 3. WebGL Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(clientWidth, clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const typeColors = TYPE_COLOR_MAP[terpiez.type] || { primary: 0x6366f1, glow: 0x4f46e5 };

    const pointLight = new THREE.PointLight(typeColors.primary, 3, 20);
    pointLight.position.set(2, 4, 3);
    scene.add(pointLight);

    const fillLight = new THREE.PointLight(typeColors.glow, 1.5, 15);
    fillLight.position.set(-3, -1, -2);
    scene.add(fillLight);

    // 5. Hologram Pedestal Base
    const pedestalGeo = new THREE.CylinderGeometry(2.2, 2.5, 0.3, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.2;
    scene.add(pedestal);

    // Holographic Glow Ring
    const ringGeo = new THREE.RingGeometry(1.5, 1.9, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: typeColors.primary,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.04;
    scene.add(ring);

    // 6. Low-Poly 3D Creature Mesh Construction
    const creatureGroup = new THREE.Group();

    // Core body poly geometry depending on type
    let bodyGeo: THREE.BufferGeometry;
    if (terpiez.type === 'Cyber' || terpiez.type === 'Dragon') {
      bodyGeo = new THREE.IcosahedronGeometry(1.2, 0); // sharp low poly
    } else if (terpiez.type === 'Fire' || terpiez.type === 'Electric') {
      bodyGeo = new THREE.OctahedronGeometry(1.3, 0);
    } else {
      bodyGeo = new THREE.DodecahedronGeometry(1.2, 1);
    }

    const bodyMat = new THREE.MeshStandardMaterial({
      color: typeColors.primary,
      metalness: 0.4,
      roughness: 0.2,
      wireframe: false,
      flatShading: true,
    });

    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    creatureGroup.add(bodyMesh);

    // Outer Energy Armor Shell
    const armorGeo = new THREE.IcosahedronGeometry(1.45, 1);
    const armorMat = new THREE.MeshBasicMaterial({
      color: typeColors.glow,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const armorMesh = new THREE.Mesh(armorGeo, armorMat);
    creatureGroup.add(armorMesh);

    // Floating Orbiting Satellites / Horns
    for (let i = 0; i < 3; i++) {
      const satGeo = new THREE.TetrahedronGeometry(0.3, 0);
      const satMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: typeColors.primary,
        emissiveIntensity: 0.5,
        flatShading: true,
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      satMesh.position.set(
        Math.cos((i * Math.PI * 2) / 3) * 1.8,
        0,
        Math.sin((i * Math.PI * 2) / 3) * 1.8
      );
      creatureGroup.add(satMesh);
    }

    creatureGroup.position.y = 0.3;
    scene.add(creatureGroup);

    // 7. Floating Energy Particle System
    const particleCount = 40;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 5;
      particlePositions[i + 1] = Math.random() * 4 - 1;
      particlePositions[i + 2] = (Math.random() - 0.5) * 5;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: typeColors.primary,
      size: 0.08,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 8. Mouse Drag Interactive Controls
    let isDragging = false;
    let previousMouseX = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMouseX = e.clientX;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMouseX;
      creatureGroup.rotation.y += deltaX * 0.01;
      previousMouseX = e.clientX;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // 9. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle floating bob & rotation
      creatureGroup.position.y = 0.3 + Math.sin(elapsedTime * 2) * 0.15;
      if (!isDragging) {
        creatureGroup.rotation.y += 0.008;
      }
      armorMesh.rotation.x = elapsedTime * 0.5;
      ring.rotation.z = -elapsedTime * 0.8;

      // Particle floating upward
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] += 0.01;
        if (positions[i] > 3) positions[i] = -1;
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 10. Clean Up on Unmount
    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [terpiez, height]);

  return (
    <div
      ref={containerRef}
      style={{
        width: width,
        height: height,
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        background: 'radial-gradient(circle at center, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.95) 100%)',
        position: 'relative',
        cursor: 'grab',
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.6)',
          pointerEvents: 'none',
          background: 'rgba(0,0,0,0.4)',
          padding: '2px 10px',
          borderRadius: '999px',
        }}
      >
        🖱️ Drag to rotate 3D Terpiez Model
      </div>
    </div>
  );
};
