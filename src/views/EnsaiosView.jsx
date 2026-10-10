import React, { useState } from 'react';
import { useCAD } from '../context/CADContext';
import { 
  Activity, Cpu, ShieldCheck, Flame, Waves, RotateCcw, 
  ArrowRight, CheckCircle2 
} from 'lucide-react';

export const EnsaiosView = () => {
  const { setActiveView, addLog, project, setProject } = useCAD();
  const [selectedEnsaio, setSelectedEnsaio] = useState('fea_static');

  const ensaios = [
    {
      id: 'fea_static',
      title: 'Estática Estrutural (FEA)',
      icon: Activity,
      desc: 'Cálculo de distribuição de Tensão de von Mises, deformação elástica/plástica e Fator de Segurança (FoS).',
      solver: 'CalculiX 2.21 + FEA Wasm',
      timeEst: '~0.4s (Local Wasm)'
    },
    {
      id: 'cfd_fluid',
      title: 'Dinâmica dos Fluidos Computacional (CFD)',
      icon: Waves,
      desc: 'Simulação de escoamento laminar/turbulento, cálculo de força de arrasto ($C_d$) e sustentação ($C_l$).',
      solver: 'OpenFOAM v2312 Wasm Engine',
      timeEst: '~1.2s (Local Wasm)'
    },
    {
      id: 'thermal_transfer',
      title: 'Transferência Térmica & Gradiente',
      icon: Flame,
      desc: 'Condução e convecção em estado estacionário com dissipação de calor em aletas metálicas.',
      solver: 'Thermal Solver Kernel v2',
      timeEst: '~0.2s (Local Wasm)'
    },
    {
      id: 'rigid_body',
      title: 'Cinemática & Colisão Rígida',
      icon: RotateCcw,
      desc: 'Mecânica dinâmica de múltiplos corpos (multibody), juntas mecânicas e vetores de reação nodal.',
      solver: 'Rapier3D Rust/Wasm Engine',
      timeEst: '~60 FPS em Tempo Real'
    }
  ];

  const applyEnsaio = (eId) => {
    setSelectedEnsaio(eId);
    const sel = ensaios.find(e => e.id === eId);
    setProject(prev => ({
      ...prev,
      simulation: {
        ...prev.simulation,
        solver: sel.solver
      }
    }));
    addLog(`Estudo físico alterado para: ${sel.title}`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface-container-lowest font-mono text-xs select-none">
      <div className="border-b border-outline/20 pb-4">
        <h1 className="text-xl font-bold text-on-surface font-sans flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" /> Seleção de Ensaios Físicos e Motor Solver
        </h1>
        <p className="text-outline text-xs mt-1">
          Configure a hipótese física do estudo para ser resolvida localmente no navegador (WebAssembly) ou em cluster GPU Cloud.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ensaios.map(e => {
          const Icon = e.icon;
          const isSelected = selectedEnsaio === e.id;
          return (
            <div 
              key={e.id}
              onClick={() => applyEnsaio(e.id)}
              className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected 
                  ? 'bg-surface-container border-primary shadow-xl ring-1 ring-primary' 
                  : 'bg-surface-container/60 border-outline/20 hover:border-outline/50 hover:bg-surface-container'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-on-surface font-bold text-sm">
                    <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shadow">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{e.title}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-secondary" />}
                </div>
                <p className="text-outline leading-relaxed">{e.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-outline/20 flex items-center justify-between text-[11px]">
                <span className="text-on-surface font-semibold bg-surface-container-high px-2 py-0.5 rounded">{e.solver}</span>
                <span className="text-secondary font-bold">{e.timeEst}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Solver Configurations */}
      <div className="p-5 bg-surface-container rounded-xl border border-outline/20 space-y-4">
        <h3 className="font-bold text-sm text-on-surface flex items-center gap-2 font-sans">
          <Cpu className="w-4 h-4 text-secondary" /> Configuração Fina do Solver
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-outline block mb-1">Tolerância de Convergência:</label>
            <input type="text" value="1.0e-6" readOnly className="w-full bg-surface-container-lowest border border-outline/30 px-3 py-1.5 rounded text-on-surface font-bold" />
          </div>
          <div>
            <label className="text-outline block mb-1">Passo de Tempo ($\Delta t$):</label>
            <input type="text" value="0.001 s" readOnly className="w-full bg-surface-container-lowest border border-outline/30 px-3 py-1.5 rounded text-on-surface font-bold" />
          </div>
          <div>
            <label className="text-outline block mb-1">Dispositivo de Cálculo:</label>
            <select className="w-full bg-surface-container-lowest border border-outline/30 px-3 py-1.5 rounded text-secondary font-bold">
              <option>WebAssembly (Local CPU/GPU Wasm)</option>
              <option>Cluster GPU Cloud (A100 Tensor Core)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setActiveView('materiais')}
          className="px-6 py-3 bg-primary-container hover:bg-secondary-container text-on-primary-container font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg"
        >
          Avançar para Estúdio de Materiais <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
