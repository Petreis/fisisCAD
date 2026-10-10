import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useCAD } from '../context/CADContext';
import { createExtrudedGeometryFromProfile } from '../utils/cadGeometry';
import { globalCollisionDetector } from '../utils/collisionDetector';
import { 
  Play, Pause, RotateCcw, Eye, Layers, 
  Compass, Cpu, Sparkles, ShieldAlert, Crosshair, Box, Move3d 
} from 'lucide-react';

export const ThreeCanvas = () => {
  const mountRef = useRef(null);
  const { 
    viewMode3D, setViewMode3D, 
    cameraPreset, setCameraPreset, 
    project, 
    workingPlane,
    simulationRunning, setSimulationRunning,
    selectedEntity, setSelectedEntity,
    collisionActive, setCollisionActive,
    collisionInfo, setCollisionInfo,
    setAiModalOpen, addLog 
  } = useCAD();

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const mainMeshRef = useRef(null);
  const secondaryMeshRef = useRef(null);
  const cursorGizmoRef = useRef(null);
  const particlesRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const simulationRunningRef = useRef(simulationRunning);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0, z: 0 });
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [collisionMoving, setCollisionMoving] = useState(false);

  // Helper para criar ou recalcular cores de tensão
  const computeStressColors = (geom) => {
    const pos = geom.attributes.position;
    const colors = [];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const normX = (x + 4) / 8;
      const stressFactor = Math.pow(Math.max(0, Math.min(1, normX)), 1.8) * (1 + Math.abs(y) / 1.25);
      
      let color = new THREE.Color();
      if (stressFactor < 0.3) {
        color.setHSL(0.6 - stressFactor * 0.5, 1.0, 0.5);
      } else if (stressFactor < 0.7) {
        color.setHSL(0.35 - (stressFactor - 0.3) * 0.5, 1.0, 0.5);
      } else {
        color.setHSL(0.1 - Math.min(stressFactor - 0.7, 0.7) * 0.15, 1.0, 0.5);
      }
      colors.push(color.r, color.g, color.b);
    }
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  };

  // ─── Setup Inicial do Three.js ──────────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b0f19');
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(14, 9, 14);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer com descarte adequado de recursos
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Iluminação Técnica de Engenharia
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x93ccff, 1.2);
    dirLight1.position.set(20, 30, 20);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x3198dc, 0.6);
    dirLight2.position.set(-20, -10, -20);
    scene.add(dirLight2);

    // 5. Grade de Trabalho & Eixos
    const grid = new THREE.GridHelper(30, 30, 0x0284c7, 0x1e293b);
    grid.position.y = -2;
    scene.add(grid);

    const axesHelper = new THREE.AxesHelper(3.5);
    axesHelper.position.set(-7, -1.9, 7);
    scene.add(axesHelper);

    // 6. Cursor Gizmo (Indicador Visual Preciso de Posição 3D)
    const cursorGeom = new THREE.SphereGeometry(0.12, 16, 16);
    const cursorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });
    const cursorGizmo = new THREE.Mesh(cursorGeom, cursorMat);
    cursorGizmo.visible = false;
    scene.add(cursorGizmo);
    cursorGizmoRef.current = cursorGizmo;

    // 7. Objeto A: Peça CAD Principal
    let mainGeom;
    if (project.sketchProfile && project.sketchProfile.length >= 3) {
      mainGeom = createExtrudedGeometryFromProfile(
        project.sketchProfile, 
        project.geometry?.length || 100, 
        workingPlane
      );
    } else {
      const L = ((project.geometry?.length || 1200) / 1200) * 8;
      const H = ((project.geometry?.height || 150) / 150) * 2.5;
      const W = ((project.geometry?.width || 100) / 100) * 2.5;
      mainGeom = new THREE.BoxGeometry(L, H, W, 32, 16, 16);
    }
    computeStressColors(mainGeom);

    const mainMat = new THREE.MeshStandardMaterial({
      vertexColors: viewMode3D === 'stress',
      color: viewMode3D === 'stress' ? 0xffffff : 0x38bdf8,
      metalness: 0.5,
      roughness: 0.3,
      wireframe: viewMode3D === 'wireframe'
    });

    const mainMesh = new THREE.Mesh(mainGeom, mainMat);
    mainMesh.castShadow = true;
    mainMesh.receiveShadow = true;
    scene.add(mainMesh);
    mainMeshRef.current = mainMesh;

    globalCollisionDetector.registerObject('obj_A', project.name || 'Componente_Principal', mainMesh);

    // 8. Objeto B: Componente de Montagem / Contra-peça para Colisão
    const secGeom = new THREE.BoxGeometry(3, 3, 3);
    const secMat = new THREE.MeshStandardMaterial({
      color: 0x9333ea,
      metalness: 0.4,
      roughness: 0.4
    });
    const secondaryMesh = new THREE.Mesh(secGeom, secMat);
    secondaryMesh.position.set(7, 0, 0);
    scene.add(secondaryMesh);
    secondaryMeshRef.current = secondaryMesh;

    globalCollisionDetector.registerObject('obj_B', 'Componente_Movel_B', secondaryMesh);

    // 9. Partículas de Escoamento CFD
    const particleCount = 200;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 20;
      particlePositions[i + 1] = (Math.random() - 0.5) * 6;
      particlePositions[i + 2] = (Math.random() - 0.5) * 10;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.15, transparent: true, opacity: 0.8 });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // 10. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (simulationRunningRef.current && mainMeshRef.current) {
        const elapsedTime = clock.getElapsedTime();
        mainMeshRef.current.rotation.z = Math.sin(elapsedTime * 4) * 0.02;

        if (particlesRef.current) {
          const positions = particlesRef.current.geometry.attributes.position.array;
          for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] += 0.15;
            if (positions[i] > 10) positions[i] = -10;
          }
          particlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
      }

      // Detecção de Colisão em Tempo Real
      const collisions = globalCollisionDetector.detectCollisions();
      if (collisions.length > 0) {
        setCollisionActive(true);
        setCollisionInfo(collisions[0]);
        if (mainMeshRef.current) mainMeshRef.current.material.color.setHex(0xef4444);
        if (secondaryMeshRef.current) secondaryMeshRef.current.material.color.setHex(0xef4444);
      } else {
        setCollisionActive(false);
        setCollisionInfo(null);
        if (mainMeshRef.current && viewMode3D !== 'stress') {
          mainMeshRef.current.material.color.setHex(0x38bdf8);
        } else if (mainMeshRef.current && viewMode3D === 'stress') {
          mainMeshRef.current.material.color.setHex(0xffffff);
        }
        if (secondaryMeshRef.current) secondaryMeshRef.current.material.color.setHex(0x9333ea);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 11. Manipulação do Mouse (Orbit, Pan e Raycasting)
    const handleMouseDown = (e) => {
      if (e.button === 2 || e.shiftKey) {
        isPanningRef.current = true;
      } else {
        isDraggingRef.current = true;
      }
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const rawX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const rawY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouseRef.current.set(rawX, rawY);

      let planeNormal = new THREE.Vector3(0, 0, 1);
      if (workingPlane === 'XZ') planeNormal = new THREE.Vector3(0, 1, 0);
      else if (workingPlane === 'YZ') planeNormal = new THREE.Vector3(1, 0, 0);

      const workPlane = new THREE.Plane(planeNormal, 0);
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersectionPt = new THREE.Vector3();
      const hitPlane = raycasterRef.current.ray.intersectPlane(workPlane, intersectionPt);

      if (hitPlane && cursorGizmoRef.current) {
        cursorGizmoRef.current.position.copy(intersectionPt);
        cursorGizmoRef.current.visible = true;
        setMousePos({
          x: (intersectionPt.x * 100).toFixed(1),
          y: (intersectionPt.y * 100).toFixed(1),
          z: (intersectionPt.z * 100).toFixed(1)
        });
      }

      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      if (isDraggingRef.current && mainMeshRef.current) {
        mainMeshRef.current.rotation.y += deltaX * 0.008;
        mainMeshRef.current.rotation.x += deltaY * 0.008;
      } else if (isPanningRef.current && cameraRef.current) {
        cameraRef.current.position.x -= deltaX * 0.02;
        cameraRef.current.position.y += deltaY * 0.02;
      }

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      isPanningRef.current = false;
    };

    const handleClick = (e) => {
      if (!cameraRef.current || !mainMeshRef.current) return;
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects([mainMeshRef.current, secondaryMeshRef.current].filter(Boolean));

      if (intersects.length > 0) {
        const hit = intersects[0];
        const faceIndex = hit.faceIndex;
        const point = hit.point;
        const entityData = {
          objectName: hit.object === mainMeshRef.current ? project.name : 'Componente_Secundario_B',
          faceIndex,
          normal: hit.face?.normal ? `(${hit.face.normal.x.toFixed(2)}, ${hit.face.normal.y.toFixed(2)}, ${hit.face.normal.z.toFixed(2)})` : 'N/A',
          point: `(${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)})`,
          distance: hit.distance.toFixed(2)
        };
        setSelectedInfo(entityData);
        setSelectedEntity({ type: 'face', id: `face-${faceIndex}`, data: entityData });
        addLog(`Face #${faceIndex} selecionada em [${entityData.objectName}]`);
      } else {
        setSelectedInfo(null);
        setSelectedEntity(null);
      }
    };

    const handleWheel = (e) => {
      if (!cameraRef.current) return;
      cameraRef.current.position.z += e.deltaY * 0.012;
      cameraRef.current.position.z = Math.max(3, Math.min(35, cameraRef.current.position.z));
    };

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('click', handleClick);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);

      globalCollisionDetector.unregisterObject('obj_A');
      globalCollisionDetector.unregisterObject('obj_B');

      if (mainMeshRef.current) {
        mainMeshRef.current.geometry.dispose();
        if (Array.isArray(mainMeshRef.current.material)) {
          mainMeshRef.current.material.forEach(m => m.dispose());
        } else {
          mainMeshRef.current.material.dispose();
        }
      }

      if (secondaryMeshRef.current) {
        secondaryMeshRef.current.geometry.dispose();
        secondaryMeshRef.current.material.dispose();
      }

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [workingPlane]);

  // Atualização em Tempo Real da Geometria Paramétrica 3D
  useEffect(() => {
    if (!mainMeshRef.current || !sceneRef.current) return;

    let newGeom;
    if (project.sketchProfile && project.sketchProfile.length >= 3) {
      newGeom = createExtrudedGeometryFromProfile(
        project.sketchProfile, 
        project.geometry?.length || 100, 
        workingPlane
      );
    } else {
      const L = ((project.geometry?.length || 1200) / 1200) * 8;
      const H = ((project.geometry?.height || 150) / 150) * 2.5;
      const W = ((project.geometry?.width || 100) / 100) * 2.5;
      newGeom = new THREE.BoxGeometry(L, H, W, 32, 16, 16);
    }
    computeStressColors(newGeom);

    mainMeshRef.current.geometry.dispose();
    mainMeshRef.current.geometry = newGeom;
    globalCollisionDetector.updateBounds();
  }, [
    project.geometry?.length, 
    project.geometry?.height, 
    project.geometry?.width, 
    project.sketchProfile
  ]);

  // Sincronizar simulação running
  useEffect(() => {
    simulationRunningRef.current = simulationRunning;
  }, [simulationRunning]);

  // Atualizar modo de visualização 3D
  useEffect(() => {
    if (mainMeshRef.current) {
      mainMeshRef.current.material.wireframe = (viewMode3D === 'wireframe');
      mainMeshRef.current.material.vertexColors = (viewMode3D === 'stress');
      mainMeshRef.current.material.color.setHex(viewMode3D === 'stress' ? 0xffffff : 0x38bdf8);
      mainMeshRef.current.material.needsUpdate = true;
    }
  }, [viewMode3D]);

  // Presets de Câmera
  useEffect(() => {
    if (!cameraRef.current || !mainMeshRef.current) return;
    if (cameraPreset === 'iso') {
      cameraRef.current.position.set(14, 9, 14);
      mainMeshRef.current.rotation.set(0, 0, 0);
    } else if (cameraPreset === 'top') {
      cameraRef.current.position.set(0, 18, 0.01);
      mainMeshRef.current.rotation.set(0, 0, 0);
    } else if (cameraPreset === 'front') {
      cameraRef.current.position.set(0, 0, 18);
      mainMeshRef.current.rotation.set(0, 0, 0);
    } else if (cameraPreset === 'right') {
      cameraRef.current.position.set(18, 0, 0);
      mainMeshRef.current.rotation.set(0, 0, 0);
    }
    cameraRef.current.lookAt(0, 0, 0);
  }, [cameraPreset]);

  // Mover Objeto B em direção ao Objeto A para demonstrar colisão
  const handleToggleMoveCollision = () => {
    if (!secondaryMeshRef.current) return;
    const targetX = collisionMoving ? 7 : 3.5;
    setCollisionMoving(!collisionMoving);
    secondaryMeshRef.current.position.x = targetX;
    addLog(`Objeto B movimentado para X = ${targetX}mm.`);
  };

  return (
    <div className="relative w-full h-full min-h-[480px] bg-[#0b0f19] rounded-xl border border-white/10 overflow-hidden select-none">
      {/* Three.js Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Toolbar Superior: Largura máxima controlada para NUNCA encostar no ViewCube */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-[#111827]/90 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-xl font-mono text-xs max-w-[calc(100%-110px)] overflow-x-auto scrollbar-none">
        <button
          onClick={() => setViewMode3D('stress')}
          className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-all shrink-0 ${
            viewMode3D === 'stress' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Von Mises
        </button>
        <button
          onClick={() => setViewMode3D('wireframe')}
          className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-all shrink-0 ${
            viewMode3D === 'wireframe' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" /> Malha
        </button>
        <button
          onClick={() => setViewMode3D('cfd_vectors')}
          className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-all shrink-0 ${
            viewMode3D === 'cfd_vectors' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" /> CFD
        </button>

        <div className="w-px h-4 bg-white/10 mx-1 shrink-0" />

        <button
          onClick={handleToggleMoveCollision}
          className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-all border shrink-0 ${
            collisionActive 
              ? 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse' 
              : 'bg-purple-500/15 text-purple-300 border-purple-500/30 hover:bg-purple-500/25'
          }`}
          title="Move o Objeto B para simular colisão"
        >
          <Move3d className="w-3.5 h-3.5" />
          {collisionActive ? 'Reset B' : 'Colidir B'}
        </button>
      </div>

      {/* ViewCube Top Right */}
      <div className="absolute top-3 right-3 z-10 bg-[#111827]/90 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-xl flex flex-col items-center gap-1 font-mono text-[9px] shrink-0">
        <span className="text-slate-500 uppercase tracking-wider font-bold">ViewCube</span>
        <div className="grid grid-cols-3 gap-1 w-18 font-bold text-center">
          <div className="col-span-3 py-0.5 bg-white/5 hover:bg-blue-600 hover:text-white cursor-pointer rounded transition-all" onClick={() => setCameraPreset('top')}>TOP</div>
          <div className="py-0.5 bg-white/5 hover:bg-blue-600 hover:text-white cursor-pointer rounded transition-all" onClick={() => setCameraPreset('front')}>FRONT</div>
          <div className="py-0.5 bg-blue-600 text-white cursor-pointer rounded shadow font-extrabold" onClick={() => setCameraPreset('iso')}>ISO</div>
          <div className="py-0.5 bg-white/5 hover:bg-blue-600 hover:text-white cursor-pointer rounded transition-all" onClick={() => setCameraPreset('right')}>RIGHT</div>
        </div>
      </div>

      {/* Alerta de Colisão Flutuante */}
      {collisionActive && collisionInfo && (
        <div className="absolute top-16 left-3 z-10 bg-red-500/20 border border-red-500/50 backdrop-blur-md px-3.5 py-2 rounded-xl text-red-300 font-mono text-xs flex items-center gap-2.5 shadow-2xl animate-bounce max-w-sm">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <div className="font-bold">COLISÃO DETECTADA!</div>
            <div className="text-[10px] text-red-200">
              {collisionInfo.objectA.name} ↔ {collisionInfo.objectB.name} ({collisionInfo.penetrationDepth}mm)
            </div>
          </div>
        </div>
      )}

      {/* Face Selecionada Overlay */}
      {selectedInfo && (
        <div className="absolute top-16 right-3 z-10 bg-[#111827]/90 border border-cyan-500/40 backdrop-blur-md p-2.5 rounded-xl text-slate-300 font-mono text-xs space-y-1 shadow-2xl max-w-xs">
          <div className="text-cyan-400 font-bold flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5" /> Face #{selectedInfo.faceIndex}
          </div>
          <div className="text-[10px] text-slate-400">Normal: {selectedInfo.normal}</div>
          <div className="text-[10px] text-slate-400">Ponto: {selectedInfo.point}</div>
        </div>
      )}

      {/* Barra Inferior com Telemetria e Controles */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 bg-[#111827]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 shadow-xl font-mono text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSimulationRunning(!simulationRunning)}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold text-xs transition-all ${
              simulationRunning ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-blue-600 text-white shadow'
            }`}
          >
            {simulationRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {simulationRunning ? 'PAUSAR' : 'VIBRAÇÃO'}
          </button>
          <button
            onClick={() => setSimulationRunning(false)}
            className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-lg transition-all"
            title="Resetar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <div><span className="text-red-400 font-bold">X:</span> {mousePos.x} mm</div>
          <div><span className="text-green-400 font-bold">Y:</span> {mousePos.y} mm</div>
          <div><span className="text-blue-400 font-bold">Z:</span> {mousePos.z} mm</div>
          <div className="hidden sm:block text-slate-300 font-semibold bg-white/5 px-2 py-0.5 rounded border border-white/10">
            Plano: <span className="text-cyan-400">{workingPlane}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
