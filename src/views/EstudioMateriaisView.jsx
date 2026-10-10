import React, { useState } from 'react';
import { useCAD } from '../context/CADContext';
import { ThreeCanvas } from '../components/ThreeCanvas';
import { 
  ShieldCheck, Database, Plus, Anchor, ArrowDown, 
  Trash2, ArrowRight, Check, Sliders, Info, Edit3, X, Save 
} from 'lucide-react';

export const EstudioMateriaisView = () => {
  const { 
    project, materialsList, updateMaterial, addCustomMaterial,
    addBoundaryCondition, removeBoundaryCondition, 
    setActiveView, addLog 
  } = useCAD();

  const [filterCategory, setFilterCategory] = useState('all');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [selectedMatDetail, setSelectedMatDetail] = useState(project.material);

  // Formulário de novo material personalizado
  const [customForm, setCustomForm] = useState({
    name: 'Aço Customizado Especial',
    category: 'Ligas Especiais',
    density: 7800,
    youngModulus: 205,
    poissonRatio: 0.28,
    yieldStrength: 350,
    tensileStrength: 520,
    compressiveStrength: 350,
    shearModulus: 80,
    thermalExpansion: 12.0,
    thermalConductivity: 45.0,
    standardRef: 'Norma Interna / Ensaio de Laboratório'
  });

  // Formulário de Condição de Contorno
  const [newBcType, setNewBcType] = useState('Fixed Support (Engaste)');
  const [newBcLoc, setNewBcLoc] = useState('Face Posterior (X=0)');
  const [newBcVal, setNewBcVal] = useState('-15.0 kN');

  const categories = ['all', 'Aços ao Carbono', 'Aços Liga', 'Aços Inoxidáveis', 'Ligas de Alumínio', 'Ligas de Titânio', 'Ligas de Cobre', 'Polímeros Termoplásticos', 'Ferros Fundidos'];

  const filteredMaterials = filterCategory === 'all' 
    ? materialsList 
    : materialsList.filter(m => m.category === filterCategory || (filterCategory === 'Ligas de Cobre' && m.category.includes('Cobre')));

  const handleSelectMaterial = (mat) => {
    setSelectedMatDetail(mat);
    updateMaterial(mat);
  };

  const handleCreateCustomMaterial = (e) => {
    e.preventDefault();
    if (!customForm.name) return;
    addCustomMaterial({
      ...customForm,
      density: Number(customForm.density),
      youngModulus: Number(customForm.youngModulus),
      poissonRatio: Number(customForm.poissonRatio),
      yieldStrength: Number(customForm.yieldStrength),
      tensileStrength: Number(customForm.tensileStrength),
      compressiveStrength: customForm.compressiveStrength ? Number(customForm.compressiveStrength) : 'Não informado',
      shearModulus: customForm.shearModulus ? Number(customForm.shearModulus) : Number((customForm.youngModulus / (2 * (1 + customForm.poissonRatio))).toFixed(1)),
      thermalExpansion: customForm.thermalExpansion ? Number(customForm.thermalExpansion) : 'Não informado',
      thermalConductivity: customForm.thermalConductivity ? Number(customForm.thermalConductivity) : 'Não informado',
    });
    setShowCustomModal(false);
  };

  const handleAddBcSubmit = (e) => {
    e.preventDefault();
    addBoundaryCondition({
      type: newBcType,
      location: newBcLoc,
      value: newBcVal
    });
  };

  const formatProp = (val, unit = '') => {
    if (val === undefined || val === null || val === '') return <span className="text-slate-500 italic">Não informado</span>;
    if (typeof val === 'string' && (val.includes('Não') || val.includes('definido') || val.includes('Frágil'))) {
      return <span className="text-amber-400/90 font-semibold">{val}</span>;
    }
    return <span className="text-white font-bold">{val} {unit}</span>;
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#0a0e1a]">
      {/* Viewport 3D Esquerdo */}
      <div className="flex-1 h-full p-2 flex flex-col min-h-[400px]">
        <ThreeCanvas />
      </div>

      {/* Painel Direito: Materiais & Propriedades de Engenharia */}
      <div className="w-full md:w-[460px] h-full bg-[#111827]/90 border-l border-white/10 p-4 overflow-y-auto space-y-5 font-mono text-xs select-none shrink-0">
        <div className="border-b border-white/10 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Estúdio de Materiais & Física
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Propriedades constitutivas isotrópicas da literatura técnica.
            </p>
          </div>
          <button
            onClick={() => setShowCustomModal(true)}
            className="px-2.5 py-1.5 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 rounded-lg font-bold flex items-center gap-1 transition-all"
            title="Criar Material Personalizado"
          >
            <Plus className="w-3.5 h-3.5" /> Novo Material
          </button>
        </div>

        {/* Filtro de Categoria */}
        <div>
          <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1.5">Família de Materiais:</label>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="w-full bg-[#0d1117] border border-white/15 px-3 py-1.5 rounded-lg text-white font-mono text-xs outline-none focus:border-cyan-400"
          >
            <option value="all">Todas as Famílias ({materialsList.length})</option>
            {categories.filter(c => c !== 'all').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Lista de Seleção de Materiais */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {filteredMaterials.map(m => {
            const isSelected = project.material?.id === m.id;
            return (
              <div
                key={m.id}
                onClick={() => handleSelectMaterial(m)}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected 
                    ? 'bg-blue-600/20 border-cyan-400 text-white font-bold shadow ring-1 ring-cyan-500/30' 
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-slate-300'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-xs">{m.name}</span>
                    {m.isCustom && <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 py-0.2 rounded border border-purple-500/30">CUSTOM</span>}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    E: {m.youngModulus} GPa · ν: {m.poissonRatio} · ρ: {m.density} kg/m³
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Tabela de Propriedades de Engenharia do Material Ativo (Requisito 6) */}
        <div className="bg-[#0d1117] p-3.5 rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-white text-xs flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              {project.material.name}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {project.material.standardRef || 'Padronizado'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] pt-1">
            <div>
              <span className="text-slate-500 block text-[10px]">Densidade (ρ):</span>
              {formatProp(project.material.density, 'kg/m³')}
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Módulo de Young (E):</span>
              {formatProp(project.material.youngModulus, 'GPa')}
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Coef. de Poisson (ν):</span>
              {formatProp(project.material.poissonRatio)}
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Limite de Escoamento (σ_y):</span>
              {formatProp(project.material.yieldStrength, 'MPa')}
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Resist. à Tração (σ_u):</span>
              {formatProp(project.material.tensileStrength, 'MPa')}
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Resist. à Compressão (σ_c):</span>
              {formatProp(project.material.compressiveStrength, 'MPa')}
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Módulo Cisalhamento (G):</span>
              {formatProp(project.material.shearModulus, 'GPa')}
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Expansão Térmica (α):</span>
              {formatProp(project.material.thermalExpansion, 'µm/m·K')}
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 block text-[10px]">Condutividade Térmica (k):</span>
              {formatProp(project.material.thermalConductivity, 'W/m·K')}
            </div>
          </div>
        </div>

        {/* Formulário de Condição de Contorno / Carregamentos */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <Anchor className="w-3.5 h-3.5 text-purple-400" /> Aplicar Condição de Contorno / Carga
          </span>

          <form onSubmit={handleAddBcSubmit} className="space-y-2 bg-[#0d1117] p-3 rounded-xl border border-white/10">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Tipo de Apoio / Carga:</label>
              <select 
                value={newBcType} 
                onChange={(e) => setNewBcType(e.target.value)}
                className="w-full bg-[#111827] border border-white/15 px-2.5 py-1.5 rounded-lg text-white font-mono text-xs outline-none"
              >
                <option>Fixed Support (Engaste)</option>
                <option>Pinned Support (Rótula / Pino)</option>
                <option>Força Pontual Vertical (Fz)</option>
                <option>Pressão Distribuída (MPa)</option>
                <option>Torque de Torção (N.m)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Localização:</label>
                <input 
                  type="text" 
                  value={newBcLoc} 
                  onChange={(e) => setNewBcLoc(e.target.value)}
                  className="w-full bg-[#111827] border border-white/15 px-2.5 py-1.5 rounded-lg text-white font-mono text-xs outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Valor / Magnitude:</label>
                <input 
                  type="text" 
                  value={newBcVal} 
                  onChange={(e) => setNewBcVal(e.target.value)}
                  className="w-full bg-[#111827] border border-white/15 px-2.5 py-1.5 rounded-lg text-cyan-400 font-mono font-bold text-xs outline-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-2 bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Condição
            </button>
          </form>
        </div>

        {/* Avançar para Simulação */}
        <button
          onClick={() => setActiveView('simulacao')}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
        >
          Executar Simulação FEA <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Modal de Criação de Material Personalizado */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" /> Cadastrar Material Personalizado
              </h3>
              <button onClick={() => setShowCustomModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomMaterial} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Nome do Material:</label>
                <input
                  type="text"
                  value={customForm.name}
                  onChange={e => setCustomForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-[#0d1117] border border-white/15 px-3 py-1.5 rounded-lg text-white font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Módulo de Young (GPa):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customForm.youngModulus}
                    onChange={e => setCustomForm(p => ({ ...p, youngModulus: e.target.value }))}
                    className="w-full bg-[#0d1117] border border-white/15 px-3 py-1.5 rounded-lg text-cyan-400 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Coef. Poisson (ν):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={customForm.poissonRatio}
                    onChange={e => setCustomForm(p => ({ ...p, poissonRatio: e.target.value }))}
                    className="w-full bg-[#0d1117] border border-white/15 px-3 py-1.5 rounded-lg text-cyan-400 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Densidade (kg/m³):</label>
                  <input
                    type="number"
                    value={customForm.density}
                    onChange={e => setCustomForm(p => ({ ...p, density: e.target.value }))}
                    className="w-full bg-[#0d1117] border border-white/15 px-3 py-1.5 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Limite Escoamento (MPa):</label>
                  <input
                    type="number"
                    value={customForm.yieldStrength}
                    onChange={e => setCustomForm(p => ({ ...p, yieldStrength: e.target.value }))}
                    className="w-full bg-[#0d1117] border border-white/15 px-3 py-1.5 rounded-lg text-white font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Resist. Tração (MPa):</label>
                  <input
                    type="number"
                    value={customForm.tensileStrength}
                    onChange={e => setCustomForm(p => ({ ...p, tensileStrength: e.target.value }))}
                    className="w-full bg-[#0d1117] border border-white/15 px-3 py-1.5 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Resist. Compressão (MPa):</label>
                  <input
                    type="number"
                    value={customForm.compressiveStrength}
                    onChange={e => setCustomForm(p => ({ ...p, compressiveStrength: e.target.value }))}
                    className="w-full bg-[#0d1117] border border-white/15 px-3 py-1.5 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow"
                >
                  <Save className="w-4 h-4" /> Salvar Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
