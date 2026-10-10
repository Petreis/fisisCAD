import React from 'react';
import { useCAD } from '../context/CADContext';
import { Cpu, Activity, Terminal } from 'lucide-react';

export const FooterTelemetry = () => {
  const { logs, project } = useCAD();
  const latestLog = logs[logs.length - 1] || 'FisisCAD Ready';

  return (
    <footer className="h-7 bg-surface-container-lowest border-t border-outline-variant/40 px-4 flex items-center justify-between font-mono text-[11px] text-outline select-none shrink-0 z-30">
      {/* Latest Log Ticker */}
      <div className="flex items-center gap-2 max-w-xl truncate">
        <Terminal className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="text-on-surface-variant truncate">{latestLog}</span>
      </div>

      {/* Hardware & Solver Telemetry */}
      <div className="hidden sm:flex items-center gap-4">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          <span className="text-secondary font-semibold">SOLVER: {project.simulation.status}</span>
        </div>

        <div className="flex items-center gap-1">
          <Cpu className="w-3.5 h-3.5 text-primary" />
          <span>CUDA: 4,096 CORES @ 2.1 GHz</span>
        </div>

        <div className="text-on-surface font-semibold bg-surface-container-high px-2 py-0.5 rounded">
          UNIDADES: SI (mm, N, MPa)
        </div>

        <div className="text-secondary font-bold">
          LATÊNCIA: 0.42 ms
        </div>
      </div>
    </footer>
  );
};
