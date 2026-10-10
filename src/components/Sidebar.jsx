import React, { useState } from 'react';
import { useCAD } from '../context/CADContext';
import { 
  Folder, Layers, ShieldCheck, Box, Activity, FileSpreadsheet, 
  ChevronRight, ChevronDown, Plus, Trash2, Eye, EyeOff, Wrench, Sparkles, Cpu
} from 'lucide-react';

export const Sidebar = () => {
  const { 
    activeView, setActiveView, 
    deviceMode, 
    project, setProject,
    removeBoundaryCondition 
  } = useCAD();

  const [treeExpanded, setTreeExpanded] = useState(true);
  const [bcExpanded, setBcExpanded] = useState(true);

  const toggleFeatureActive = (id) => {
    setProject(prev => ({
      ...prev,
      historyTree: prev.historyTree.map(f => f.id === id ? { ...f, active: !f.active } : f)
    }));
  };

  const navList = [
    { id: 'hub', label: '1. Hub & Dashboard', icon: Folder },
    { id: 'cad_inventor', label: '2. CAD Inventor Sólido', icon: Box },
    { id: 'sketch_model', label: '3. Modelagem 2D/3D', icon: Layers },
    { id: 'ensaios', label: '4. Ensaios Físicos', icon: Activity },
    { id: 'materiais', label: '5. Estúdio de Materiais', icon: ShieldCheck },
    { id: 'simulacao', label: '6. Simulação FEA', icon: Cpu },
    { id: 'relatorios', label: '7. Relatórios & Analytics', icon: FileSpreadsheet },
  ];

  return (
    <aside className={`bg-surface-container-lowest border-r border-outline-variant/40 flex flex-col shrink-0 select-none transition-all ${
      deviceMode === 'mobile' ? 'w-full md:w-64 h-auto' : 'w-64 h-full'
    }`}>
      {/* View Switcher Mobile/Desktop List */}
      <div className="p-3 border-b border-outline/20">
        <span className="text-[10px] font-mono font-bold text-outline uppercase tracking-wider block mb-2 px-2">Navegação Principais Visões</span>
        <div className="space-y-1">
          {navList.map(item => {
            const Icon = item.icon;
            const isSelected = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-all ${
                  isSelected 
                    ? 'bg-primary-container text-on-primary-container font-bold shadow' 
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-on-primary-container' : 'text-outline'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feature Tree / Parametric History */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div>
          <button 
            onClick={() => setTreeExpanded(!treeExpanded)}
            className="w-full flex items-center justify-between text-xs font-mono font-bold text-on-surface py-1 px-1 hover:bg-surface-container rounded"
          >
            <span className="flex items-center gap-1.5 text-primary">
              <Layers className="w-4 h-4" /> Árvore Paramétrica (.cad)
            </span>
            {treeExpanded ? <ChevronDown className="w-4 h-4 text-outline" /> : <ChevronRight className="w-4 h-4 text-outline" />}
          </button>

          {treeExpanded && (
            <div className="mt-2 space-y-1 pl-2 font-mono text-xs border-l border-outline/30">
              {(project.historyTree || []).map((item) => (
                <div 
                  key={item.id}
                  className={`flex items-center justify-between px-2 py-1.5 rounded group transition-colors ${
                    item.active ? 'bg-surface-container hover:bg-surface-container-high text-on-surface' : 'opacity-40 text-outline'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <button 
                    onClick={() => toggleFeatureActive(item.id)}
                    className="text-outline hover:text-primary p-0.5"
                    title="Ativar/Desativar recurso na geometria"
                  >
                    {item.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Boundary Conditions Summary */}
        <div>
          <button 
            onClick={() => setBcExpanded(!bcExpanded)}
            className="w-full flex items-center justify-between text-xs font-mono font-bold text-on-surface py-1 px-1 hover:bg-surface-container rounded"
          >
            <span className="flex items-center gap-1.5 text-secondary">
              <ShieldCheck className="w-4 h-4" /> Cargas & Contornos
            </span>
            {bcExpanded ? <ChevronDown className="w-4 h-4 text-outline" /> : <ChevronRight className="w-4 h-4 text-outline" />}
          </button>

          {bcExpanded && (
            <div className="mt-2 space-y-1.5 pl-2 font-mono text-[11px] border-l border-secondary/30">
              {project.boundaryConditions.map((bc) => (
                <div key={bc.id} className="p-2 bg-surface-container rounded border border-outline/20 space-y-1">
                  <div className="flex items-center justify-between text-on-surface font-semibold">
                    <span className="truncate">{bc.type}</span>
                    <button 
                      onClick={() => removeBoundaryCondition(bc.id)}
                      className="text-outline hover:text-error"
                      title="Remover carga"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex justify-between text-[10px] text-outline">
                    <span>{bc.location}</span>
                    <span className="text-secondary font-bold">{bc.value}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
