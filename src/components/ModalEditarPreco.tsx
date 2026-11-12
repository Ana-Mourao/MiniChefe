import React, { useState } from 'react';
import { ProdutoVenda } from '../types';
import { useApp } from '../context/AppContext';
import { DollarSign, Tag, Check, X, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';

interface ModalEditarPrecoProps {
  produto: ProdutoVenda | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ModalEditarPreco: React.FC<ModalEditarPrecoProps> = ({ produto, onClose, onSuccess }) => {
  const { atualizarPrecoProduto, calcularCustoInsumosProduto } = useApp();

  if (!produto) return null;

  const custoInsumos = calcularCustoInsumosProduto(produto.id);
  const [novoPrecoStr, setNovoPrecoStr] = useState<string>(produto.precoVenda.toFixed(2));
  const [feedbackSalvo, setFeedbackSalvo] = useState(false);

  const novoPrecoNum = parseFloat(novoPrecoStr.replace(',', '.')) || 0;
  const novoLucro = novoPrecoNum - custoInsumos;
  const novaMargemPct = novoPrecoNum > 0 ? (novoLucro / novoPrecoNum) * 100 : 0;
  const precoAbaixoDoCusto = novoPrecoNum < custoInsumos;

  const aplicarAjuste = (delta: number) => {
    const atual = parseFloat(novoPrecoStr.replace(',', '.')) || 0;
    const ajustado = Math.max(0, atual + delta);
    setNovoPrecoStr(ajustado.toFixed(2));
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(novoPrecoNum) || novoPrecoNum <= 0) return;

    atualizarPrecoProduto(produto.id, novoPrecoNum);
    setFeedbackSalvo(true);
    setTimeout(() => {
      setFeedbackSalvo(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#0a1022] rounded-3xl shadow-[0_0_40px_rgba(255,184,0,0.25)] max-w-md w-full overflow-hidden border border-amber-500/40 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#060b17] p-5 text-white flex items-center justify-between border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-[0_0_12px_rgba(255,184,0,0.5)]">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-brand font-bold text-base text-white neon-text-amber">Alterar Preço de Venda</h3>
              <p className="text-xs text-cyan-300 font-mono font-medium">{produto.nome}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSalvar} className="p-6 space-y-5 text-slate-200">
          {/* Product Category & Current Info */}
          <div className="bg-[#060b17] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                Categoria
              </span>
              <span className="text-xs font-semibold text-cyan-300 font-mono">{produto.categoria}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                Preço Atual
              </span>
              <span className="font-mono font-bold text-sm line-through text-slate-500 tabular-nums">
                R$ {produto.precoVenda.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* New Price Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-amber-300 block uppercase tracking-wider font-mono">
              Novo Preço de Venda (R$):
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-base text-amber-400 font-mono">
                R$
              </span>
              <input
                type="number"
                step="0.10"
                min="0.10"
                value={novoPrecoStr}
                onChange={(e) => setNovoPrecoStr(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-2xl font-brand font-black text-white bg-[#060b17] border-2 border-amber-500/50 rounded-2xl focus:outline-none focus:border-amber-400 focus:shadow-[0_0_20px_rgba(255,184,0,0.3)] transition-all tabular-nums neon-text-amber"
                autoFocus
                required
              />
            </div>

            {/* Quick +/- adjustment buttons */}
            <div className="flex items-center gap-1.5 pt-1 flex-wrap">
              <span className="text-[11px] text-slate-400 font-mono">Ajuste rápido:</span>
              {[-1.0, -0.5, 0.5, 1.0, 2.0].map((delta) => (
                <button
                  key={delta}
                  type="button"
                  onClick={() => aplicarAjuste(delta)}
                  className={`px-2 py-1 text-xs rounded-lg font-bold border transition-colors cursor-pointer font-mono ${
                    delta > 0
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60 shadow-[0_0_8px_rgba(0,255,136,0.2)]'
                      : 'bg-rose-950/80 text-rose-300 border-rose-500/40 hover:bg-rose-900/60 shadow-[0_0_8px_rgba(244,63,94,0.2)]'
                  }`}
                >
                  {delta > 0 ? `+R$ ${delta.toFixed(2)}` : `-R$ ${Math.abs(delta).toFixed(2)}`}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Profit & Margin Simulator */}
          <div className="p-4 rounded-2xl border bg-[#060b17] space-y-2 border-cyan-500/20 shadow-[0_0_15px_rgba(0,240,255,0.05)]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Custo dos Insumos (Ficha Técnica):</span>
              <span className="font-mono font-bold text-slate-300 tabular-nums">
                R$ {custoInsumos.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
              <span className="text-slate-300 font-medium">Novo Lucro Bruto Estimado:</span>
              <span
                className={`font-mono font-black text-sm tabular-nums ${
                  precoAbaixoDoCusto ? 'text-rose-400 neon-text-magenta' : 'neon-text-lime'
                }`}
              >
                R$ {novoLucro.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Nova Margem de Lucro:</span>
              <span
                className={`font-mono font-black text-sm tabular-nums ${
                  precoAbaixoDoCusto ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {novaMargemPct.toFixed(1)}%
              </span>
            </div>

            {precoAbaixoDoCusto && (
              <div className="mt-2 bg-rose-950/80 border border-rose-500/50 text-rose-300 p-2.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Atenção: O preço está menor que o custo dos ingredientes!</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={feedbackSalvo}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_20px_rgba(255,184,0,0.35)] transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {feedbackSalvo ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Preço Atualizado!</span>
                </>
              ) : (
                <>
                  <Tag className="w-4 h-4" />
                  <span>Salvar Novo Preço</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
