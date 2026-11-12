import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Pedido, StatusPedido } from '../../types';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Play,
  Check,
  AlertCircle,
  Volume2,
  VolumeX,
  XCircle,
  MessageSquare,
} from 'lucide-react';

export const KdsView: React.FC = () => {
  const {
    pedidos,
    atualizarStatusPedido,
    cancelarPedido,
    notificacaoSomAtiva,
    setNotificacaoSomAtiva,
    tocarSomNotificacao,
  } = useApp();

  const [filtroStatus, setFiltroStatus] = useState<string>('ATIVOS');
  const [agora, setAgora] = useState<number>(Date.now());

  // Update clock every 10 seconds to keep order timers fresh
  useEffect(() => {
    const interval = setInterval(() => {
      setAgora(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Compute elapsed minutes
  const calcularMinutosDecorrido = (dataIso: string) => {
    const diffMs = agora - new Date(dataIso).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  // Active kitchen orders
  const pedidosAtivos = pedidos.filter(
    (p) => p.status === 'RECEBIDO' || p.status === 'EM_PREPARO' || p.status === 'PRONTO'
  );

  const pedidosFinalizadosHoje = pedidos.filter((p) => p.status === 'FINALIZADO');

  const pedidosFiltrados = pedidos.filter((p) => {
    if (filtroStatus === 'ATIVOS') {
      return p.status === 'RECEBIDO' || p.status === 'EM_PREPARO' || p.status === 'PRONTO';
    }
    if (filtroStatus === 'TODOS') return true;
    return p.status === filtroStatus;
  });

  const getTimerBadge = (minutos: number) => {
    if (minutos < 5) {
      return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(0,255,136,0.3)]';
    }
    if (minutos < 10) {
      return 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-[0_0_8px_rgba(255,184,0,0.3)]';
    }
    return 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.4)] animate-pulse';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Kitchen Header */}
      <div className="bg-[#0a1024]/90 backdrop-blur-md rounded-2xl p-5 text-white shadow-[0_0_25px_rgba(255,184,0,0.1)] border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_15px_rgba(255,184,0,0.5)]">
            <ChefHat className="w-7 h-7 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-brand font-black text-xl neon-text-amber">
                KDS &bull; Cozinha do Mini Chefe
              </h1>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-400/50 shadow-[0_0_8px_#00ff88]">
                Ao Vivo
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Fila de preparo sincronizada em tempo real com o PDV e estoque.
            </p>
          </div>
        </div>

        {/* Status Counters & Tools */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-cyan-500/30 text-xs shadow-[0_0_10px_rgba(0,240,255,0.1)]">
            <span className="text-slate-400">Na Fila:</span>
            <span className="font-bold text-amber-400 text-sm font-mono">{pedidosAtivos.length}</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">Entregues:</span>
            <span className="font-bold text-emerald-400 text-sm font-mono">
              {pedidosFinalizadosHoje.length}
            </span>
          </div>

          <button
            onClick={() => {
              setNotificacaoSomAtiva(!notificacaoSomAtiva);
              tocarSomNotificacao();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-200 border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer shadow-xs"
          >
            {notificacaoSomAtiva ? (
              <>
                <Volume2 className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_6px_#00f0ff]" />
                <span>Alerta Sonoro On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-500" />
                <span>Alerta Mudo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-[#0a1020] border border-cyan-500/25 rounded-xl">
          {[
            { id: 'ATIVOS', label: `Ativos (${pedidosAtivos.length})` },
            { id: 'RECEBIDO', label: 'Novos / A Fazer' },
            { id: 'EM_PREPARO', label: 'No Fogo / Forno' },
            { id: 'PRONTO', label: 'Prontos para Retirada' },
            { id: 'FINALIZADO', label: 'Entregues' },
            { id: 'TODOS', label: 'Todos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFiltroStatus(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filtroStatus === tab.id
                  ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 font-black shadow-[0_0_14px_rgba(255,184,0,0.5)]'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Kitchen Orders Grid */}
      {pedidosFiltrados.length === 0 ? (
        <div className="bg-[#0a1020]/90 rounded-2xl border border-cyan-500/20 p-12 text-center text-slate-400">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 drop-shadow-[0_0_10px_#00ff88]" />
          <h3 className="font-brand font-bold text-base text-white">
            Nenhum pedido nesta etapa!
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            A cozinha está em dia. Novos pedidos realizados no PDV aparecerão aqui automaticamente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pedidosFiltrados.map((pedido) => {
            const minutos = calcularMinutosDecorrido(pedido.dataHora);
            const isRecebido = pedido.status === 'RECEBIDO';
            const isPreparo = pedido.status === 'EM_PREPARO';
            const isPronto = pedido.status === 'PRONTO';
            const isFinalizado = pedido.status === 'FINALIZADO';
            const isCancelado = pedido.status === 'CANCELADO';

            return (
              <div
                key={pedido.id}
                className={`bg-[#0c1428]/95 backdrop-blur-md rounded-2xl border flex flex-col justify-between overflow-hidden shadow-sm transition-all ${
                  isRecebido
                    ? 'border-cyan-400/70 shadow-[0_0_20px_rgba(0,240,255,0.25)]'
                    : isPreparo
                    ? 'border-amber-400/80 shadow-[0_0_22px_rgba(255,184,0,0.28)]'
                    : isPronto
                    ? 'border-emerald-400/80 shadow-[0_0_25px_rgba(0,255,136,0.3)]'
                    : 'border-slate-800 opacity-70'
                }`}
              >
                {/* Order Top Bar */}
                <div
                  className={`px-4 py-3 border-b flex items-center justify-between ${
                    isRecebido
                      ? 'bg-[#061826] text-cyan-200 border-cyan-500/40'
                      : isPreparo
                      ? 'bg-[#1c1404] text-amber-200 border-amber-500/40'
                      : isPronto
                      ? 'bg-[#071a10] text-emerald-200 border-emerald-500/40'
                      : 'bg-[#080d1a] text-slate-400 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-brand font-black text-xl tracking-wider text-white">
                      {pedido.numeroPedido}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700 text-slate-300">
                      {pedido.tipoAtendimento}
                    </span>
                  </div>

                  {/* Timer */}
                  <div
                    className={`flex items-center gap-1 text-xs font-mono font-bold px-2 py-1 rounded-md border ${getTimerBadge(
                      minutos
                    )}`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{minutos} min</span>
                  </div>
                </div>

                {/* Order Body */}
                <div className="p-4 space-y-4 flex-1">
                  {/* Customer info */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-mono">Cliente:</span>
                      <strong className="text-white text-sm">{pedido.clienteNome}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block text-[10px] uppercase font-mono">Hora:</span>
                      <span className="font-mono text-cyan-300">
                        {new Date(pedido.dataHora).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-2.5">
                    {pedido.itens.map((it) => (
                      <div
                        key={it.id}
                        className="p-2.5 rounded-xl bg-[#080e1c] border border-cyan-500/15 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-brand font-bold text-white text-sm">
                            <span className="text-cyan-400 font-black mr-1.5 text-base font-mono">
                              {it.quantidade}x
                            </span>
                            {it.nomeProduto}
                          </span>
                        </div>

                        {it.observacao && (
                          <div className="flex items-start gap-1 text-[11px] font-bold text-amber-200 bg-amber-950/70 p-1.5 rounded border border-amber-500/30">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>Obs: {it.observacao}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {pedido.observacoesGerais && (
                    <div className="text-xs bg-[#080d1a] border border-cyan-500/20 p-2 rounded-lg text-slate-300">
                      <strong className="text-cyan-400">Obs Geral:</strong> {pedido.observacoesGerais}
                    </div>
                  )}
                </div>

                {/* Action Bar for Kitchen Workflow */}
                <div className="p-3 bg-[#070c18] border-t border-slate-800/80 space-y-2">
                  {isRecebido && (
                    <button
                      onClick={() => atualizarStatusPedido(pedido.id, 'EM_PREPARO')}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_16px_rgba(0,240,255,0.6)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
                      <span>Iniciar Preparo na Cozinha</span>
                    </button>
                  )}

                  {isPreparo && (
                    <button
                      onClick={() => atualizarStatusPedido(pedido.id, 'PRONTO')}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_18px_rgba(255,184,0,0.6)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ChefHat className="w-4 h-4 text-slate-950" />
                      <span>Marcar como Pronto para Retirada</span>
                    </button>
                  )}

                  {isPronto && (
                    <button
                      onClick={() => atualizarStatusPedido(pedido.id, 'FINALIZADO')}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-400 to-emerald-300 hover:from-emerald-300 hover:to-emerald-200 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_18px_rgba(0,255,136,0.6)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>Finalizar e Entregar ao Cliente</span>
                    </button>
                  )}

                  {isFinalizado && (
                    <div className="text-center py-1 text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Pedido Entregue com Sucesso</span>
                    </div>
                  )}

                  {isCancelado && (
                    <div className="text-center py-1 text-xs font-bold text-rose-400 flex items-center justify-center gap-1">
                      <XCircle className="w-4 h-4" />
                      <span>Pedido Cancelado (Estoque Estornado)</span>
                    </div>
                  )}

                  {/* Cancel Button if active */}
                  {!isFinalizado && !isCancelado && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          const motivo = window.prompt(
                            'Informe o motivo do cancelamento (o estoque será restaurado):'
                          );
                          if (motivo !== null) {
                            cancelarPedido(pedido.id, motivo);
                          }
                        }}
                        className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        Cancelar pedido
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
