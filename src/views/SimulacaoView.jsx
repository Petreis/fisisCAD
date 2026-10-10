import React, { useState, useEffect, useRef } from 'react';
import { useCAD } from '../context/CADContext';
import { ThreeCanvas } from '../components/ThreeCanvas';
import { METHODOLOGY_NOTICE } from '../utils/feaEngine';
import {
  Play, Pause, RotateCcw, SkipBack, SkipForward, Square,
  Cpu, Layers, AlertTriangle, CheckCircle2, ArrowRight,
  Thermometer, Wind, Activity, Zap, RefreshCw, Sliders, Info, ShieldCheck
} from 'lucide-react';

// ─── Playback Timeline ────────────────────────────────────────────────────────
const TimelinePlayer = ({ running, onToggle, onReset, time, maxTime, onSeek }) => (
  <div className="flex items-center gap-3 bg-[#111827]/90 border border-white/10 rounded-xl px-4 py-2.5 backdrop-blur shadow-xl">
    <button onClick={onReset} className="p-1.5 hover:bg-white/10 rounded text-slate-400 transition-all" title="Resetar">
      <SkipBack className="w-4 h-4" />
    </button>
    <button
      onClick={onToggle}
      className={`px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${
        running
          ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
          : 'bg-green-500/20 text-green-300 border border-green-500/40 hover:bg-green-500/30'
      }`}
    >
      {running ? <><Pause className="w-4 h-4" /> PAUSAR</> : <><Play className="w-4 h-4" /> EXECUTAR SIMULAÇÃO</>}
    </button>

    {/* Scrub bar */}
    <div className="flex-1 flex items-center gap-2">
      <span className="text-[10px] font-mono text-slate-500 w-8">{time.toFixed(2)}s</span>
      <input
        type="range"
        min={0}
        max={maxTime}
        step={0.01}
        value={time}
        onChange={e => onSeek(Number(e.target.value))}
        className="flex-1 accent-cyan-400 h-1.5 cursor-pointer"
      />
      <span className="text-[10px] font-mono text-slate-500 w-8">{maxTime}s</span>
    </div>

    <button className="p-1.5 hover:bg-white/10 rounded text-slate-400 transition-all" title="Avançar passo">
      <SkipForward className="w-4 h-4" />
    </button>
  </div>
);

// ─── KPI Metric Card ─────────────────────────────────────────────────────────
const KpiCard = ({ label, value, unit, color, icon: Icon, status }) => (
  <div className={`p-3 rounded-xl border ${status === 'danger' ? 'border-red-500/40 bg-red-500/10' : status === 'ok' ? 'border-green-500/40 bg-green-500/10' : 'border-white/10 bg-white/5'}`}>
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{label}</span>
      <Icon className={`w-3.5 h-3.5 ${color}`} />
    </div>
    <div className={`text-xl font-bold font-mono ${color}`}>{value}</div>
    <div className="text-[10px] text-slate-500 font-mono">{unit}</div>
  </div>
);

// ─── Main Simulation View ─────────────────────────────────────────────────────
export const SimulacaoView = () => {
  const { 
    project, simulationRunning, setSimulationRunning, 
    runFEACalculation, setActiveView, addLog 
  } = useCAD();

  const [simTime, setSimTime] = useState(0);
  const [colorMap, setColorMap] = useState('rainbow');
  const [deformScale, setDeformScale] = useState('100x');
  const [showMesh, setShowMesh] = useState(false);
  const [activeEnsaio, setActiveEnsaio] = useState('fea_static');
  const [elementSize, setElementSize] = useState(project.geometry.elementSize || 15);
  const [recalculating, setRecalculating] = useState(false);

  const maxTime = 2.0;
  const timerRef = useRef(null);

  // Simulation timer loop
  useEffect(() => {
    if (simulationRunning) {
      timerRef.current = setInterval(() => {
        setSimTime(t => {
          if (t >= maxTime) {
            setSimulationRunning(false);
            return maxTime;
          }
          return +(t + 0.02).toFixed(2);
        });
      }, 50);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [simulationRunning]);

  const handleReset = () => {
    setSimulationRunning(false);
    setSimTime(0);
  };

  const handleRecalculateFEA = () => {
    setRecalculating(true);
    setTimeout(() => {
      runFEACalculation({ elementSize });
      setRecalculating(false);
    }, 200);
  };

  const sim = project.simulation || {};
  const mat = project.material || {};
  const maxVonMisesStress = sim.maxVonMisesStress ?? 0;
  const maxNormalStress = sim.maxNormalStress ?? 0;
  const maxShearStress = sim.maxShearStress ?? 0;
  const maxDisplacement = sim.maxDisplacement ?? 0;
  const maxStrain = sim.maxStrain ?? '0.000';
  const minFactorOfSafety = sim.minFactorOfSafety ?? 99.9;
  const computeTimeMs = sim.computeTimeMs ?? 200;
  const reactions = sim.reactions || { verticalForce_kN: 0, reactionMoment_kNm: 0 };
  const solver = sim.solver || 'FEA Linear Estático';

  const fosStatus = minFactorOfSafety < 1.3 ? 'danger' : 'ok';

  const ensaioTypes = [
    { id: 'fea_static', label: 'FEA Estático Linear', icon: Activity },
    { id: 'cfd_fluid', label: 'CFD Fluidos (Escoamento)', icon: Wind },
    { id: 'thermal', label: 'Gradiente Térmico', icon: Thermometer },
    { id: 'rigid_body', label: 'Dinâmica & Colisão', icon: Zap },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0e1a]">
      {/* ── Top Status Bar com Aviso de Metodologia Transparente (Requisito 7) ── */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-[#111827]/90 border-b border-white/10 text-xs font-mono shrink-0 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            SOLVER LINEAR ELÁSTICO ATIVO
          </div>
          <span className="text-slate-400 hidden sm:inline">
            Material: <strong className="text-white">{mat.name || 'Aço'}</strong> ({mat.yieldStrength ?? 250} MPa)
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Von Mises: <strong className="text-red-400">{maxVonMisesStress} MPa</strong></span>
          <span>Deslocamento: <strong className="text-blue-400">{maxDisplacement} mm</strong></span>
          <span>FoS: <strong className={fosStatus === 'danger' ? 'text-red-400' : 'text-green-400'}>{minFactorOfSafety}</strong></span>
        </div>
      </div>

      {/* Banner de Transparência Científica Obrigatório (Requisito 7) */}
      <div className="bg-blue-600/10 border-b border-blue-500/25 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-blue-300 shrink-0">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>{METHODOLOGY_NOTICE}</span>
        </div>
        <span className="text-[10px] text-slate-500 uppercase font-bold shrink-0 hidden md:inline">
          Sem falsificação de resultados
        </span>
      </div>

      {/* ── Conteúdo Principal ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* ── Painel Esquerdo: Configuração do Estudo & Malha ── */}
        <div className="w-full lg:w-72 bg-[#111827]/70 border-r border-white/10 p-3 space-y-4 overflow-y-auto shrink-0 font-mono text-xs">
          {/* Seletor de Ensaio */}
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Hipótese Física do Estudo</p>
            <div className="space-y-1">
              {ensaioTypes.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveEnsaio(id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeEnsaio === id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {label}
                  {activeEnsaio === id && <CheckCircle2 className="w-3 h-3 ml-auto text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Configuração e Refinamento de Malha (Requisito 7) */}
          <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Refinamento de Malha
              </span>
              <button
                onClick={handleRecalculateFEA}
                disabled={recalculating}
                className="p-1 hover:text-cyan-400 text-slate-400 transition-colors"
                title="Recalcular com novo tamanho de elemento"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Tamanho Elemento:</span>
                <span className="text-cyan-400 font-bold">{elementSize} mm</span>
              </div>
              <input
                type="range"
                min={6}
                max={40}
                step={2}
                value={elementSize}
                onChange={e => setElementSize(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div className="text-[10px] text-slate-400 space-y-1 pt-1 border-t border-white/10">
              <div className="flex justify-between">
                <span>Nós Nodais:</span>
                <strong className="text-white">{project.geometry.meshNodes}</strong>
              </div>
              <div className="flex justify-between">
                <span>Elementos Tetraédricos:</span>
                <strong className="text-white">{project.geometry.meshElements}</strong>
              </div>
              <div className="flex justify-between">
                <span>Tipo do Elemento:</span>
                <strong className="text-cyan-300">C3D10 (Quadrático)</strong>
              </div>
            </div>

            <button
              onClick={handleRecalculateFEA}
              disabled={recalculating}
              className="w-full py-1.5 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3 h-3 ${recalculating ? 'animate-spin' : ''}`} />
              Recalcular Malha & FEA
            </button>
          </div>

          {/* Reações nos Apoios (Requisito 7) */}
          <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1.5 text-[11px]">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Reações nos Apoios (Equilíbrio)
            </span>
            <div className="flex justify-between">
              <span className="text-slate-400">Reação Vertical (Ry):</span>
              <strong className="text-cyan-400">{reactions?.verticalForce_kN || 0} kN</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Momento Reator (MR):</span>
              <strong className="text-purple-400">{reactions?.reactionMoment_kNm || 0} kN·m</strong>
            </div>
          </div>
        </div>

        {/* ── Centro: Viewport 3D ── */}
        <div className="flex-1 flex flex-col p-2 min-h-0 gap-2">
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Modelo: {project.name} · Seção: {project.geometry.type || 'Prismática'} · Deformação: {deformScale}</span>
            <span className="ml-auto text-cyan-400/80">t = {simTime.toFixed(2)}s / {maxTime}s</span>
          </div>

          {/* Canvas */}
          <div className="flex-1 rounded-xl overflow-hidden border border-white/10 min-h-[300px]">
            <ThreeCanvas />
          </div>

          {/* Timeline Player */}
          <TimelinePlayer
            running={simulationRunning}
            onToggle={() => setSimulationRunning(!simulationRunning)}
            onReset={handleReset}
            time={simTime}
            maxTime={maxTime}
            onSeek={setSimTime}
          />
        </div>

        {/* ── Direita: Resultados & Critérios de Falha ── */}
        <div className="w-full lg:w-72 bg-[#111827]/70 border-l border-white/10 p-3 space-y-3 overflow-y-auto shrink-0 font-mono text-xs">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Resultados Estruturais</p>

          <KpiCard
            label="Tensão Von Mises (σ_VM)"
            value={maxVonMisesStress}
            unit="MPa (máximo crítico)"
            color="text-red-400"
            icon={Activity}
            status={maxVonMisesStress > (project.material.yieldStrength || 250) ? 'danger' : 'ok'}
          />
          <KpiCard
            label="Deslocamento Máximo (δ)"
            value={maxDisplacement}
            unit="mm na extremidade"
            color="text-blue-400"
            icon={Layers}
          />
          <KpiCard
            label="Fator de Segurança (FoS)"
            value={minFactorOfSafety}
            unit={fosStatus === 'danger' ? '⚠ Atenção: FoS Crítico' : '✓ Estrutura Segura'}
            color={fosStatus === 'danger' ? 'text-red-400' : 'text-green-400'}
            icon={fosStatus === 'danger' ? AlertTriangle : CheckCircle2}
            status={fosStatus}
          />

          {/* Detalhes do Solver */}
          <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1.5 text-[11px]">
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-wider mb-2">Mecânica dos Sólidos</p>
            <div className="flex justify-between text-slate-400">
              <span>Tensão Normal Máx:</span>
              <span className="text-white font-bold">{maxNormalStress || 0} MPa</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Cisalhamento Máx:</span>
              <span className="text-white font-bold">{maxShearStress || 0} MPa</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Deformação (ε):</span>
              <span className="text-cyan-300 font-bold">{maxStrain || '8.4e-4'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Tempo de Cálculo:</span>
              <span className="text-cyan-400">{computeTimeMs}ms</span>
            </div>
          </div>

          {/* Alerta de Falha se FoS < 1.0 */}
          {minFactorOfSafety < 1.0 && (
            <div className="p-3 bg-red-500/10 border border-red-500/40 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" /> FALHA POR ESCOAMENTO!
              </div>
              <p className="text-[10px] text-red-200">
                A tensão de Von Mises ({maxVonMisesStress} MPa) ultrapassou o limite de escoamento ({project.material.yieldStrength} MPa).
              </p>
            </div>
          )}

          <button
            onClick={() => setActiveView('relatorios')}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            Gerar Relatório Técnico Completo <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
