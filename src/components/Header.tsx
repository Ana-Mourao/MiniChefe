import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PerfilUsuario } from '../types';
import { ModalConfigurarPix } from './ModalConfigurarPix';
import {
  UtensilsCrossed,
  ShoppingBag,
  ChefHat,
  Monitor,
  Package,
  BarChart3,
  AlertTriangle,
  Volume2,
  VolumeX,
  UserCheck,
  RotateCcw,
  QrCode,
  Key,
} from 'lucide-react';

interface HeaderProps {
  abaAtiva: 'pdv' | 'cozinha' | 'painel-senhas' | 'estoque' | 'relatorios';
  setAbaAtiva: (aba: 'pdv' | 'cozinha' | 'painel-senhas' | 'estoque' | 'relatorios') => void;
}

export const Header: React.FC<HeaderProps> = ({ abaAtiva, setAbaAtiva }) => {
  const {
    usuarioAtual,
    trocarPerfil,
    insumosComEstoqueBaixo,
    pedidos,
    notificacaoSomAtiva,
    setNotificacaoSomAtiva,
    resetarDados,
  } = useApp();

  const [modalPixAberto, setModalPixAberto] = useState(false);

  const pedidosPendentes = pedidos.filter(
    (p) => p.status === 'RECEBIDO' || p.status === 'EM_PREPARO'
  ).length;

  return (
    <header className="sticky top-0 z-30 bg-[#080d1c]/95 backdrop-blur-xl border-b border-cyan-500/25 text-white shadow-[0_4px_25px_rgba(0,240,255,0.08)]">
      {/* Top Banner Notice if Low Stock */}
      {insumosComEstoqueBaixo.length > 0 && (
        <div className="bg-rose-950/60 border-b border-rose-500/40 px-4 py-1.5 flex items-center justify-between text-xs text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
            <span>
              <strong className="text-rose-300">Alerta Neon de Estoque:</strong> {insumosComEstoqueBaixo.length}{' '}
              {insumosComEstoqueBaixo.length === 1 ? 'insumo atingiu' : 'insumos atingiram'} o nível crítico de segurança (
              {insumosComEstoqueBaixo.map((i) => i.nome).join(', ')}).
            </span>
          </div>
          <button
            onClick={() => setAbaAtiva('estoque')}
            className="text-cyan-300 hover:text-white underline font-bold transition-colors shrink-0 ml-4 cursor-pointer"
          >
            Repor Estoque &rarr;
          </button>
        </div>
      )}

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Wordmark & Mascot */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-amber-400 to-amber-300 p-0.5 shadow-[0_0_16px_rgba(0,240,255,0.45)] flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(255,184,0,0.6)]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-brand font-black text-lg tracking-tight neon-text-amber">
                  Cantinho do Mini Chefe
                </span>
                <span className="text-[10px] bg-cyan-500/15 text-cyan-300 font-bold px-2 py-0.5 rounded-full border border-cyan-400/40 shadow-[0_0_10px_rgba(0,240,255,0.25)] uppercase tracking-wider">
                  Cyber Fast Food
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Pequeno chefe e grandes sabores &bull; Neon Edition
              </p>
            </div>
          </div>

          {/* Module Navigation Tabs */}
          <nav className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            <button
              onClick={() => setAbaAtiva('pdv')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                abaAtiva === 'pdv'
                  ? 'bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 shadow-[0_0_18px_rgba(0,240,255,0.55)] border border-cyan-200'
                  : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-850 hover:border-cyan-500/30 border border-transparent'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>PDV / Caixa</span>
            </button>

            <button
              onClick={() => setAbaAtiva('cozinha')}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                abaAtiva === 'cozinha'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 shadow-[0_0_18px_rgba(255,184,0,0.55)] border border-amber-200'
                  : 'text-slate-300 hover:text-amber-300 hover:bg-slate-850 hover:border-amber-500/30 border border-transparent'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Cozinha KDS</span>
              {pedidosPendentes > 0 && (
                <span className="ml-1 bg-fuchsia-600 text-white font-black text-[10px] px-1.5 py-0.2 rounded-full shadow-[0_0_10px_#ff007f] animate-pulse">
                  {pedidosPendentes}
                </span>
              )}
            </button>

            <button
              onClick={() => setAbaAtiva('painel-senhas')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                abaAtiva === 'painel-senhas'
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-300 text-slate-950 shadow-[0_0_18px_rgba(0,255,136,0.55)] border border-emerald-200'
                  : 'text-slate-300 hover:text-emerald-300 hover:bg-slate-850 hover:border-emerald-500/30 border border-transparent'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Painel do Salão</span>
            </button>

            <button
              onClick={() => setAbaAtiva('estoque')}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                abaAtiva === 'estoque'
                  ? 'bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 shadow-[0_0_18px_rgba(0,240,255,0.55)] border border-cyan-200'
                  : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-850 hover:border-cyan-500/30 border border-transparent'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Estoque &amp; Receitas</span>
              {insumosComEstoqueBaixo.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#ff0055] animate-ping"></span>
              )}
            </button>

            <button
              onClick={() => setAbaAtiva('relatorios')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                abaAtiva === 'relatorios'
                  ? 'bg-gradient-to-r from-fuchsia-400 to-pink-400 text-slate-950 shadow-[0_0_18px_rgba(255,0,127,0.55)] border border-fuchsia-200'
                  : 'text-slate-300 hover:text-fuchsia-300 hover:bg-slate-850 hover:border-fuchsia-500/30 border border-transparent'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Relatórios Gestão</span>
            </button>
          </nav>

          {/* Right Action: User Role Switcher & Audio */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Chave PIX Shortcut */}
            <button
              onClick={() => setModalPixAberto(true)}
              title="Configurar Chave PIX da Loja"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-400/40 shadow-[0_0_12px_rgba(0,255,136,0.25)] text-xs font-bold transition-all cursor-pointer font-mono hover:scale-105 active:scale-95"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Chave PIX</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => setNotificacaoSomAtiva(!notificacaoSomAtiva)}
              title={notificacaoSomAtiva ? 'Som de alertas ativado' : 'Som de alertas desativado'}
              className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 border border-transparent hover:border-cyan-500/30 transition-all cursor-pointer"
            >
              {notificacaoSomAtiva ? (
                <Volume2 className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_6px_#00f0ff]" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* Profile Dropdown / Switcher */}
            <div className="flex items-center gap-2 bg-[#0c1427]/90 px-3 py-1.5 rounded-xl border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.1)]">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-white leading-tight">
                  {usuarioAtual.nome}
                </div>
                <div className="text-[10px] text-cyan-300/80 font-mono">
                  {usuarioAtual.cargo}
                </div>
              </div>
              <select
                value={usuarioAtual.perfil}
                onChange={(e) => trocarPerfil(e.target.value as PerfilUsuario)}
                className="bg-slate-950 text-cyan-300 text-xs font-semibold rounded-lg px-2 py-1 border border-cyan-500/30 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_8px_#00f0ff] cursor-pointer"
                title="Trocar Perfil de Usuário"
              >
                <option value="GESTOR">Gestor (Ana)</option>
                <option value="ATENDENTE">Atendente (Lucas)</option>
                <option value="COZINHA">Cozinha (Chef Rafaela)</option>
              </select>
            </div>

            {/* Demo Reset */}
            <button
              onClick={() => {
                if (window.confirm('Deseja restaurar os dados de demonstração originais?')) {
                  resetarDados();
                }
              }}
              title="Restaurar dados de teste"
              className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 border border-transparent hover:border-amber-500/30 transition-all cursor-pointer hidden lg:block"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Configurar PIX */}
      {modalPixAberto && (
        <ModalConfigurarPix onClose={() => setModalPixAberto(false)} />
      )}
    </header>
  );
};
