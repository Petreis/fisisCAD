import React, { useState } from 'react';
import { useCAD } from '../context/CADContext';
import {
  FolderPlus, FolderOpen, Clock, Sparkles, BookOpen, ArrowRight,
  FileCode, CheckCircle, Download, Cpu, Box, Activity, Wind,
  Flame, RotateCcw, Upload, Search, LayoutGrid, List, Cloud
} from 'lucide-react';

const TEMPLATES = [
  {
    id: 't-1',
    title: 'Viga Bi-Engastada (Perfil I)',
    category: 'Estática Estrutural',
    tag: 'FEA',
    tagColor: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
    desc: 'Análise de deflexão e distribuição de tensão de Von Mises sob carga distribuída de 15kN.',
    icon: Activity,
    iconColor: 'text-blue-400',
    bgGlow: 'from-blue-600/10',
    view: 'simulacao',
    meta: '4.850 nós · Aço ASTM A36',
  },
  {
    id: 't-2',
    title: 'Aerofólio NACA 0012',
    category: 'Dinâmica dos Fluidos',
    tag: 'CFD',
    tagColor: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
    desc: 'Simulação de camada limite e força de sustentação aerodinâmica a Mach 0.2.',
    icon: Wind,
    iconColor: 'text-cyan-400',
    bgGlow: 'from-cyan-600/10',
    view: 'simulacao',
    meta: '18.200 elementos · Ar (1.225 kg/m³)',
  },
  {
    id: 't-3',
    title: 'Ensaio de Tração (Corpo de Prova)',
    category: 'Ciência dos Materiais',
    tag: 'Material',
    tagColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    desc: 'Curva Tensão × Deformação até o limite de escoamento e deformação plástica.',
    icon: Flame,
    iconColor: 'text-amber-400',
    bgGlow: 'from-amber-600/10',
    view: 'materiais',
    meta: '6.400 nós · Alumínio 6061-T6',
  },
  {
    id: 't-4',
    title: 'Pêndulo Duplo Não-Linear',
    category: 'Mecânica Dinâmica',
    tag: 'Dinâmica',
    tagColor: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
    desc: 'Simulação de caos determinístico com Rapier3D Wasm — energia cinética e potencial.',
    icon: RotateCcw,
    iconColor: 'text-purple-400',
    bgGlow: 'from-purple-600/10',
    view: 'simulacao',
    meta: '2.100 nós · Polímero ABS',
  },
];

const RECENT_FILES = [
  { name: 'Viga_Estrutural_PerfilI_Rev3.cad', material: 'Aço ASTM A36', status: 'Convergido', fos: '1.36', date: '10/10/2026' },
  { name: 'Aerofólio_NACA0012_v2.cad', material: 'Ar (1.225 kg/m³)', status: 'Convergido', fos: '—', date: '09/10/2026' },
  { name: 'Prova_Tracao_Al6061.cad', material: 'Alumínio 6061-T6', status: 'Em Progresso', fos: '—', date: '08/10/2026' },
];

export const HubView = () => {
  const { 
    setActiveView, setProject, saveProjectCAD, setAiModalOpen, 
    addLog, loadProjectCAD, setCloudModalOpen 
  } = useCAD();

  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');

  const createNewProject = () => {
    const name = prompt('Nome do Novo Projeto (.cad):', 'Novo_Componente_Mecanico.cad');
    if (!name) return;
    setProject(prev => ({
      ...prev,
      name: name.endsWith('.cad') ? name : `${name}.cad`,
      createdAt: new Date().toISOString(),
    }));
    addLog(`Novo projeto .cad criado: ${name}`);
    setActiveView('sketch_model');
  };

  const openFileDialog = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.cad,.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (loadProjectCAD(ev.target.result)) {
          setActiveView('cad_inventor');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const filteredTemplates = TEMPLATES.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0e1a] text-white">
      {/* ── Hero Banner (AutoCAD-style start screen) ── */}
      <div
        className="relative px-8 py-10 border-b border-white/10 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0d1117 0%, #0d1f2f 50%, #0a0e1a 100%)'
        }}
      >
        {/* Background grid decoration */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(49,152,220,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(49,152,220,1) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px'
          }}
        />
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
          {/* Left: Title */}
          <div className="space-y-3 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 font-mono text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              FisisCAD Kernel v2.4-PRO
            </div>
            <h1 className="text-3xl font-bold tracking-tight leading-tight">
              Bem-vindo ao{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                FisisCAD
              </span>
            </h1>
            <p className="text-sm text-slate-400 font-mono leading-relaxed">
              Plataforma web de Modelagem 3D · FEA · CFD · Simulação Física em tempo real.
              Compatível com nuvem Firebase, exportação .cad, Python/Jupyter e relatórios técnicos.
            </p>
          </div>

          {/* Right: Primary Actions (AutoCAD Start Screen Style - Requisito 10) */}
          <div className="flex flex-col gap-2 min-w-[240px]">
            {/* Novo projeto */}
            <button
              onClick={createNewProject}
              className="group flex items-center gap-3 px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 active:scale-[0.98]"
            >
              <FolderPlus className="w-5 h-5 shrink-0" />
              <div className="text-left">
                <div className="text-sm">Novo Projeto</div>
                <div className="text-[10px] font-normal opacity-70">Inicia o Esboço 2D</div>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto opacity-60 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Projetos na Nuvem Firebase (Requisitos 9 e 10) */}
            <button
              onClick={() => setCloudModalOpen(true)}
              className="group flex items-center gap-3 px-5 py-3 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold rounded-xl transition-all active:scale-[0.98]"
            >
              <Cloud className="w-4 h-4 shrink-0 text-cyan-400 animate-pulse" />
              <div className="text-left">
                <div className="text-sm">Projetos na Nuvem</div>
                <div className="text-[10px] font-normal opacity-70">Salvar / Abrir do Firebase</div>
              </div>
            </button>

            {/* Abrir arquivo local */}
            <button
              onClick={openFileDialog}
              className="group flex items-center gap-3 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 font-bold rounded-xl transition-all active:scale-[0.98]"
            >
              <FolderOpen className="w-4 h-4 shrink-0 text-slate-400" />
              <div className="text-left">
                <div className="text-sm">Abrir Arquivo Local</div>
                <div className="text-[10px] font-normal opacity-50">.cad / .json</div>
              </div>
            </button>

            {/* Assistente IA */}
            <button
              onClick={() => setAiModalOpen(true)}
              className="group flex items-center gap-3 px-5 py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-purple-300 font-bold rounded-xl transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 shrink-0 text-purple-400 animate-pulse" />
              <div className="text-left">
                <div className="text-sm">Assistente IA</div>
                <div className="text-[10px] font-normal opacity-60">Gerar por croquis / PDF</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-8">
        {/* ── Templates ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" /> Templates de Inicialização
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Filtrar templates..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 w-44"
                />
              </div>
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white/10' : 'hover:bg-white/5'} text-slate-400`}>
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white/10' : 'hover:bg-white/5'} text-slate-400`}>
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4' : 'space-y-2'}>
            {filteredTemplates.map(tmpl => {
              const Icon = tmpl.icon;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => { addLog(`Template '${tmpl.title}' carregado.`); setActiveView(tmpl.view); }}
                  className={`group cursor-pointer border border-white/10 hover:border-blue-500/40 bg-gradient-to-b ${tmpl.bgGlow} to-transparent hover:to-blue-500/5 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/5 ${viewMode === 'list' ? 'flex items-center gap-4 px-4 py-3' : 'p-5 flex flex-col justify-between'}`}
                >
                  <div className={`flex ${viewMode === 'list' ? 'items-center gap-3 flex-1' : 'flex-col gap-3'}`}>
                    <div className={`${viewMode === 'list' ? 'w-9 h-9' : 'w-10 h-10 mb-1'} rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${tmpl.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono ${tmpl.tagColor}`}>{tmpl.tag}</span>
                        {viewMode === 'list' && <span className="text-xs text-slate-500">{tmpl.category}</span>}
                      </div>
                      <h3 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors">{tmpl.title}</h3>
                      {viewMode === 'grid' && <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-mono">{tmpl.desc}</p>}
                    </div>
                  </div>
                  <div className={`${viewMode === 'list' ? '' : 'mt-4 pt-3 border-t border-white/8'} flex items-center justify-between text-[10px] font-mono`}>
                    <span className="text-slate-600">{tmpl.meta}</span>
                    <span className="flex items-center gap-1 text-blue-400 group-hover:translate-x-1 transition-transform">
                      Carregar <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Recent Files ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" /> Projetos no Espaço de Trabalho
            </h2>
            <button
              onClick={() => setCloudModalOpen(true)}
              className="px-3 py-1 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
            >
              <Cloud className="w-3.5 h-3.5" /> Acessar Projetos na Nuvem Firebase
            </button>
          </div>

          <div className="bg-[#111827]/60 border border-white/10 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 px-4 py-2.5 bg-white/5 border-b border-white/8 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
              <span className="col-span-4">Arquivo .cad</span>
              <span className="col-span-3">Material</span>
              <span className="col-span-2">Status</span>
              <span className="col-span-1">FoS</span>
              <span className="col-span-2 text-right">Ação</span>
            </div>

            {RECENT_FILES.map((file, i) => (
              <div
                key={i}
                className="grid grid-cols-12 px-4 py-3 items-center hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-xs font-mono"
              >
                <div className="col-span-4 flex items-center gap-2 font-bold text-slate-200">
                  <FileCode className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="truncate">{file.name}</span>
                </div>
                <span className="col-span-3 text-slate-500">{file.material}</span>
                <span className={`col-span-2 flex items-center gap-1.5 font-semibold ${file.status === 'Convergido' ? 'text-green-400' : 'text-amber-400'}`}>
                  {file.status === 'Convergido'
                    ? <CheckCircle className="w-3.5 h-3.5" />
                    : <Cpu className="w-3.5 h-3.5 animate-spin" />
                  }
                  {file.status}
                </span>
                <span className="col-span-1 text-slate-400">{file.fos}</span>
                <div className="col-span-2 flex justify-end gap-1.5">
                  <button
                    onClick={() => { addLog(`Arquivo '${file.name}' aberto.`); setActiveView('cad_inventor'); }}
                    className="px-2 py-1 bg-white/5 hover:bg-blue-500/20 hover:text-blue-300 text-slate-400 rounded border border-white/10 hover:border-blue-500/30 transition-all"
                  >
                    Abrir
                  </button>
                  <button
                    onClick={saveProjectCAD}
                    className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-400 rounded border border-white/10 transition-all"
                    title="Exportar .cad"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
