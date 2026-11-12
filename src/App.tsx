import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { PdvView } from './components/PDV/PdvView';
import { KdsView } from './components/KDS/KdsView';
import { PainelSenhasView } from './components/PainelSenhas/PainelSenhasView';
import { EstoqueView } from './components/Estoque/EstoqueView';
import { RelatoriosView } from './components/Relatorios/RelatoriosView';

function AppContent() {
  const [abaAtiva, setAbaAtiva] = useState<
    'pdv' | 'cozinha' | 'painel-senhas' | 'estoque' | 'relatorios'
  >('pdv');

  return (
    <div className="min-h-screen bg-[#060913] cyber-grid-bg text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Ambient Cyber Neon Glow Spotlights */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-72 h-72 bg-fuchsia-500/8 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Top Nav Header */}
      <Header abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {abaAtiva === 'pdv' && <PdvView />}
        {abaAtiva === 'cozinha' && <KdsView />}
        {abaAtiva === 'painel-senhas' && <PainelSenhasView />}
        {abaAtiva === 'estoque' && <EstoqueView />}
        {abaAtiva === 'relatorios' && <RelatoriosView />}
      </main>

      {/* Futuristic Fast Food Neon Footer */}
      <footer className="bg-[#050811]/90 backdrop-blur-md text-slate-400 border-t border-cyan-500/20 text-xs py-6 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-brand font-black neon-text-amber text-sm tracking-wide">
              Cantinho do Mini Chefe
            </span>
            <span className="text-cyan-500/50">&bull;</span>
            <span className="text-slate-400 font-medium">Pequeno chefe e grandes sabores &bull; Neo Fast Food</span>
          </div>

          <div className="text-slate-500 text-[11px] text-center sm:text-right flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#00ff88]"></span>
            <span>Terminal Operacional Neon &bull; &copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
