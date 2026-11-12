import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TipoChavePix, ConfiguracaoPix } from '../types';
import {
  QrCode,
  Key,
  Building2,
  Mail,
  Phone,
  Hash,
  ShieldCheck,
  Check,
  X,
  Copy,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface ModalConfigurarPixProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const ModalConfigurarPix: React.FC<ModalConfigurarPixProps> = ({ onClose, onSuccess }) => {
  const { configuracaoPix, atualizarConfiguracaoPix } = useApp();

  const [tipoChave, setTipoChave] = useState<TipoChavePix>(configuracaoPix.tipoChave || 'EMAIL');
  const [chave, setChave] = useState<string>(configuracaoPix.chave || '');
  const [titular, setTitular] = useState<string>(configuracaoPix.titular || '');
  const [cidade, setCidade] = useState<string>(configuracaoPix.cidade || 'Fortaleza');
  const [banco, setBanco] = useState<string>(configuracaoPix.banco || 'Banco Inter / NuBank');

  const [copiado, setCopiado] = useState(false);
  const [salvoFeedback, setSalvoFeedback] = useState(false);

  const getPlaceholder = (tipo: TipoChavePix) => {
    switch (tipo) {
      case 'CNPJ':
        return '12.345.678/0001-90';
      case 'EMAIL':
        return 'pagamentos@minichefe.com.br';
      case 'TELEFONE':
        return '(85) 99876-5432';
      case 'CPF':
        return '123.456.789-00';
      case 'ALEATORIA':
      default:
        return '123e4567-e89b-12d3-a456-426614174000';
    }
  };

  const aplicarExemplo = (tipo: TipoChavePix, valor: string, inst: string) => {
    setTipoChave(tipo);
    setChave(valor);
    setBanco(inst);
  };

  const handleCopiarChave = () => {
    if (!chave) return;
    navigator.clipboard.writeText(chave).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chave.trim()) return;

    const novaConfig: ConfiguracaoPix = {
      tipoChave,
      chave: chave.trim(),
      titular: titular.trim() || 'Cantinho do Mini Chefe',
      cidade: cidade.trim() || 'Fortaleza',
      banco: banco.trim() || 'Instituição Financeira',
    };

    atualizarConfiguracaoPix(novaConfig);
    setSalvoFeedback(true);
    setTimeout(() => {
      setSalvoFeedback(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0a1022] rounded-3xl shadow-[0_0_40px_rgba(0,255,136,0.25)] max-w-lg w-full overflow-hidden border border-emerald-500/40 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="bg-[#060b17] p-5 text-white flex items-center justify-between border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-[0_0_15px_rgba(0,255,136,0.4)]">
              <QrCode className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="font-brand font-bold text-base text-white neon-text-lime flex items-center gap-2">
                <span>Configurar Chave PIX</span>
                <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.2 rounded-full">
                  Recebimento
                </span>
              </h3>
              <p className="text-xs text-cyan-300 font-mono">
                Defina a chave onde os pagamentos do PDV serão depositados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSalvar} className="p-6 space-y-5 text-slate-200 overflow-y-auto max-h-[75vh]">
          {/* Live Preview Card */}
          <div className="bg-[#071318] p-4 rounded-2xl border border-emerald-500/40 shadow-[0_0_20px_rgba(0,255,136,0.12)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Prévia do QR Code &amp; Cobrança no Caixa</span>
              </span>
              <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                {tipoChave}
              </span>
            </div>

            <div className="flex items-center gap-3.5 pt-1">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-emerald-500/40 shadow-[0_0_12px_rgba(0,255,136,0.25)] shrink-0">
                <QrCode className="w-12 h-12 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0 space-y-0.5">
                <span className="text-[10px] text-slate-400 block font-mono">CHAVE CONFIGURADA:</span>
                <p className="font-mono font-bold text-sm text-emerald-300 truncate">
                  {chave || 'Nenhuma chave informada'}
                </p>
                <p className="text-xs text-white truncate font-semibold">
                  {titular || 'Cantinho do Mini Chefe'} &bull; <span className="text-slate-400 font-normal">{cidade}</span>
                </p>
                {banco && (
                  <span className="text-[10px] text-cyan-300 font-mono block">
                    Instituição: {banco}
                  </span>
                )}
              </div>
            </div>

            {chave && (
              <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">Teste de cópia rápida:</span>
                <button
                  type="button"
                  onClick={handleCopiarChave}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/40 font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copiado ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Chave Copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copiar Chave</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Tipo de Chave Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-emerald-300 block font-mono uppercase tracking-wider">
              1. Selecione o Tipo da Chave:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { id: 'CNPJ', label: 'CNPJ', icon: Building2 },
                { id: 'EMAIL', label: 'E-mail', icon: Mail },
                { id: 'TELEFONE', label: 'Celular', icon: Phone },
                { id: 'ALEATORIA', label: 'Aleatória', icon: Key },
                { id: 'CPF', label: 'CPF', icon: Hash },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = tipoChave === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTipoChave(t.id as TipoChavePix)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer font-mono ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_12px_rgba(0,255,136,0.3)]'
                        : 'bg-[#060b17] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Valor da Chave PIX Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-emerald-300 block font-mono uppercase tracking-wider">
              2. Valor da Chave PIX:
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-mono">
                <Key className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={chave}
                onChange={(e) => setChave(e.target.value)}
                placeholder={getPlaceholder(tipoChave)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#060b17] border-2 border-emerald-500/40 rounded-xl text-emerald-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 focus:shadow-[0_0_15px_rgba(0,255,136,0.3)] font-mono font-bold transition-all"
                required
                autoFocus
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 pt-1 flex-wrap">
              <span className="text-[10px] text-slate-400 font-mono">Exemplos rápidos:</span>
              <button
                type="button"
                onClick={() =>
                  aplicarExemplo(
                    'EMAIL',
                    'cantinho.minichefe@pagamentos.com.br',
                    'Banco Inter'
                  )
                }
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#060b17] hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer"
              >
                E-mail Oficial
              </button>
              <button
                type="button"
                onClick={() =>
                  aplicarExemplo('CNPJ', '45.892.124/0001-88', 'NuBank PJ')
                }
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#060b17] hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer"
              >
                CNPJ Empresa
              </button>
              <button
                type="button"
                onClick={() =>
                  aplicarExemplo('TELEFONE', '(85) 99876-5432', 'C6 Bank')
                }
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#060b17] hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer"
              >
                Celular Balcão
              </button>
            </div>
          </div>

          {/* Nome do Titular & Cidade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block font-mono mb-1">
                Nome do Titular / Razão Social:
              </label>
              <input
                type="text"
                value={titular}
                onChange={(e) => setTitular(e.target.value)}
                placeholder="Cantinho do Mini Chefe Fast Food"
                className="w-full px-3 py-2 text-xs bg-[#060b17] border border-slate-800 text-white rounded-xl focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block font-mono mb-1">
                Cidade da Conta:
              </label>
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Fortaleza"
                className="w-full px-3 py-2 text-xs bg-[#060b17] border border-slate-800 text-white rounded-xl focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Banco / Instituição Financeira */}
          <div>
            <label className="text-xs font-bold text-slate-300 block font-mono mb-1">
              Instituição Financeira / Banco (opcional):
            </label>
            <input
              type="text"
              value={banco}
              onChange={(e) => setBanco(e.target.value)}
              placeholder="Ex: Banco Inter, Nubank, Itaú, Bradesco..."
              className="w-full px-3 py-2 text-xs bg-[#060b17] border border-slate-800 text-white rounded-xl focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="bg-cyan-950/40 border border-cyan-500/30 p-3 rounded-xl text-xs text-cyan-200 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span className="text-[11px] leading-relaxed">
              Ao salvar, a nova chave PIX passará a ser exibida imediatamente na tela de pagamento do PDV, nas cobranças via QR Code dinâmico e na impressão dos comprovantes fiscais.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvoFeedback}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_20px_rgba(0,255,136,0.35)] transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {salvoFeedback ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Chave PIX Salva!</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 text-slate-950" />
                  <span>Salvar Nova Chave PIX</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
