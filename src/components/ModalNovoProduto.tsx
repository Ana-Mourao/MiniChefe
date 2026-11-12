import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ProdutoVenda } from '../types';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  DollarSign,
  Clock,
  Tag,
  Package,
  Layers,
  Check,
  ChefHat,
  Image as ImageIcon,
  Flame,
  AlertCircle,
} from 'lucide-react';

interface ModalNovoProdutoProps {
  onClose: () => void;
  onCreated?: (produto: ProdutoVenda) => void;
  defaultCategoria?: 'Combos Kids' | 'Pizzas' | 'Lanches' | 'Bebidas' | 'Sobremesas';
}

const PRESET_IMAGENS = [
  {
    rotulo: 'Pizza Artesanal',
    categoria: 'Pizzas',
    url: '/src/assets/images/pizza_artesanal_1794496481086.jpg',
  },
  {
    rotulo: 'Combo Mini Chefe Kids',
    categoria: 'Combos Kids',
    url: '/src/assets/images/combo_kids_1794496482443.jpg',
  },
  {
    rotulo: 'Brownie de Chocolate',
    categoria: 'Sobremesas',
    url: '/src/assets/images/brownie_chocolate_1794496482239.jpg',
  },
  {
    rotulo: 'Suco Natural Maracujá',
    categoria: 'Bebidas',
    url: '/src/assets/images/suco_maracuja_1794496481870.jpg',
  },
  {
    rotulo: 'Banner do Mini Chefe',
    categoria: 'Geral',
    url: '/public/assets/aistudio/PHOTO-2026-09-16-14-34-02_d38a36e1.jpg',
  },
];

export const ModalNovoProduto: React.FC<ModalNovoProdutoProps> = ({
  onClose,
  onCreated,
  defaultCategoria = 'Combos Kids',
}) => {
  const { insumos, adicionarProduto } = useApp();

  const [categoria, setCategoria] = useState<'Combos Kids' | 'Pizzas' | 'Lanches' | 'Bebidas' | 'Sobremesas'>(
    defaultCategoria
  );
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [precoVenda, setPrecoVenda] = useState('18.00');
  const [tempoPreparo, setTempoPreparo] = useState('8');
  const [destaque, setDestaque] = useState(true);
  const [imagemUrl, setImagemUrl] = useState(
    defaultCategoria === 'Combos Kids'
      ? '/src/assets/images/combo_kids_1794496482443.jpg'
      : '/src/assets/images/pizza_artesanal_1794496481086.jpg'
  );

  // Ficha técnica (insumos)
  const [itensFicha, setItensFicha] = useState<Array<{ insumoId: number; quantidadeNecessaria: number }>>([
    // Default initial ingredient if available
    ...(insumos.length > 0 ? [{ insumoId: insumos[0].id, quantidadeNecessaria: 1 }] : []),
  ]);

  const [novoInsumoSelecionado, setNovoInsumoSelecionado] = useState<number>(insumos[0]?.id || 1);
  const [novaQtdInsumo, setNovaQtdInsumo] = useState<string>('1');
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const isCombo = categoria === 'Combos Kids';

  // Cost calculation
  const custoTotalInsumos = useMemo(() => {
    return itensFicha.reduce((acc, item) => {
      const ins = insumos.find((i) => i.id === item.insumoId);
      if (!ins) return acc;
      return acc + ins.custoUnitario * item.quantidadeNecessaria;
    }, 0);
  }, [itensFicha, insumos]);

  const precoVendaNum = parseFloat(precoVenda) || 0;
  const lucroEstimado = Math.max(0, precoVendaNum - custoTotalInsumos);
  const margemEstimada = precoVendaNum > 0 ? (lucroEstimado / precoVendaNum) * 100 : 0;

  const handleAdicionarInsumo = () => {
    const qtd = parseFloat(novaQtdInsumo);
    if (!qtd || qtd <= 0) return;

    const jaExiste = itensFicha.some((i) => i.insumoId === novoInsumoSelecionado);
    if (jaExiste) {
      setItensFicha((prev) =>
        prev.map((i) =>
          i.insumoId === novoInsumoSelecionado
            ? { ...i, quantidadeNecessaria: Number((i.quantidadeNecessaria + qtd).toFixed(3)) }
            : i
        )
      );
    } else {
      setItensFicha((prev) => [
        ...prev,
        { insumoId: novoInsumoSelecionado, quantidadeNecessaria: qtd },
      ]);
    }
  };

  const handleRemoverInsumo = (insumoId: number) => {
    setItensFicha((prev) => prev.filter((i) => i.insumoId !== insumoId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!nome.trim()) {
      setErro('Por favor, informe o nome do produto ou combo.');
      return;
    }

    if (!precoVendaNum || precoVendaNum <= 0) {
      setErro('O preço de venda deve ser maior que zero.');
      return;
    }

    const novoProd: Omit<ProdutoVenda, 'id'> = {
      nome: nome.trim(),
      descricao: descricao.trim() || `${categoria === 'Combos Kids' ? 'Combo Especial' : 'Produto'} Cantinho do Mini Chefe`,
      precoVenda: Number(precoVendaNum.toFixed(2)),
      categoria,
      ativo: true,
      tempoPreparoMinutos: parseInt(tempoPreparo, 10) || 5,
      destaque,
      imagemUrl: imagemUrl.trim() || undefined,
    };

    const criado = adicionarProduto(novoProd, itensFicha);
    setSucesso(true);

    setTimeout(() => {
      if (onCreated) onCreated(criado);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0a1022] rounded-3xl shadow-[0_0_40px_rgba(0,240,255,0.25)] max-w-2xl w-full overflow-hidden border border-cyan-500/40 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="bg-[#060b17] p-5 text-white flex items-center justify-between border-b border-cyan-500/25">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-lg ${
              isCombo
                ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-[0_0_15px_rgba(255,184,0,0.4)]'
                : 'bg-gradient-to-br from-cyan-400 to-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
            }`}>
              {isCombo ? <Sparkles className="w-5 h-5" /> : <ChefHat className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-brand font-bold text-base text-white flex items-center gap-2">
                <span className={isCombo ? 'neon-text-amber' : 'neon-text-cyan'}>
                  {isCombo ? 'Cadastrar Novo Combo Kids' : 'Cadastrar Novo Produto'}
                </span>
                <span className="text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 px-2 py-0.2 rounded-full uppercase">
                  {categoria}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Disponibilize novos itens para venda imediata no PDV e com baixa automática de estoque
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-slate-200 overflow-y-auto max-h-[75vh]">
          {erro && (
            <div className="bg-rose-950/70 border border-rose-500/50 p-3 rounded-xl flex items-center gap-2 text-rose-200 text-xs shadow-[0_0_12px_rgba(244,63,94,0.2)]">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* Category Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-cyan-300 block font-mono uppercase tracking-wider">
              1. Selecione a Categoria (Produto ou Combo):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['Combos Kids', 'Pizzas', 'Lanches', 'Bebidas', 'Sobremesas'] as const).map((cat) => {
                const selected = categoria === cat;
                const isComboItem = cat === 'Combos Kids';
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategoria(cat);
                      if (cat === 'Combos Kids' && !imagemUrl.includes('combo')) {
                        setImagemUrl('/src/assets/images/combo_kids_1794496482443.jpg');
                      }
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      selected
                        ? isComboItem
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(255,184,0,0.4)]'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                        : 'bg-[#060b17] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span>{cat}</span>
                    {isComboItem && (
                      <span className="text-[9px] bg-amber-500/30 text-amber-200 px-1.5 py-0.2 rounded font-mono">
                        COMBO
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Basic Info: Nome & Preço */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 block font-mono mb-1">
                Nome do {isCombo ? 'Combo' : 'Produto'} *
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder={isCombo ? 'Ex: Combo Mega Chefinho (Pizza + Refri + Brownie)' : 'Ex: Pizza Broto Quatro Queijos'}
                className="w-full px-3.5 py-2 text-xs bg-[#060b17] border border-cyan-500/30 text-white rounded-xl focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_#00f0ff] font-semibold"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-bold text-amber-300 block font-mono mb-1">
                Preço de Venda (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400 font-mono">
                  R$
                </span>
                <input
                  type="number"
                  step="0.10"
                  min="0.50"
                  value={precoVenda}
                  onChange={(e) => setPrecoVenda(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#060b17] border border-amber-500/40 text-amber-300 rounded-xl focus:outline-none focus:border-amber-400 focus:shadow-[0_0_10px_#ffb800] font-mono font-bold"
                  required
                />
              </div>
            </div>
          </div>

          {/* Descrição & Tempo de Preparo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 block font-mono mb-1">
                Descrição / Ingredientes que Acompanham
              </label>
              <input
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder={isCombo ? 'Ex: Inclui 1 Mini Pizza de Queijo, 1 Batata Frita e 1 Suco Natural' : 'Ex: Massa fofinha, molho artesanal e queijo duplo derretido'}
                className="w-full px-3 py-2 text-xs bg-[#060b17] border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block font-mono mb-1">
                Preparo Est. (minutos)
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={tempoPreparo}
                  onChange={(e) => setTempoPreparo(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-[#060b17] border border-slate-800 text-white rounded-xl focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Imagem do Produto / Combo */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-cyan-300 block font-mono uppercase tracking-wider flex items-center justify-between">
              <span>2. Imagem Visual do {isCombo ? 'Combo' : 'Produto'}:</span>
              <span className="text-[10px] text-slate-400 font-normal">Selecione um preset ou insira uma URL</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {PRESET_IMAGENS.map((preset) => {
                const isSelected = imagemUrl === preset.url;
                return (
                  <button
                    key={preset.rotulo}
                    type="button"
                    onClick={() => setImagemUrl(preset.url)}
                    className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer group flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_12px_rgba(0,240,255,0.35)]'
                        : 'border-slate-800 bg-[#060b17] hover:border-slate-700'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                      <img
                        src={preset.url}
                        alt={preset.rotulo}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 truncate w-full text-center">
                      {preset.rotulo}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={imagemUrl}
                onChange={(e) => setImagemUrl(e.target.value)}
                placeholder="Ou cole aqui a URL customizada da foto (ex: https://...)"
                className="flex-1 px-3 py-1.5 text-xs bg-[#060b17] border border-slate-800 text-cyan-200 placeholder:text-slate-600 rounded-xl focus:outline-none focus:border-cyan-400 font-mono"
              />
              {imagemUrl && (
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-cyan-500/40 shrink-0">
                  <img src={imagemUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Ficha Técnica & Insumos do Estoque */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-emerald-300 block font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  <span>3. Ficha Técnica / Insumos Baixados no Estoque:</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Cada vez que este {isCombo ? 'combo' : 'produto'} for vendido, esses insumos serão subtraídos automaticamente
                </p>
              </div>
            </div>

            {/* List of current recipe ingredients */}
            {itensFicha.length > 0 ? (
              <div className="divide-y divide-slate-800/80 bg-[#060b17] rounded-xl border border-slate-800/80 overflow-hidden">
                {itensFicha.map((it) => {
                  const ins = insumos.find((i) => i.id === it.insumoId);
                  const custo = ins ? ins.custoUnitario * it.quantidadeNecessaria : 0;
                  return (
                    <div
                      key={it.insumoId}
                      className="px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-900/50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {ins ? ins.nome : `Insumo #${it.insumoId}`}
                        </span>
                        <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-500/20">
                          {it.quantidadeNecessaria} {ins?.unidadeMedida}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                          Custo: R$ {custo.toFixed(2).replace('.', ',')}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoverInsumo(it.insumoId)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remover insumo da receita"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-3 bg-[#060b17] border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
                Nenhum insumo vinculado ainda. O produto não dará baixa automática até você adicionar insumos.
              </div>
            )}

            {/* Insumo Adder Row */}
            <div className="flex items-center gap-2 bg-[#070c18] p-2.5 rounded-xl border border-slate-800">
              <select
                value={novoInsumoSelecionado}
                onChange={(e) => setNovoInsumoSelecionado(Number(e.target.value))}
                className="flex-1 px-2.5 py-1.5 bg-[#060b17] text-xs font-semibold text-white border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {insumos.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nome} ({i.quantidadeAtual} {i.unidadeMedida} disp.)
                  </option>
                ))}
              </select>

              <div className="w-24">
                <input
                  type="number"
                  step="0.1"
                  min="0.01"
                  value={novaQtdInsumo}
                  onChange={(e) => setNovaQtdInsumo(e.target.value)}
                  placeholder="Qtd"
                  className="w-full px-2 py-1.5 bg-[#060b17] text-xs font-mono font-bold text-white border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-400 text-center"
                />
              </div>

              <button
                type="button"
                onClick={handleAdicionarInsumo}
                className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>

            {/* Live Financial Margin Calculation */}
            <div className="grid grid-cols-3 gap-2 bg-[#060b17] p-3 rounded-xl border border-cyan-500/20 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">Custo Total (CMV)</span>
                <span className="font-mono font-bold text-slate-200 tabular-nums">
                  R$ {custoTotalInsumos.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">Lucro Bruto Estimado</span>
                <span className="font-mono font-bold neon-text-lime tabular-nums">
                  R$ {lucroEstimado.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">Margem de Contribuição</span>
                <span className="font-mono font-bold text-emerald-400 tabular-nums">
                  {margemEstimada.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Destaque check */}
          <div className="flex items-center gap-2 pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={destaque}
                onChange={(e) => setDestaque(e.target.checked)}
                className="rounded border-cyan-500/50 text-cyan-400 focus:ring-cyan-400 w-4 h-4 cursor-pointer bg-slate-950"
              />
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Marcar como destaque de vendas no PDV</span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={sucesso}
              className={`px-6 py-2.5 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
                isCombo
                  ? 'bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 shadow-[0_0_20px_rgba(255,184,0,0.4)]'
                  : 'bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
              }`}
            >
              {sucesso ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Cadastrado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-slate-950" />
                  <span>{isCombo ? 'Incluir Combo Kids' : 'Incluir Produto no Cardápio'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
