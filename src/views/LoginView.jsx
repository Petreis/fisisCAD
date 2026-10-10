import React, { useState } from 'react';
import { loginWithGoogle } from '../firebase/config';
import { Sparkles, LogIn, ShieldCheck, Cpu, Layers } from 'lucide-react';

export const LoginView = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loginWithGoogle();
      onLogin(result.user);
    } catch (err) {
      setError('Falha ao fazer login. Verifique sua conexão e tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#0a0e1a] flex items-center justify-center relative overflow-hidden">
      {/* Animated background grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(49,152,220,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(49,152,220,1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white tracking-tight font-sans">FisisCAD</h1>
              <span className="text-xs font-mono text-cyan-400/80">Kernel v2.4-PRO</span>
            </div>
          </div>
          <p className="text-sm text-slate-400 font-mono">
            Plataforma de Modelagem 3D & Simulação Física
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white font-sans mb-1">Acesso ao Workspace</h2>
            <p className="text-sm text-slate-400">
              Faça login com sua conta Google para acessar seus projetos CAD e simulações.
            </p>
          </div>

          {/* Feature Pills */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              { icon: Layers, label: 'CAD 3D' },
              { icon: Cpu, label: 'FEA/CFD' },
              { icon: ShieldCheck, label: 'Cloud Sync' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 p-2.5 bg-white/5 rounded-lg border border-white/8"
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                <span className="text-[10px] font-mono text-slate-400 font-bold">{label}</span>
              </div>
            ))}
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                {/* Google Icon SVG */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continuar com Google</span>
                <LogIn className="w-4 h-4 ml-auto opacity-60" />
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-mono">
              ⚠ {error}
            </div>
          )}

          <p className="mt-5 text-center text-xs text-slate-500 font-mono leading-relaxed">
            Ao continuar, você concorda com os{' '}
            <span className="text-cyan-400/80 cursor-pointer hover:text-cyan-400">Termos de Uso</span>
            {' '}e a{' '}
            <span className="text-cyan-400/80 cursor-pointer hover:text-cyan-400">Política de Privacidade</span>{' '}do FisisCAD.
          </p>
        </div>

        {/* Bottom tagline */}
        <div className="text-center mt-6 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400/60 animate-pulse" />
          <span className="text-xs font-mono text-slate-500">
            Powered by WebGL · WebAssembly · Firebase
          </span>
        </div>
      </div>
    </div>
  );
};
