import React, { useState } from 'react';
import { useCAD } from '../context/CADContext';
import { ThreeCanvas } from '../components/ThreeCanvas';
import { 
  Box, Scissors, Combine, Layers, Sliders, RefreshCw, 
  ArrowRight, ShieldCheck, Check, Plus, Trash2, Eye, EyeOff, 
  Crosshair, Circle, Edit3, Settings 
} from 'lucide-react';

export const CADInventorView = () => {
  const { 
    project, setProject, setActiveView, addLog, 
    addCADFeature, updateCADFeature, selectedEntity, workingPlane 
  } = useCAD();

  const [selectedFeatureId, setSelectedFeatureId] = useState(project.historyTree?.[0]?.id || null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOpType, setNewOpType] = useState('hole');
  const [newOpName, setNewOpName] = useState('Furo Pasante ⌀15mm');
  const [newOpParam, setNewOpParam] = useState(15);

  const historyList = project.historyTree || [];
  const selectedFeature = historyList.find(f => f.id === selectedFeatureId) || historyList[0];

  const handleParamChange = (field, val) => {
    const num = parseFloat(val) || 0;
    setProject(prev => ({
      ...prev,
      geometry: { ...prev.geometry, [field]: num }
    }));
    addLog(`Dimensão '${field}' alterada para ${num}mm.`);
  };

  const handleFeatureParamUpdate = (paramKey, newVal) => {
    if (!selectedFeature) return;
    const numVal = parseFloat(newVal) || 0;
    updateCADFeature(selectedFeature.id, { [paramKey]: numVal });
  };

  const handleAddFeatureSubmit = (e) => {
    e.preventDefault();
    let featData = {
      name: newOpName,
      type: newOpType,
      active: true,
      params: {}
    };

    if (newOpType === 'hole') {
      featData.params = { diameter: Number(newOpParam), depth: 20 };
    } else if (newOpType === 'fillet') {
      featData.params = { radius: Number(newOpParam) };
    } else if (newOpType === 'chamfer') {
      featData.params = { distance: Number(newOpParam) };
    } else if (newOpType === 'cut') {
      featData.params = { depth: Number(newOpParam) };
    }

    addCADFeature(featData);
    setShowAddModal(false);
  };

  const toggleFeatureActive = (id) => {
    setProject(prev => ({
      ...prev,
      historyTree: prev.historyTree.map(f => f.id === id ? { ...f, active: !f.active } : f)
    }));
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#0a0e1a]">
      {/* 3D Central Viewport */}
      <div className="flex-1 h-full p-2 flex flex-col min-h-[400px]">
        <ThreeCanvas />
      </div>

      {/* Right CAD Inspector Panel com Árvore de Operações Paramétrica (Requisito 2) */}
      <div className="w-full md:w-96 h-full bg-[#111827]/90 border-l border-white/10 p-4 overflow-y-auto space-y-5 font-mono text-xs select-none shrink-0">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Box className="w-4 h-4 text-cyan-400" /> CAD Inventor Paramétrico
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Geometria sólida com árvore de operações viva.
            </p>
          </div>
          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded border border-cyan-500/30">
            SÓLIDO 3D
          </span>
        </div>

        {/* Entidade Selecionada no Viewport via Raycasting (Requisito 3) */}
        {selectedEntity ? (
          <div className="p-3 bg-blue-600/10 border border-cyan-500/40 rounded-xl space-y-1">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
              <Crosshair className="w-3.5 h-3.5" /> Entidade Ativa: {selectedEntity.type.toUpperCase()}
            </div>
            <div className="text-[10px] text-slate-300">
              ID: {selectedEntity.id} · Normal: {selectedEntity.data?.normal || 'N/A'}
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-500 text-[11px] flex items-center gap-2">
            <Crosshair className="w-3.5 h-3.5 text-slate-600" />
            <span>Clique sobre faces ou arestas no 3D para inspecionar.</span>
          </div>
        )}

        {/* Barra de Novas Operações CAD */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Árvore de Operações ({historyList.length})
            </span>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-2 py-0.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded font-bold flex items-center gap-1 transition-all"
            >
              <Plus className="w-3 h-3" /> Nova Operação
            </button>
          </div>

          {/* Lista de Operações da Árvore */}
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {historyList.map((feat) => {
              const isSelected = selectedFeature?.id === feat.id;
              return (
                <div
                  key={feat.id}
                  onClick={() => setSelectedFeatureId(feat.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-600/20 border-cyan-400 text-white font-bold shadow'
                      : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300'
                  } ${!feat.active ? 'opacity-40' : ''}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                    <span className="truncate text-xs">{feat.name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFeatureActive(feat.id); }}
                      className="text-slate-400 hover:text-white p-1"
                      title={feat.active ? 'Desativar operação' : 'Ativar operação'}
                    >
                      {feat.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Editor de Parâmetros da Operação Selecionada (Requisito 2) */}
        {selectedFeature && (
          <div className="p-3.5 bg-[#0d1117] rounded-xl border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-cyan-400" />
                Parâmetros: {selectedFeature.name}
              </span>
              <span className="text-[10px] text-slate-500 uppercase">{selectedFeature.type}</span>
            </div>

            {selectedFeature.params && Object.keys(selectedFeature.params).length > 0 ? (
              <div className="space-y-2 text-[11px]">
                {Object.entries(selectedFeature.params).map(([key, val]) => (
                  <div key={key}>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span className="capitalize">{key}:</span>
                      <strong className="text-cyan-400">{val} mm</strong>
                    </div>
                    {typeof val === 'number' && (
                      <input
                        type="range"
                        min={1}
                        max={key === 'depth' ? 2000 : 100}
                        value={val}
                        onChange={(e) => handleFeatureParamUpdate(key, e.target.value)}
                        className="w-full accent-cyan-400"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic">Esta operação utiliza parâmetros do esboço pai.</p>
            )}
          </div>
        )}

        {/* Dimensões Globais do Sólido (mm) */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Dimensões do Sólido Principal (mm)
          </span>

          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Comprimento (L):</span>
                <span className="text-cyan-400 font-bold">{project.geometry.length} mm</span>
              </div>
              <input 
                type="range" 
                min="200" 
                max="3000" 
                step="50"
                value={project.geometry.length} 
                onChange={(e) => handleParamChange('length', e.target.value)}
                className="w-full accent-cyan-400" 
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Altura da Seção (H):</span>
                <span className="text-cyan-400 font-bold">{project.geometry.height} mm</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="500" 
                step="10"
                value={project.geometry.height} 
                onChange={(e) => handleParamChange('height', e.target.value)}
                className="w-full accent-cyan-400" 
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Largura da Mesa (W):</span>
                <span className="text-cyan-400 font-bold">{project.geometry.width} mm</span>
              </div>
              <input 
                type="range" 
                min="30" 
                max="300" 
                step="10"
                value={project.geometry.width} 
                onChange={(e) => handleParamChange('width', e.target.value)}
                className="w-full accent-cyan-400" 
              />
            </div>
          </div>
        </div>

        {/* Avançar para Estúdio de Materiais */}
        <button
          onClick={() => setActiveView('materiais')}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
        >
          Avançar para Estúdio de Materiais <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Modal para Adicionar Operação Paramétrica */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 font-mono text-xs">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Plus className="w-4 h-4 text-cyan-400" /> Adicionar Operação CAD Sólida
            </h3>

            <form onSubmit={handleAddFeatureSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Tipo de Operação:</label>
                <select
                  value={newOpType}
                  onChange={e => {
                    setNewOpType(e.target.value);
                    if (e.target.value === 'hole') setNewOpName('Furo Cilíndrico ⌀15mm');
                    else if (e.target.value === 'fillet') setNewOpName('Filete R=5mm');
                    else if (e.target.value === 'chamfer') setNewOpName('Chanfro C=3mm');
                    else if (e.target.value === 'cut') setNewOpName('Corte Booleano');
                  }}
                  className="w-full bg-[#0d1117] border border-white/15 px-3 py-2 rounded-lg text-white font-mono"
                >
                  <option value="hole">Furo Cilíndrico (Hole)</option>
                  <option value="fillet">Filete / Arredondamento (Fillet)</option>
                  <option value="chamfer">Chanfro em Aresta (Chamfer)</option>
                  <option value="cut">Corte Booleano (Cut)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Nome Descritivo:</label>
                <input
                  type="text"
                  value={newOpName}
                  onChange={e => setNewOpName(e.target.value)}
                  className="w-full bg-[#0d1117] border border-white/15 px-3 py-2 rounded-lg text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Dimensão Principal (mm):</label>
                <input
                  type="number"
                  value={newOpParam}
                  onChange={e => setNewOpParam(e.target.value)}
                  className="w-full bg-[#0d1117] border border-white/15 px-3 py-2 rounded-lg text-cyan-400 font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" /> Inserir na Árvore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
