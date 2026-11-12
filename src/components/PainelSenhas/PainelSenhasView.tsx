import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ChefHat, Bell, CheckCircle, Clock, Maximize2, Minimize2 } from 'lucide-react';

export const PainelSenhasView: React.FC = () => {
  const { pedidos } = useApp();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [horaAtual, setHoraAtual] = useState(new Date().toLocaleTimeString('pt-BR'));

  useEffect(() => {
    const timer = setInterval(() => {
      setHoraAtual(new Date().toLocaleTimeString('pt-BR'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const emPreparo = pedidos
    .filter((p) => p.status === 'RECEBIDO' || p.status === 'EM_PREPARO')
    .slice(0, 8);

  const prontos = pedidos
    .filter((p) => p.status === 'PRONTO')
    .slice(0, 6);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 ${
        isFullscreen ? 'min-h-screen bg-[#04060d] p-8' : ''
      }`}
    >
      {/* Brand Header */}
      <div className="bg-[#0a1024]/90 backdrop-blur-md border border-cyan-500/30 rounded-3xl p-6 text-white shadow-[0_0_30px_rgba(0,240,255,0.15)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src="/assets/aistudio/PHOTO-2026-09-16-14-34-02_d38a36e1.jpg"
              alt="Cantinho do Mini Chefe"
              className="w-16 h-16 rounded-2xl object-cover object-top border-2 border-amber-400 shadow-[0_0_15px_rgba(255,184,0,0.5)]"
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-[0_0_8px_#00ff88]"></span>
          </div>
          <div>
            <h1 className="font-brand font-black text-2xl sm:text-3xl tracking-tight text-white flex items-center gap-2">
              <span className="neon-text-amber">Cantinho do Mini Chefe</span>
              <ChefHat className="w-7 h-7 text-amber-400 drop-shadow-[0_0_8px_#ffb800]" />
            </h1>
            <p className="text-sm text-cyan-300 font-medium">
              Pequeno chefe e grandes sabores &bull; Painel Neon de Chamada do Salão
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 block font-mono uppercase tracking-wider">Horário Terminal</span>
            <span className="font-mono font-black text-2xl neon-text-cyan tabular-nums">
              {horaAtual}
            </span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-cyan-300 transition-all cursor-pointer border border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
            title={isFullscreen ? 'Sair da tela cheia' : 'Modo Tela Cheia para TV do Salão'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Split Display: Preparando vs Pronto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Column: PREPARANDO */}
        <div className="bg-[#0a1022]/90 backdrop-blur-md rounded-3xl border border-amber-500/40 shadow-[0_0_30px_rgba(255,184,0,0.15)] overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 px-6 py-4 text-slate-950 flex items-center justify-between shadow-[0_0_20px_rgba(255,184,0,0.3)]">
            <div className="flex items-center gap-2.5">
              <Clock className="w-6 h-6 stroke-[2.5]" />
              <h2 className="font-brand font-black text-xl uppercase tracking-wider">
                Em Preparo
              </h2>
            </div>
            <span className="text-xs font-black bg-slate-950 text-amber-300 px-3 py-1 rounded-full border border-amber-400/50 shadow-[0_0_8px_#ffb800]">
              {emPreparo.length} pedidos
            </span>
          </div>

          <div className="p-6 flex-1 bg-[#060a16]/60">
            {emPreparo.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-center">
                <Clock className="w-10 h-10 text-slate-600 mb-2" />
                <p className="font-medium text-sm text-slate-400">Nenhum pedido em fila no momento</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {emPreparo.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-[#0c1428] border border-amber-500/30 shadow-[0_0_15px_rgba(255,184,0,0.1)] flex items-center justify-between hover:border-amber-400 transition-all"
                  >
                    <div>
                      <span className="font-brand font-black text-2xl neon-text-amber block tracking-tight font-mono">
                        {p.numeroPedido}
                      </span>
                      <span className="text-xs text-slate-300 font-medium truncate block max-w-[130px]">
                        {p.clienteNome}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-1 rounded-lg uppercase font-mono">
                      {p.tipoAtendimento}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: PRONTO PARA RETIRADA */}
        <div className="bg-[#0a1420]/90 backdrop-blur-md rounded-3xl border border-emerald-400/50 shadow-[0_0_35px_rgba(0,255,136,0.2)] overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 px-6 py-4 text-slate-950 flex items-center justify-between shadow-[0_0_20px_rgba(0,255,136,0.4)]">
            <div className="flex items-center gap-2.5">
              <Bell className="w-6 h-6 animate-bounce" />
              <h2 className="font-brand font-black text-xl uppercase tracking-wider">
                Pronto para Retirar!
              </h2>
            </div>
            <span className="text-xs font-black bg-slate-950 text-emerald-300 px-3 py-1 rounded-full border border-emerald-400/50 shadow-[0_0_10px_#00ff88]">
              {prontos.length} prontos
            </span>
          </div>

          <div className="p-6 flex-1 bg-[#040e14]/60">
            {prontos.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-center">
                <CheckCircle className="w-10 h-10 text-slate-600 mb-2" />
                <p className="font-medium text-sm text-slate-400">Nenhum pedido aguardando retirada</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assim que a cozinha concluir, a senha piscará aqui com brilho neon!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prontos.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl bg-[#081816] border-2 border-emerald-400 shadow-[0_0_25px_rgba(0,255,136,0.4)] flex items-center justify-between animate-pulse ring-4 ring-emerald-500/20"
                  >
                    <div>
                      <span className="font-brand font-black text-3xl neon-text-lime block tracking-wider font-mono">
                        {p.numeroPedido}
                      </span>
                      <span className="text-xs text-slate-200 font-bold truncate block max-w-[130px]">
                        {p.clienteNome}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="inline-block text-[11px] font-black uppercase text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 px-3 py-1 rounded-lg shadow-[0_0_10px_#00ff88]">
                        Balcão &bull; Retirar
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
