import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { DEFAULT_MATERIALS, getMaterialById } from '../data/materialsDatabase';
import { calcularFEA } from '../utils/feaEngine';
import { 
  salvarProjetoNuvem, salvarComoNovoProjetoNuvem, 
  listarProjetosNuvem, carregarProjetoNuvem, excluirProjetoNuvem 
} from '../firebase/projectService';

const CADContext = createContext(null);

export const defaultProject = {
  id: 'proj-001',
  name: 'Viga_Estrutural_PerfilI_Rev3.cad',
  version: '2.4-PRO',
  author: 'Eng. Carlos / FisisCAD Academic',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  workingPlane: 'XY', // XY | XZ | YZ
  material: DEFAULT_MATERIALS[0], // Aço ASTM A36 com propriedades completas
  geometry: {
    type: 'Beam_I_Section',
    length: 1200, // mm
    height: 150, // mm
    width: 100, // mm
    webThickness: 8, // mm
    flangeThickness: 12, // mm
    meshNodes: 5208,
    meshElements: 12400,
    elementSize: 15, // mm
  },
  boundaryConditions: [
    { id: 'bc-1', type: 'Fixed Support (Engaste)', location: 'Face Traseira (X=0)', value: '0 mm' },
    { id: 'bc-2', type: 'Força Pontual Vertical (Fz)', location: 'Extremidade Livre (X=1200)', value: '-15.0 kN' },
    { id: 'bc-3', type: 'Pressão Distribuída (Py)', location: 'Mesa Superior', value: '2.5 MPa' },
  ],
  simulation: {
    solver: 'FEA Linear Estático (Euler-Bernoulli + Navier)',
    status: 'CONVERGED',
    maxVonMisesStress: 184.2, // MPa
    maxNormalStress: 168.5, // MPa
    maxShearStress: 28.4, // MPa
    maxDisplacement: 2.14, // mm
    maxStrain: '8.425e-4',
    minFactorOfSafety: 1.36,
    iterations: 42,
    computeTimeMs: 240,
    reactions: {
      verticalForce_kN: 45.0,
      reactionMoment_kNm: 36.0,
    },
    isRealistic: true,
  },
  historyTree: [
    { id: 'f-1', name: 'Plano Base XY', type: 'plane', active: true, params: { plane: 'XY' } },
    { id: 'f-2', name: 'Esboço 2D - Perfil I', type: 'sketch', active: true, params: { pointsCount: 12, closed: true } },
    { id: 'f-3', name: 'Extrusão Sólida (1200mm)', type: 'extrude', active: true, params: { depth: 1200 } },
    { id: 'f-4', name: 'Furação de Alívio ⌀20mm', type: 'cut', active: true, params: { diameter: 20, depth: 8 } },
    { id: 'f-5', name: 'Filete de Canto R=5mm', type: 'fillet', active: true, params: { radius: 5 } },
  ],
  sketchProfile: null, // Armazena pontos do esboço 2D closed loop [{x, y}]
};

export const CADProvider = ({ children }) => {
  const [activeView, setActiveView] = useState('hub');
  const [deviceMode, setDeviceMode] = useState('desktop');
  const [project, setProject] = useState(defaultProject);
  const [currentUser, setCurrentUser] = useState(null);
  const [workingPlane, setWorkingPlane] = useState('XY'); // XY, XZ, YZ
  const [selectedEntity, setSelectedEntity] = useState(null); // { type: 'face'|'edge'|'vertex', id, info }
  const [collisionActive, setCollisionActive] = useState(false);
  const [collisionInfo, setCollisionInfo] = useState(null);
  const [materialsList, setMaterialsList] = useState(DEFAULT_MATERIALS);

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  const [viewMode3D, setViewMode3D] = useState('stress'); // solid | wireframe | stress | cfd_vectors
  const [cameraPreset, setCameraPreset] = useState('iso'); // iso | top | front | right
  const [cloudModalOpen, setCloudModalOpen] = useState(false);

  const [logs, setLogs] = useState([
    '[KERNEL] FisisCAD Kernel v2.4-PRO inicializado com aceleração WebGL.',
    '[SOLVER] Mapeamento de malha calibrado: 5.208 nós / 12.400 elementos tetraédricos.',
    '[SYSTEM] Pronto para modelagem paramétrica e análise de integridade física.'
  ]);

  const addLog = (msg) => {
    setLogs(prev => [...prev.slice(-14), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Sincronizar usuário Firebase Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (usr) => {
      setCurrentUser(usr);
      if (usr) {
        addLog(`Sessão ativa: ${usr.displayName || usr.email}`);
      }
    });
    return () => unsub();
  }, []);

  // Recalcular FEA sempre que geometria, material ou condições de contorno mudarem
  const runFEACalculation = (customMeshConfig = {}) => {
    try {
      const results = calcularFEA(
        project.geometry,
        project.material,
        project.boundaryConditions,
        { elementSize: project.geometry.elementSize, ...customMeshConfig }
      );

      setProject(prev => ({
        ...prev,
        simulation: {
          ...prev.simulation,
          ...results
        },
        geometry: {
          ...prev.geometry,
          meshNodes: results.mesh.nodes,
          meshElements: results.mesh.elements,
        }
      }));

      addLog(`FEA recalculado: Von Mises = ${results.maxVonMisesStress} MPa | FoS = ${results.minFactorOfSafety}`);
      return results;
    } catch (err) {
      console.error('Erro no cálculo FEA:', err);
      addLog(`Falha no cálculo FEA: ${err.message}`);
    }
  };

  // Exportar Projeto localmente como arquivo .cad
  const saveProjectCAD = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", project.name.endsWith('.cad') ? project.name : `${project.name}.cad`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addLog(`Projeto exportado localmente (.cad): ${project.name}`);
  };

  // Importar Projeto a partir de arquivo .cad local com mesclagem segura
  const loadProjectCAD = (fileContent) => {
    try {
      const parsed = JSON.parse(fileContent);
      if (parsed && (parsed.name || parsed.geometry)) {
        const mergedProject = {
          ...defaultProject,
          ...parsed,
          geometry: { ...defaultProject.geometry, ...(parsed.geometry || {}) },
          simulation: { ...defaultProject.simulation, ...(parsed.simulation || {}) },
          material: parsed.material || defaultProject.material,
          boundaryConditions: Array.isArray(parsed.boundaryConditions) ? parsed.boundaryConditions : defaultProject.boundaryConditions,
          historyTree: Array.isArray(parsed.historyTree) ? parsed.historyTree : defaultProject.historyTree,
        };
        setProject(mergedProject);
        if (parsed.workingPlane) setWorkingPlane(parsed.workingPlane);
        addLog(`Projeto .cad '${mergedProject.name}' carregado com sucesso.`);
        return true;
      }
    } catch (err) {
      alert('Erro ao ler o arquivo .cad. Certifique-se de que é um formato válido.');
    }
    return false;
  };

  // Salvar Projeto na Nuvem (Firebase)
  const saveProjectCloud = async (customName = null) => {
    if (!currentUser) {
      alert('Você precisa estar autenticado com sua conta Google para salvar na nuvem.');
      return false;
    }
    try {
      const projToSave = customName 
        ? { ...project, name: customName.endsWith('.cad') ? customName : `${customName}.cad` }
        : project;

      const res = await salvarProjetoNuvem(currentUser.uid, projToSave);
      setProject(prev => ({ ...prev, id: res.id, name: res.name }));
      addLog(`Projeto '${res.name}' salvo na nuvem com sucesso no Firebase.`);
      return true;
    } catch (err) {
      console.error(err);
      alert(`Falha ao salvar na nuvem: ${err.message}`);
      return false;
    }
  };

  // Salvar Como Novo Projeto na Nuvem
  const saveProjectAsNewCloud = async (novoNome) => {
    if (!currentUser) {
      alert('Você precisa estar autenticado para salvar na nuvem.');
      return false;
    }
    try {
      const res = await salvarComoNovoProjetoNuvem(currentUser.uid, project, novoNome);
      setProject(prev => ({ ...prev, id: res.id, name: res.name }));
      addLog(`Novo projeto '${res.name}' criado e salvo na nuvem.`);
      return true;
    } catch (err) {
      alert(`Falha ao salvar como novo: ${err.message}`);
      return false;
    }
  };

  // Carregar Projeto da Nuvem com mesclagem segura
  const loadProjectFromCloud = async (projectId) => {
    if (!currentUser) return false;
    try {
      const projData = await carregarProjetoNuvem(currentUser.uid, projectId);
      if (projData) {
        const mergedProject = {
          ...defaultProject,
          ...projData,
          geometry: { ...defaultProject.geometry, ...(projData.geometry || {}) },
          simulation: { ...defaultProject.simulation, ...(projData.simulation || {}) },
          material: projData.material || defaultProject.material,
          boundaryConditions: Array.isArray(projData.boundaryConditions) ? projData.boundaryConditions : defaultProject.boundaryConditions,
          historyTree: Array.isArray(projData.historyTree) ? projData.historyTree : defaultProject.historyTree,
        };
        setProject(mergedProject);
        if (projData.workingPlane) setWorkingPlane(projData.workingPlane);
        addLog(`Projeto '${mergedProject.name}' carregado da nuvem.`);
        return true;
      }
    } catch (err) {
      alert(`Falha ao carregar projeto da nuvem: ${err.message}`);
      return false;
    }
  };

  // Listar Projetos da Nuvem
  const listProjectsFromCloud = async () => {
    if (!currentUser) return [];
    return await listarProjetosNuvem(currentUser.uid);
  };

  // Excluir Projeto da Nuvem
  const deleteProjectFromCloud = async (projectId) => {
    if (!currentUser) return false;
    try {
      await excluirProjetoNuvem(currentUser.uid, projectId);
      addLog(`Projeto excluído da nuvem.`);
      return true;
    } catch (err) {
      alert(`Erro ao excluir projeto: ${err.message}`);
      return false;
    }
  };

  // Gestão de Materiais
  const updateMaterial = (newMat) => {
    setProject(prev => ({ ...prev, material: newMat }));
    addLog(`Material atribuído: ${newMat.name}`);
    // Recalcula FEA com o novo material
    setTimeout(() => runFEACalculation(), 50);
  };

  const addCustomMaterial = (customMat) => {
    const matWithId = {
      ...customMat,
      id: `custom_${Date.now()}`,
      isCustom: true
    };
    setMaterialsList(prev => [...prev, matWithId]);
    updateMaterial(matWithId);
    addLog(`Material personalizado criado: ${matWithId.name}`);
  };

  // Condições de contorno
  const addBoundaryCondition = (bc) => {
    const newBc = { ...bc, id: `bc-${Date.now()}` };
    setProject(prev => ({
      ...prev,
      boundaryConditions: [...prev.boundaryConditions, newBc]
    }));
    addLog(`Condição de contorno adicionada: ${bc.type} (${bc.value})`);
    setTimeout(() => runFEACalculation(), 50);
  };

  const removeBoundaryCondition = (id) => {
    setProject(prev => ({
      ...prev,
      boundaryConditions: prev.boundaryConditions.filter(b => b.id !== id)
    }));
    addLog(`Condição de contorno removida.`);
    setTimeout(() => runFEACalculation(), 50);
  };

  // Adicionar operação na árvore de histórico
  const addCADFeature = (feature) => {
    const newFeature = {
      id: `f-${Date.now()}`,
      active: true,
      ...feature
    };
    setProject(prev => ({
      ...prev,
      historyTree: [...prev.historyTree, newFeature]
    }));
    addLog(`Operação CAD adicionada: ${newFeature.name}`);
  };

  // Atualizar operação na árvore
  const updateCADFeature = (id, updatedParams) => {
    setProject(prev => ({
      ...prev,
      historyTree: prev.historyTree.map(f => f.id === id ? { ...f, params: { ...f.params, ...updatedParams } } : f)
    }));
    addLog(`Parâmetro da operação '${id}' atualizado.`);
  };

  return (
    <CADContext.Provider value={{
      activeView, setActiveView,
      deviceMode, setDeviceMode,
      project, setProject,
      currentUser,
      workingPlane, setWorkingPlane,
      selectedEntity, setSelectedEntity,
      collisionActive, setCollisionActive,
      collisionInfo, setCollisionInfo,
      materialsList, updateMaterial, addCustomMaterial,
      runFEACalculation,
      aiModalOpen, setAiModalOpen,
      simulationRunning, setSimulationRunning,
      simulationTime, setSimulationTime,
      viewMode3D, setViewMode3D,
      cameraPreset, setCameraPreset,
      cloudModalOpen, setCloudModalOpen,
      logs, addLog,
      saveProjectCAD, loadProjectCAD,
      saveProjectCloud, saveProjectAsNewCloud, 
      loadProjectFromCloud, listProjectsFromCloud, deleteProjectFromCloud,
      addBoundaryCondition, removeBoundaryCondition,
      addCADFeature, updateCADFeature
    }}>
      {children}
    </CADContext.Provider>
  );
};

export const useCAD = () => {
  const ctx = useContext(CADContext);
  if (!ctx) throw new Error('useCAD deve ser utilizado dentro do CADProvider');
  return ctx;
};
