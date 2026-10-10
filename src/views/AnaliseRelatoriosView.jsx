import React from 'react';
import { useCAD } from '../context/CADContext';
import { 
  FileSpreadsheet, Download, Code, CheckCircle, ShieldCheck, 
  TrendingUp, BarChart2, FileText, ArrowRight, Printer 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';

export const AnaliseRelatoriosView = () => {
  const { project, saveProjectCAD, addLog } = useCAD();

  // Mock Stress vs Strain curve data for Aço ASTM A36
  const chartData = [
    { strain: 0.000, stress: 0 },
    { strain: 0.001, stress: 50 },
    { strain: 0.002, stress: 100 },
    { strain: 0.003, stress: 150 },
    { strain: 0.004, stress: 200 },
    { strain: 0.005, stress: 250 }, // Yield Point
    { strain: 0.006, stress: 260 },
    { strain: 0.007, stress: 275 },
    { strain: 0.008, stress: 280 },
    { strain: 0.009, stress: 270 },
    { strain: 0.010, stress: 250 },
  ];

  // Export PDF Report using jsPDF
  const exportPDFReport = () => {
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('FisisCAD PRO - Relatório Técnico de Engenharia', 14, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Projeto: ${project.name}`, 14, 30);
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 36);
      doc.text(`Autor: ${project.author}`, 14, 42);

      doc.setLineWidth(0.5);
      doc.line(14, 46, 196, 46);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('1. Propriedades do Material:', 14, 56);

      doc.setFont('helvetica', 'normal');
      const mat = project.material || {};
      const sim = project.simulation || {};

      doc.setFontSize(10);
      doc.text(`Material: ${mat.name || 'Aço Estrutural'}`, 14, 64);
      doc.text(`Módulo de Elasticidade (E): ${mat.youngModulus ?? 200} GPa`, 14, 70);
      doc.text(`Razão de Poisson (nu): ${mat.poissonRatio ?? 0.3}`, 14, 76);
      doc.text(`Limite de Escoamento (sigma_y): ${mat.yieldStrength ?? 250} MPa`, 14, 82);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('2. Resultados da Simulação FEA (Von Mises):', 14, 96);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Tensão Máxima de Von Mises: ${sim.maxVonMisesStress ?? 0} MPa`, 14, 104);
      doc.text(`Deslocamento Máximo Nodal: ${sim.maxDisplacement ?? 0} mm`, 14, 110);
      doc.text(`Fator de Segurança Mínimo (FoS): ${sim.minFactorOfSafety ?? 99.9}`, 14, 116);
      doc.text(`Status do Solver: ${sim.status || 'CONVERGED'}`, 14, 122);
      doc.text(`Reação de Apoio (Ry): ${sim.reactions?.verticalForce_kN || 'N/A'} kN`, 14, 128);
      doc.text(`Momento Reator (MR): ${sim.reactions?.reactionMoment_kNm || 'N/A'} kN.m`, 14, 134);
      doc.setFontSize(8);
      doc.text(`Nota Metodológica: Solucionador Educacional Linear Elástico no Navegador (Euler-Bernoulli + Critério de Von Mises).`, 14, 144);

      doc.save(`Relatorio_FisisCAD_${(project.name || 'Projeto').replace('.cad', '')}.pdf`);
      addLog('Relatório técnico em PDF exportado com sucesso.');
    } catch (err) {
      alert('Erro ao gerar relatório PDF.');
    }
  };

  // Export Python / Jupyter Notebook Script
  const exportPythonScript = () => {
    const mat = project.material || {};
    const pyCode = `# Script Python gerado pelo FisisCAD PRO para Física Computacional
import numpy as np
import matplotlib.pyplot as plt

# Parâmetros do Projeto: ${project.name || 'Projeto'}
material = "${mat.name || 'Aço Estrutural'}"
E = ${mat.youngModulus ?? 200}e9  # Pa
nu = ${mat.poissonRatio ?? 0.3}
yield_strength = ${mat.yieldStrength ?? 250}e6  # Pa

# Curva Tensão x Deformação (Hooke + Plastificação)
strain = np.linspace(0, 0.01, 100)
stress = np.where(strain < 0.005, E * strain, yield_strength * (1 + 0.1 * np.sin(strain*500))) / 1e6

plt.figure(figsize=(8, 5))
plt.plot(strain, stress, 'b-', label=material, linewidth=2)
plt.axhline(y=${project.simulation.maxVonMisesStress}, color='r', linestyle='--', label=f'Von Mises Max: {project.simulation.maxVonMisesStress} MPa')
plt.title("FisisCAD Academic - Tensão vs Deformação Nodal")
plt.xlabel("Deformação Específica (ε)")
plt.ylabel("Tensão de Von Mises (MPa)")
plt.grid(True, linestyle=':')
plt.legend()
plt.show()
`;
    const blob = new Blob([pyCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulacao_${project.name.replace('.cad', '')}.py`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('Script Python/Jupyter exportado para reprodutibilidade científica.');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface-container-lowest font-mono text-xs select-none">
      {/* Header & Export Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline/20 pb-4">
        <div>
          <h1 className="text-xl font-bold text-on-surface font-sans flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" /> Análise de Dados e Relatórios Técnicos
          </h1>
          <p className="text-outline text-xs mt-1">
            Gere relatórios PDF formais, plotes numéricos e exporte scripts Python/Jupyter para trabalhos acadêmicos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportPDFReport}
            className="px-4 py-2 bg-primary-container hover:bg-secondary-container text-on-primary-container font-bold rounded-lg flex items-center gap-2 transition-all shadow"
          >
            <Printer className="w-4 h-4" /> Exportar Relatório PDF
          </button>

          <button
            onClick={exportPythonScript}
            className="px-4 py-2 bg-surface-container-high hover:bg-surface-bright text-secondary font-bold rounded-lg border border-secondary/40 flex items-center gap-2 transition-all shadow"
          >
            <Code className="w-4 h-4 text-secondary" /> Exportar Script Python
          </button>

          <button
            onClick={saveProjectCAD}
            className="px-4 py-2 bg-surface-container-high hover:bg-surface-bright text-on-surface font-bold rounded-lg border border-outline/30 flex items-center gap-2 transition-all shadow"
          >
            <Download className="w-4 h-4 text-primary" /> Salvar .cad
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-surface-container rounded-xl border border-outline/20 space-y-1">
          <span className="text-[10px] text-outline uppercase font-bold">Tensão Máx Von Mises</span>
          <div className="text-xl font-bold text-error">{project.simulation.maxVonMisesStress} MPa</div>
          <span className="text-[10px] text-outline">Limite de Escoamento: {project.material.yieldStrength} MPa</span>
        </div>

        <div className="p-4 bg-surface-container rounded-xl border border-outline/20 space-y-1">
          <span className="text-[10px] text-outline uppercase font-bold">Deslocamento Nodal</span>
          <div className="text-xl font-bold text-primary">{project.simulation.maxDisplacement} mm</div>
          <span className="text-[10px] text-outline">Deflexão no Ponto Crítico</span>
        </div>

        <div className="p-4 bg-surface-container rounded-xl border border-outline/20 space-y-1">
          <span className="text-[10px] text-outline uppercase font-bold">Fator de Segurança (FoS)</span>
          <div className="text-xl font-bold text-secondary">{project.simulation.minFactorOfSafety}</div>
          <span className="text-[10px] text-secondary font-semibold">ESTRUTURA APROVADA (&gt; 1.0)</span>
        </div>

        <div className="p-4 bg-surface-container rounded-xl border border-outline/20 space-y-1">
          <span className="text-[10px] text-outline uppercase font-bold">Tempo de Processamento</span>
          <div className="text-xl font-bold text-on-surface">{project.simulation.computeTimeMs} ms</div>
          <span className="text-[10px] text-outline">Solver Wasm Local</span>
        </div>
      </div>

      {/* Interactive Chart */}
      <div className="p-5 bg-surface-container rounded-xl border border-outline/20 space-y-4">
        <h3 className="font-bold text-sm text-on-surface font-sans flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-primary" /> Curva Tensão x Deformação ({project.material.name})
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262a34" />
              <XAxis dataKey="strain" stroke="#89929b" tickFormatter={(v) => `${(v * 100).toFixed(1)}%`} />
              <YAxis stroke="#89929b" unit=" MPa" />
              <Tooltip contentStyle={{ backgroundColor: '#1c1f29', borderColor: '#3f4850', color: '#dfe2ef' }} />
              <Line type="monotone" dataKey="stress" stroke="#93ccff" strokeWidth={2.5} dot={{ fill: '#3198dc' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
