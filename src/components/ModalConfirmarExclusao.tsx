import React from 'react';
import { ProdutoVenda } from '../types';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ModalConfirmarExclusaoProps {
  produto: ProdutoVenda;
  onConfirmar: () => void;
  onClose: () => void;
}

export const ModalConfirmarExclusao: React.FC<ModalConfirmarExclusaoProps> = ({
  produto,
  onConfirmar,
  onClose,
}) => {
  const isCombo = produto.categoria === 'Combos Kids';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="bg-[#0e1222] rounded-3xl shadow-[0_0_40px_rgba(244,63,94,0.3)] max-w-md w-full overflow-hidden border border-rose-500/50 flex flex-col text-white">
        {/* Header */}
        <div className="bg-[#080c18] p-5 border-b border-rose-500/25 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-400 flex items-center justify-center font-bold shadow-[0_0_15px_rgba(244,63,94,0.4)]">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-brand font-bold text-base text-white neon-text-pink">
                Excluir {isCombo ? 'Combo' : 'Produto'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">Confirmação de exclusão do cardápio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 bg-rose-950/40 border border-rose-500/30 p-3.5 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="text-xs text-rose-200 leading-relaxed">
              Tem certeza que deseja excluir permanentemente este item? Ele não aparecerá mais no catálogo de vendas do PDV nem na ficha técnica.
            </div>
          </div>

          <div className="bg-[#070b16] border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
            {produto.imagemUrl ? (
              <img
                src={produto.imagemUrl}
                alt={produto.nome}
                className="w-14 h-14 object-cover rounded-xl border border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                <Trash2 className="w-6 h-6 text-slate-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                {produto.categoria}
              </span>
              <h4 className="font-brand font-bold text-sm text-white truncate mt-1">
                {produto.nome}
              </h4>
              <p className="font-mono font-bold text-xs text-amber-400 mt-0.5">
                R$ {produto.precoVenda.toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-[#080c18] border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>Sim, Excluir do Cardápio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
