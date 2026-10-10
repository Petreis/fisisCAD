import React, { useState, useEffect } from 'react';
import { CADProvider, useCAD } from './context/CADContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { FooterTelemetry } from './components/FooterTelemetry';
import { AIAssistantModal } from './components/AIAssistantModal';
import { LoginView } from './views/LoginView';

import { HubView } from './views/HubView';
import { CADInventorView } from './views/CADInventorView';
import { SketchModelView } from './views/SketchModelView';
import { EnsaiosView } from './views/EnsaiosView';
import { EstudioMateriaisView } from './views/EstudioMateriaisView';
import { SimulacaoView } from './views/SimulacaoView';
import { AnaliseRelatoriosView } from './views/AnaliseRelatoriosView';

import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

// ─── View Router ──────────────────────────────────────────────────────────────
const ViewRouter = () => {
  const { activeView } = useCAD();

  switch (activeView) {
    case 'hub':           return <HubView />;
    case 'cad_inventor':  return <CADInventorView />;
    case 'sketch_model':  return <SketchModelView />;
    case 'ensaios':       return <EnsaiosView />;
    case 'materiais':     return <EstudioMateriaisView />;
    case 'simulacao':     return <SimulacaoView />;
    case 'relatorios':    return <AnaliseRelatoriosView />;
    default:              return <HubView />;
  }
};

// ─── Main App Layout ──────────────────────────────────────────────────────────
const MainLayout = () => {
  const { deviceMode } = useCAD();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-on-surface">
      <Header />
      <div className={`flex-1 flex pt-14 overflow-hidden ${deviceMode === 'mobile' ? 'flex-col overflow-y-auto' : 'flex-row'}`}>
        <Sidebar />
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-surface-container-lowest relative">
          <ViewRouter />
        </main>
      </div>
      <FooterTelemetry />
      <AIAssistantModal />
    </div>
  );
};

// ─── Auth Gate ────────────────────────────────────────────────────────────────
const AuthGate = () => {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? null);
    });
    return () => unsub();
  }, []);

  // Loading state — brief spinner while Firebase resolves auth
  if (user === undefined) {
    return (
      <div className="min-h-screen w-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-500/40 border-t-blue-400 rounded-full animate-spin" />
          <span className="text-sm font-mono text-slate-500">Verificando autenticação...</span>
        </div>
      </div>
    );
  }

  // Not logged in → show login screen
  if (!user) {
    return <LoginView onLogin={(u) => setUser(u)} />;
  }

  // Logged in → show full app
  return (
    <CADProvider>
      <MainLayout />
    </CADProvider>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return <AuthGate />;
}
