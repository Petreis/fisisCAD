import React, { useRef, useState } from 'react';
import { useCAD } from '../context/CADContext';
import { ShareProjectModal } from './ShareProjectModal';
import { CloudProjectsModal } from './CloudProjectsModal';
import { logoutFirebase } from '../firebase/config';
import { 
  Box, Save, FolderOpen, Sparkles, Monitor, Smartphone, 
  Share2, LogOut, Cloud, Compass 
} from 'lucide-react';

export const Header = () => {
  const { 
    activeView, setActiveView, 
    deviceMode, setDeviceMode, 
    project, 
    saveProjectCAD, loadProjectCAD, 
    currentUser,
    workingPlane, setWorkingPlane,
    cloudModalOpen, setCloudModalOpen,
    setAiModalOpen, addLog 
  } = useCAD();

  const fileInputRef = useRef(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      loadProjectCAD(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleLogout = async () => {
    if (confirm('Deseja realmente sair da sua conta?')) {
      await logoutFirebase();
      addLog('Sessão encerrada pelo usuário.');
      window.location.reload();
    }
  };

  // Abas de navegação otimizadas e responsivas com labels concisos para nunca transbordar a tela
  const navItems = [
    { id: 'hub', label: 'Hub', fullLabel: '1. Início / Hub' },
    { id: 'cad_inventor', label: 'CAD', fullLabel: '2. CAD Inventor Sólido' },
    { id: 'sketch_model', label: 'Sketch', fullLabel: '3. Modelagem 2D/3D' },
    { id: 'ensaios', label: 'Ensaios', fullLabel: '4. Ensaios Físicos' },
    { id: 'materiais', label: 'Materiais', fullLabel: '5. Estúdio de Materiais' },
    { id: 'simulacao', label: 'FEA', fullLabel: '6. Simulação FEA' },
    { id: 'relatorios', label: 'Relatórios', fullLabel: '7. Relatórios & Analytics' },
  ];

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Eng. Carlos';
  const photoUrl = currentUser?.photoURL;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-[#0d1117]/95 backdrop-blur-xl border-b border-white/10 px-2 sm:px-4 flex items-center justify-between gap-1 sm:gap-2 w-full max-w-full overflow-hidden select-none">
        {/* Brand & Arquivo Ativo */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
          <div 
            onClick={() => setActiveView('hub')}
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400 shadow">
              <Box className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-white font-sans flex items-center gap-1">
              FisisCAD <span className="text-[10px] font-mono font-bold px-1 py-0.5 rounded bg-blue-500/10 text-cyan-400 border border-cyan-500/30">PRO</span>
            </span>
          </div>

          {/* Nome do Arquivo .cad & Ações Rápidas */}
          <div className="hidden md:flex items-center gap-1 font-mono text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-lg border border-white/10 shrink-0">
            <span className="text-white font-semibold max-w-[70px] lg:max-w-[100px] xl:max-w-[130px] truncate" title={project.name}>
              {project.name}
            </span>
            
            <button 
              onClick={saveProjectCAD}
              className="p-1 hover:text-blue-400 hover:bg-white/10 rounded transition-colors"
              title="Salvar Projeto Local (.cad)"
            >
              <Save className="w-3.5 h-3.5" />
            </button>

            <button 
              onClick={() => setCloudModalOpen(true)}
              className="px-1.5 py-0.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 font-bold rounded flex items-center gap-1 border border-blue-500/30 transition-all"
              title="Salvar / Abrir Projetos na Nuvem Firebase"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[11px]">Nuvem</span>
            </button>

            <input 
              type="file" 
              ref={fileInputRef} 
              accept=".cad,application/json" 
              onChange={handleFileImport} 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-1 hover:text-cyan-400 hover:bg-white/10 rounded transition-colors"
              title="Importar Arquivo Local (.cad)"
            >
              <FolderOpen className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShareModalOpen(true)}
              className="p-1 hover:text-purple-400 hover:bg-white/10 rounded transition-colors"
              title="Compartilhar Projeto"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Seletor de Plano de Trabalho (XY, XZ, YZ) - Apenas em telas ultra largas */}
        <div className="hidden 2xl:flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg font-mono text-xs shrink-0">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-500 text-[10px] mr-1">PLANO:</span>
          {['XY', 'XZ', 'YZ'].map(pl => (
            <button
              key={pl}
              onClick={() => { setWorkingPlane(pl); addLog(`Plano de trabalho ativo alterado para ${pl}.`); }}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                workingPlane === pl 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {pl}
            </button>
          ))}
        </div>

        {/* Abas de Navegação Centrais - Totalmente responsivas e protegidas contra transbordamento */}
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 font-mono text-xs overflow-x-auto max-w-full shrink min-w-0 py-1 scrollbar-none justify-center">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              title={item.fullLabel}
              className={`px-2 py-1 rounded-md transition-all font-medium whitespace-nowrap shrink-0 text-[11px] lg:text-xs ${
                activeView === item.id 
                  ? 'bg-blue-600/30 text-blue-300 font-bold border border-blue-500/40 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Controles do Canto Superior Direito: Fixos e Protegidos contra Overflow */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 font-mono text-xs ml-auto pr-1">
          {/* Seletor de Modo Desktop/Mobile */}
          <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10 shrink-0">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`p-1 sm:p-1.5 rounded text-xs flex items-center gap-1 transition-all ${
                deviceMode === 'desktop' ? 'bg-white/15 text-cyan-400 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Modo Desktop"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-1 sm:p-1.5 rounded text-xs flex items-center gap-1 transition-all ${
                deviceMode === 'mobile' ? 'bg-white/15 text-cyan-400 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Modo Mobile"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Botão Assistente IA CAD */}
          <button
            onClick={() => setAiModalOpen(true)}
            className="px-2 py-1 sm:px-2.5 sm:py-1.5 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-purple-300 font-bold text-xs rounded-lg flex items-center gap-1 sm:gap-1.5 shadow hover:opacity-95 transition-all shrink-0"
            title="Assistente IA de Engenharia CAD"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="hidden sm:inline text-xs">IA CAD</span>
          </button>

          {/* Perfil do Usuário Autenticado */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-white/5 px-1.5 sm:px-2 py-1 rounded-lg border border-white/10 shrink-0">
            {photoUrl ? (
              <img src={photoUrl} alt="Avatar" className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-cyan-400/40" />
            ) : (
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600/40 border border-blue-400/30 flex items-center justify-center text-cyan-300 font-bold text-[10px] sm:text-[11px]">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-slate-200 font-semibold truncate max-w-[70px] lg:max-w-[100px] hidden xl:inline text-xs" title={displayName}>
              {displayName}
            </span>
            <button 
              onClick={handleLogout} 
              className="text-slate-400 hover:text-red-400 p-0.5 transition-colors" 
              title="Encerrar Sessão (Logout)"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Share Project Modal */}
      <ShareProjectModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} />

      {/* Cloud Projects Modal */}
      <CloudProjectsModal isOpen={cloudModalOpen} onClose={() => setCloudModalOpen(false)} />
    </>
  );
};
