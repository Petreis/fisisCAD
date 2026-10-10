import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCAD } from '../context/CADContext';
import { ThreeCanvas } from '../components/ThreeCanvas';
import {
  findSmartSnapPoint, validateClosedProfile, dist2D
} from '../utils/cadGeometry';
import {
  Minus, Square, Circle, MousePointer, Hash, ArrowUpRight,
  Anchor, ArrowRight, Trash2, RotateCcw, AlertTriangle, CheckCircle2,
  Layers, Move, CornerUpRight, Sliders, ShieldAlert, Sparkles, Compass
} from 'lucide-react';

// ─── 2D Sketch Canvas com Validação Topológica e Snapping ─────────────────────
const SketchCanvas2D = ({ 
  tool, 
  tolerance, 
  onProfileStatusChange, 
  workingPlane 
}) => {
  const canvasRef = useRef(null);
  const { project, setProject, addLog } = useCAD();

  const [lines, setLines] = useState(
    project.sketchLines || [
      // Perfil I inicial ou Retângulo de demonstração conectado
      { id: 1, x1: 250, y1: 150, x2: 550, y2: 150 },
      { id: 2, x1: 550, y1: 150, x2: 550, y2: 350 },
      { id: 3, x1: 550, y1: 350, x2: 250, y2: 350 },
      { id: 4, x1: 250, y1: 350, x2: 250, y2: 150 },
    ]
  );

  const [currentLine, setCurrentLine] = useState(null);
  const [activeSnap, setActiveSnap] = useState(null);
  const [validation, setValidation] = useState({ isValid: false, message: '', orderedPoints: [], openEnds: [] });

  const GRID = 20;

  // Validação sempre que as linhas mudarem
  useEffect(() => {
    const val = validateClosedProfile(lines, tolerance);
    setValidation(val);
    if (onProfileStatusChange) {
      onProfileStatusChange(val, lines);
    }
    // Salvar linhas no projeto para persistência
    setProject(prev => ({ ...prev, sketchLines: lines }));
  }, [lines, tolerance]);

  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    return findSmartSnapPoint(
      { x: rawX, y: rawY },
      lines,
      {
        vertexTolerance: tolerance * 1.8,
        midpointTolerance: tolerance * 1.4,
        grid: GRID,
        origin: { x: canvas.width / 2, y: canvas.height / 2 }
      }
    );
  };

  const drawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // 1. Fundo do viewport 2D estilo CAD Inventor
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, w, h);

    // 2. Grade de Trabalho (Grid)
    ctx.strokeStyle = 'rgba(49, 152, 220, 0.1)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= w; x += GRID) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y <= h; y += GRID) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // 3. Eixos Cartesinos do Plano de Trabalho
    const ox = w / 2;
    const oy = h / 2;
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)'; // Eixo X (Vermelho)
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(w, oy); ctx.stroke();

    ctx.strokeStyle = 'rgba(34, 197, 94, 0.45)'; // Eixo Y (Verde)
    ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox, h); ctx.stroke();

    // Rótulo da Origem
    ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
    ctx.font = '10px monospace';
    ctx.fillText(`Origem (0, 0) [Plano ${workingPlane}]`, ox + 6, oy - 6);

    // 4. Preenchimento de Destaque da Região Fechada (Requisito 4)
    if (validation.isValid && validation.orderedPoints.length >= 3) {
      ctx.beginPath();
      ctx.moveTo(validation.orderedPoints[0].x, validation.orderedPoints[0].y);
      for (let i = 1; i < validation.orderedPoints.length; i++) {
        ctx.lineTo(validation.orderedPoints[i].x, validation.orderedPoints[i].y);
      }
      ctx.closePath();
      // Preenchimento verde translúcido suave
      ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
      ctx.fill();

      // Contorno de destaque verde fluorescente
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // 5. Desenhar Linhas Existentes
    lines.forEach((ln) => {
      ctx.beginPath();
      ctx.moveTo(ln.x1, ln.y1);
      ctx.lineTo(ln.x2, ln.y2);

      if (validation.isValid) {
        ctx.strokeStyle = '#38bdf8'; // Ciano neon se válido
      } else {
        ctx.strokeStyle = '#60a5fa'; // Azul padrão
      }
      ctx.lineWidth = 2;
      ctx.stroke();

      // Vértices / Extremidades
      [{ x: ln.x1, y: ln.y1 }, { x: ln.x2, y: ln.y2 }].forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Cota / Comprimento do segmento
      const mx = (ln.x1 + ln.x2) / 2;
      const my = (ln.y1 + ln.y2) / 2;
      const len = Math.round(dist2D({ x: ln.x1, y: ln.y1 }, { x: ln.x2, y: ln.y2 }));
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(`${len} mm`, mx + 5, my - 5);
    });

    // 6. Alerta Visual nos Pontos Soltos / Desconectados (Se perfil aberto)
    if (!validation.isValid && validation.openEnds && validation.openEnds.length > 0) {
      validation.openEnds.forEach((pt) => {
        // Círculo vermelho pulsante no vértice aberto
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.fill();

        // Rótulo de ponto aberto
        ctx.fillStyle = '#f87171';
        ctx.font = '10px monospace';
        ctx.fillText('Aberto', pt.x + 10, pt.y - 4);
      });
    }

    // 7. Linha em Criação (Preview)
    if (currentLine) {
      ctx.beginPath();
      ctx.moveTo(currentLine.x1, currentLine.y1);
      ctx.lineTo(currentLine.x2, currentLine.y2);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      const tempLen = Math.round(dist2D(
        { x: currentLine.x1, y: currentLine.y1 },
        { x: currentLine.x2, y: currentLine.y2 }
      ));
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(
        `${tempLen} mm`, 
        (currentLine.x1 + currentLine.x2) / 2 + 8, 
        (currentLine.y1 + currentLine.y2) / 2 - 8
      );
    }

    // 8. Indicador Visual Preciso do Snap Point (Requisito 3)
    if (activeSnap) {
      let snapColor = '#38bdf8';
      if (activeSnap.snapType === 'vertex') snapColor = '#22c55e'; // Verde para Vértice
      else if (activeSnap.snapType === 'midpoint') snapColor = '#eab308'; // Amarelo para Ponto Médio
      else if (activeSnap.snapType === 'intersection') snapColor = '#06b6d4'; // Ciano para Interseção
      else if (activeSnap.snapType === 'center') snapColor = '#a855f7'; // Roxo para Centro
      else if (activeSnap.snapType === 'axis') snapColor = '#f43f5e'; // Rosa/Vermelho para Eixo

      // Crosshair
      ctx.beginPath();
      ctx.arc(activeSnap.x, activeSnap.y, 7, 0, Math.PI * 2);
      ctx.strokeStyle = snapColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(activeSnap.x - 12, activeSnap.y);
      ctx.lineTo(activeSnap.x + 12, activeSnap.y);
      ctx.moveTo(activeSnap.x, activeSnap.y - 12);
      ctx.lineTo(activeSnap.x, activeSnap.y + 12);
      ctx.strokeStyle = snapColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Badge com Nome do Snap
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(activeSnap.x + 10, activeSnap.y + 10, 85, 18);
      ctx.strokeStyle = snapColor;
      ctx.strokeRect(activeSnap.x + 10, activeSnap.y + 10, 85, 18);

      ctx.fillStyle = snapColor;
      ctx.font = 'bold 10px monospace';
      ctx.fillText(activeSnap.label, activeSnap.x + 14, activeSnap.y + 23);
    }
  }, [lines, currentLine, activeSnap, validation, workingPlane, tolerance]);

  useEffect(() => { drawAll(); }, [drawAll]);

  // Interação do Mouse
  const handleMouseDown = (e) => {
    if (tool !== 'line') return;
    const snap = getCanvasPos(e);
    setCurrentLine({ x1: snap.x, y1: snap.y, x2: snap.x, y2: snap.y });
  };

  const handleMouseMove = (e) => {
    const snap = getCanvasPos(e);
    setActiveSnap(snap);
    if (currentLine) {
      setCurrentLine(prev => ({ ...prev, x2: snap.x, y2: snap.y }));
    }
  };

  const handleMouseUp = (e) => {
    if (!currentLine || tool !== 'line') return;
    const snap = getCanvasPos(e);
    const d = dist2D({ x: currentLine.x1, y: currentLine.y1 }, { x: snap.x, y: snap.y });
    
    // Evita criar linhas de comprimento zero
    if (d > 5) {
      const newLine = { 
        id: Date.now(), 
        x1: currentLine.x1, 
        y1: currentLine.y1, 
        x2: snap.x, 
        y2: snap.y 
      };
      setLines(prev => [...prev, newLine]);
      addLog(`Segmento de linha adicionado (${Math.round(d)}mm).`);
    }
    setCurrentLine(null);
  };

  const handleAddRectangle = () => {
    const rect = [
      { id: Date.now() + 1, x1: 200, y1: 150, x2: 600, y2: 150 },
      { id: Date.now() + 2, x1: 600, y1: 150, x2: 600, y2: 350 },
      { id: Date.now() + 3, x1: 600, y1: 350, x2: 200, y2: 350 },
      { id: Date.now() + 4, x1: 200, y1: 350, x2: 200, y2: 150 },
    ];
    setLines(rect);
    addLog('Perfil retangular fechado gerado no plano.');
  };

  const handleAddHexagon = () => {
    const cx = 400, cy = 250, r = 120;
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      pts.push({
        x: Math.round(cx + r * Math.cos(angle)),
        y: Math.round(cy + r * Math.sin(angle))
      });
    }
    const hexLines = [];
    for (let i = 0; i < 6; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % 6];
      hexLines.push({ id: Date.now() + i, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y });
    }
    setLines(hexLines);
    addLog('Perfil hexagonal regular fechado gerado.');
  };

  const clearCanvas = () => {
    setLines([]);
    addLog('Área de croqui limpa.');
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      <canvas
        ref={canvasRef}
        width={900}
        height={540}
        className="w-full h-full rounded-xl cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { setActiveSnap(null); setCurrentLine(null); }}
      />

      {/* Quick Shapes & Clear Buttons - Protegido contra overflow */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 flex-wrap justify-end max-w-[calc(100%-24px)] z-10 pointer-events-auto">
        <button
          onClick={handleAddRectangle}
          className="px-2 py-1 bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 rounded-lg text-xs font-mono font-bold transition-all shadow shrink-0"
          title="Inserir Retângulo Fechado Rápido"
        >
          + Retângulo Fechado
        </button>
        <button
          onClick={handleAddHexagon}
          className="px-2 py-1 bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 rounded-lg text-xs font-mono font-bold transition-all shadow shrink-0"
          title="Inserir Polígono Regular Fechado"
        >
          + Hexágono
        </button>
        {lines.length > 0 && (
          <button
            onClick={clearCanvas}
            className="p-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 rounded-lg transition-all shrink-0"
            title="Limpar todas as linhas"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Snap Indicator & Telemetry */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <div className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border flex items-center gap-2 backdrop-blur-md ${
          validation.isValid 
            ? 'bg-green-500/15 border-green-500/40 text-green-300' 
            : 'bg-red-500/15 border-red-500/40 text-red-300'
        }`}>
          {validation.isValid ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>PERFIL FECHADO VÁLIDO (Área: {validation.area} mm²)</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>PERFIL ABERTO (Extrusão Bloqueada)</span>
            </>
          )}
        </div>
      </div>

      <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400 bg-black/60 px-3 py-1 rounded-lg border border-white/10 backdrop-blur">
        Snap: <span className="text-cyan-400 font-bold">{activeSnap ? activeSnap.label : 'Grid'}</span> · Linhas: <span className="text-white font-bold">{lines.length}</span>
      </div>
    </div>
  );
};

// ─── Visão Principal Sketch & Modelagem ───────────────────────────────────────
export const SketchModelView = () => {
  const { 
    setActiveView, addLog, workingPlane, setWorkingPlane, 
    addCADFeature, project, setProject 
  } = useCAD();

  const [sketchMode, setSketchMode] = useState('line');
  const [is3DMode, setIs3DMode] = useState(false);
  const [extrudeDepth, setExtrudeDepth] = useState(120);
  const [tolerance, setTolerance] = useState(8); // Tolerância geométrica em px
  const [profileValidation, setProfileValidation] = useState({ isValid: false, message: '', orderedPoints: [] });
  const [currentLines, setCurrentLines] = useState([]);

  const tools = [
    { id: 'select', icon: MousePointer, label: 'Selecionar', key: 'S' },
    { id: 'line', icon: Minus, label: 'Linha CAD', key: 'L' },
    { id: 'rect', icon: Square, label: 'Retângulo', key: 'R' },
    { id: 'circle', icon: Circle, label: 'Círculo', key: 'C' },
    { id: 'dim', icon: Hash, label: 'Cota / Dimensão', key: 'D' },
  ];

  // Callback de validação
  const handleProfileStatus = (val, lines) => {
    setProfileValidation(val);
    setCurrentLines(lines);
  };

  // Requisito 4: Extrusão bloqueada se perfil aberto
  const handleExtrudeTo3D = () => {
    if (!profileValidation.isValid) {
      alert(`OPERAÇÃO BLOQUEADA!\n\n${profileValidation.message}\n\nPara extrudar para sólido 3D, todas as arestas devem estar conectadas e o perfil deve formar um ciclo contínuo (A → B → C → ... → A).`);
      addLog(`[ERRO CAD] Tentativa de extrusão com perfil aberto bloqueada.`);
      return;
    }

    // Salva perfil estruturado no projeto
    setProject(prev => ({
      ...prev,
      sketchProfile: profileValidation.orderedPoints,
      geometry: {
        ...prev.geometry,
        length: extrudeDepth,
      }
    }));

    // Adiciona operação na árvore do CAD
    addCADFeature({
      name: `Extrusão Sólida (${extrudeDepth}mm) [Plano ${workingPlane}]`,
      type: 'extrude',
      params: { depth: extrudeDepth, plane: workingPlane, pointsCount: profileValidation.orderedPoints.length }
    });

    addLog(`Perfil fechado extrudado com sucesso para Sólido 3D (${extrudeDepth}mm).`);
    setIs3DMode(true);
  };

  const handleProceedToCAD = () => {
    addLog('Geometria sólida enviada para o CAD Inventor.');
    setActiveView('cad_inventor');
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#0a0e1a]">
      {/* Viewport Central */}
      <div className="flex-1 h-full flex flex-col min-h-[400px] p-2 gap-2">
        {/* Barra de Ferramentas Superior */}
        <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-[#111827]/90 backdrop-blur border border-white/10 rounded-xl font-mono text-xs select-none gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
              is3DMode 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                : 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
            }`}>
              {is3DMode ? '🧊 VISUALIZADOR SÓLIDO 3D' : `✏️ ESBOÇO 2D (${workingPlane})`}
            </span>

            {!is3DMode && (
              <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
                <span className="text-[10px] text-slate-500 px-1.5">PLANO:</span>
                {['XY', 'XZ', 'YZ'].map(pl => (
                  <button
                    key={pl}
                    onClick={() => { setWorkingPlane(pl); addLog(`Plano alterado para ${pl}`); }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      workingPlane === pl ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {pl}
                  </button>
                ))}
              </div>
            )}

            {!is3DMode && tools.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setSketchMode(t.id)}
                  title={`${t.label} (${t.key})`}
                  className={`px-2 py-1 rounded-lg flex items-center gap-1 font-bold transition-all ${
                    sketchMode === t.id
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}

            {is3DMode && (
              <button
                onClick={() => { setIs3DMode(false); addLog('Retornando ao modo Esboço 2D.'); }}
                className="px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 font-bold transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Editar Esboço
              </button>
            )}
          </div>

          {/* Controles de Extrusão e Tolerância */}
          <div className="flex items-center gap-2 flex-wrap">
            {!is3DMode && (
              <>
                <div className="flex items-center gap-1 text-[11px] bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                  <span className="text-slate-400">Tolerância:</span>
                  <input
                    type="number"
                    min={2}
                    max={25}
                    value={tolerance}
                    onChange={e => setTolerance(Number(e.target.value))}
                    className="w-10 bg-[#0d1117] border border-white/15 rounded px-1 py-0.5 text-cyan-400 font-bold text-center"
                    title="Tolerância de fechamento de vértices em pixels"
                  />
                  <span className="text-slate-500">px</span>
                </div>

                <div className="flex items-center gap-1 text-[11px] bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                  <span className="text-slate-400">Extrusão:</span>
                  <input
                    type="number"
                    min={10}
                    max={3000}
                    value={extrudeDepth}
                    onChange={e => setExtrudeDepth(Number(e.target.value))}
                    className="w-16 bg-[#0d1117] border border-white/15 rounded px-1 py-0.5 text-cyan-400 font-bold text-center"
                  />
                  <span className="text-slate-500">mm</span>
                </div>
              </>
            )}

            {!is3DMode ? (
              <button
                onClick={handleExtrudeTo3D}
                disabled={!profileValidation.isValid}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow ${
                  profileValidation.isValid
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold cursor-pointer animate-pulse'
                    : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed opacity-60'
                }`}
                title={profileValidation.isValid ? 'Executar Extrusão Sólida 3D' : profileValidation.message}
              >
                <Layers className="w-3.5 h-3.5" /> Extrudar 3D (E) <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleProceedToCAD}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-1.5 transition-all shadow"
              >
                <CornerUpRight className="w-3.5 h-3.5" /> Avançar para CAD Inventor
              </button>
            )}
          </div>
        </div>

        {/* Viewport Canvas 2D ou 3D */}
        <div className="flex-1 rounded-xl overflow-hidden border border-white/10 bg-[#0d1117]">
          {is3DMode ? (
            <div className="w-full h-full flex flex-col">
              <div className="px-3 py-1.5 bg-cyan-500/10 border-b border-cyan-500/20 text-xs font-mono text-cyan-400 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" /> Sólido CAD Paramétrico Gerado a partir do Perfil Fechado ({extrudeDepth}mm)
                </span>
                <span className="text-[11px] text-slate-400">Clique e arraste para orbitar · Roda para zoom</span>
              </div>
              <div className="flex-1">
                <ThreeCanvas />
              </div>
            </div>
          ) : (
            <SketchCanvas2D 
              tool={sketchMode} 
              tolerance={tolerance}
              workingPlane={workingPlane}
              onProfileStatusChange={handleProfileStatus}
            />
          )}
        </div>

        {/* Notificação Inferior de Validação do Perfil */}
        {!is3DMode && (
          <div className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between gap-3 ${
            profileValidation.isValid 
              ? 'bg-green-500/10 border-green-500/30 text-green-300' 
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            <div className="flex items-center gap-2">
              {profileValidation.isValid ? (
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{profileValidation.message}</span>
            </div>
            <div className="text-[10px] text-slate-400 shrink-0">
              {profileValidation.isValid ? 'Pronto para Sólido 3D' : 'Fechamento Obrigatório'}
            </div>
          </div>
        )}
      </div>

      {/* Painel Lateral de Engenharia CAD */}
      <div className="w-full md:w-80 h-full bg-[#111827]/90 border-l border-white/10 p-4 overflow-y-auto space-y-5 font-mono text-xs select-none shrink-0">
        <div>
          <div className="border-b border-white/10 pb-3 mb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" /> Sistema de Coordenadas
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">
              Plano de trabalho ativo: <strong className="text-cyan-300">{workingPlane}</strong>. Todas as coordenadas são projetadas ortogonalmente.
            </p>
          </div>

          <div className="space-y-2 bg-white/5 p-3 rounded-xl border border-white/10 text-[11px]">
            <div className="flex justify-between"><span>Eixo X:</span><span className="text-red-400 font-bold">Direção Longitudinal</span></div>
            <div className="flex justify-between"><span>Eixo Y:</span><span className="text-green-400 font-bold">Direção Vertical</span></div>
            <div className="flex justify-between"><span>Eixo Z:</span><span className="text-blue-400 font-bold">Normal do Plano</span></div>
            <div className="flex justify-between"><span>Tolerância de Fecho:</span><span className="text-cyan-400 font-bold">{tolerance} mm/px</span></div>
          </div>
        </div>

        {/* Árvore de Operações do Perfil */}
        <div>
          <div className="border-b border-white/10 pb-3 mb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" /> Operações CAD Disponíveis
            </h2>
          </div>

          <div className="space-y-1.5">
            {[
              { name: 'Extrusão Sólida', desc: 'Requer perfil fechado contínuo', active: true },
              { name: 'Corte Extrudado (Cut)', desc: 'Subtração booleana sólida', active: false },
              { name: 'Filete / Chanfro', desc: 'Arredondamento de arestas', active: false },
              { name: 'Furação Paramétrica', desc: 'Furos cilíndricos com diâmetro', active: false }
            ].map(op => (
              <div key={op.name} className="p-2.5 bg-white/5 rounded-lg border border-white/10 space-y-0.5">
                <div className="text-white font-bold text-xs">{op.name}</div>
                <div className="text-[10px] text-slate-400">{op.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Botão de Avanço */}
        <button
          onClick={() => setActiveView('ensaios')}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
        >
          Avançar para Ensaios Físicos <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
