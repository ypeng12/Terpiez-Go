import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Terpiez } from '../../types/terpiez';

interface ThreeDMapViewProps {
  playerLat: number;
  playerLng: number;
  terpiezList: Terpiez[];
  onSelectTerpiez: (t: Terpiez) => void;
}

export const ThreeDMapView: React.FC<ThreeDMapViewProps> = ({
  playerLat,
  playerLng,
  terpiezList,
  onSelectTerpiez,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = 550;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);
    scene.fog = new THREE.FogExp2(0x090d16, 0.015);

    // 2. Perspective Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 25, 35);
    camera.lookAt(0, 0, 0);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x6366f1, 1.2);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    // 5. 3D Spatial Grid Terrain (H3 Hexagonal Aesthetic Ground)
    const gridHelper = new THREE.GridHelper(60, 30, 0x6366f1, 0x1e293b);
    gridHelper.position.y = -0.1;
    scene.add(gridHelper);

    // Ground Plane with Hex Tile Textures
    const groundGeo = new THREE.PlaneGeometry(80, 80, 20, 20);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2,
      wireframe: false,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // 6. Player 3D Avatar (Beacon Beacon Disc + Sphere)
    const playerGroup = new THREE.Group();
    const playerCoreGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const playerCoreMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
    });
    const playerCore = new THREE.Mesh(playerCoreGeo, playerCoreMat);
    playerGroup.add(playerCore);

    const auraRingGeo = new THREE.RingGeometry(2, 2.5, 32);
    const auraRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const auraRing = new THREE.Mesh(auraRingGeo, auraRingMat);
    auraRing.rotation.x = Math.PI / 2;
    auraRing.position.y = -1.1;
    playerGroup.add(auraRing);

    playerGroup.position.set(0, 1.2, 0);
    scene.add(playerGroup);

    // 7. Render 3D Floating Terpiez Monsters on Grid
    const monsterMeshes: { mesh: THREE.Group; terpiez: Terpiez }[] = [];

    terpiezList.forEach((t) => {
      // Relative offset from player position
      const relX = (t.location.longitude - playerLng) * 2000;
      const relZ = (playerLat - t.location.latitude) * 2000;

      // Limit Z/X bounds to visible 3D map radius
      if (Math.abs(relX) < 35 && Math.abs(relZ) < 35) {
        const monsterGroup = new THREE.Group();

        const typeColor = t.type === 'Fire' ? 0xf97316 : t.type === 'Water' ? 0x38bdf8 : 0xa855f7;
        const mGeo = new THREE.IcosahedronGeometry(1.0, 0);
        const mMat = new THREE.MeshStandardMaterial({
          color: typeColor,
          emissive: typeColor,
          emissiveIntensity: 0.4,
          flatShading: true,
        });
        const mMesh = new THREE.Mesh(mGeo, mMat);
        monsterGroup.add(mMesh);

        // Ring base
        const rGeo = new THREE.RingGeometry(1.2, 1.5, 16);
        const rMat = new THREE.MeshBasicMaterial({
          color: typeColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6,
        });
        const rMesh = new THREE.Mesh(rGeo, rMat);
        rMesh.rotation.x = Math.PI / 2;
        rMesh.position.y = -0.9;
        monsterGroup.add(rMesh);

        monsterGroup.position.set(relX, 1.2, relZ);
        scene.add(monsterGroup);

        monsterMeshes.push({ mesh: monsterGroup, terpiez: t });
      }
    });

    // 8. Raycaster for 3D Click Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        let hitObj: THREE.Object3D | null = intersects[0].object;
        while (hitObj && hitObj.parent && hitObj.parent !== scene) {
          hitObj = hitObj.parent;
        }
        if (hitObj) {
          const match = monsterMeshes.find((m) => m.mesh === hitObj);
          if (match) {
            onSelectTerpiez(match.terpiez);
          }
        }
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // 9. Camera & Rotation Controls
    let isDragging = false;
    let prevMouseX = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;

      scene.rotation.y += deltaX * 0.005;
      prevMouseX = e.clientX;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 10. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Pulse player aura
      auraRing.scale.setScalar(1 + Math.sin(elapsed * 3) * 0.1);

      // Rotate monsters
      monsterMeshes.forEach((item, idx) => {
        item.mesh.rotation.y += 0.015;
        item.mesh.position.y = 1.2 + Math.sin(elapsed * 2 + idx) * 0.25;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [playerLat, playerLng, terpiezList, onSelectTerpiez]);

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
      <div ref={mountRef} style={{ width: '100%', height: '550px', cursor: 'grab' }} />
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border-medium)',
          padding: '8px 16px',
          borderRadius: 'var(--radius-lg)',
          fontSize: '12px',
          color: 'var(--text-primary)',
          pointerEvents: 'none',
        }}
      >
        🎮 3D WebGL Perspective Grid Mode | Click 3D monsters to view details
      </div>
    </div>
  );
};
