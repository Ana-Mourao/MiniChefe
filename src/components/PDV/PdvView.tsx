import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ProdutoVenda, FormaPagamento } from '../../types';
import { ModalComprovante } from '../ModalComprovante';
import { ModalEditarPreco } from '../ModalEditarPreco';
import { ModalCriarImagemProduto } from '../ModalCriarImagemProduto';
import { ModalConfigurarPix } from '../ModalConfigurarPix';
import { ModalNovoProduto } from '../ModalNovoProduto';
import { ModalConfirmarExclusao } from '../ModalConfirmarExclusao';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Clock,
  Sparkles,
  QrCode,
  CreditCard,
  Banknote,
  DollarSign,
  AlertCircle,
  MessageSquare,
  Flame,
  CheckCircle,
  Tag,
  Edit3,
  Printer,
  Camera,
  Image as ImageIcon,
  Key,
  Copy,
  Check,
} from 'lucide-react';

interface CartItem {
  produto: ProdutoVenda;
  quantidade: number;
  observacao: string;
}

export const PdvView: React.FC = () => {
  const {
    produtos,
    criarPedido,
    verificarDisponibilidade,
    ultimoPedidoCriado,
    configuracaoPix,
    excluirProduto,
  } = useApp();

  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('Todos');
  const [busca, setBusca] = useState<string>('');
  const [carrinho, setCarrinho] = useState<CartItem[]>([]);
  const [clienteNome, setClienteNome] = useState<string>('');
  const [tipoAtendimento, setTipoAtendimento] = useState<'BALCAO' | 'MESA' | 'DELIVERY'>('BALCAO');
  const [observacoesGerais, setObservacoesGerais] = useState<string>('');

  // Payment Modal state
  const [modalPagamentoAberto, setModalPagamentoAberto] = useState<boolean>(false);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('PIX');
  const [valorRecebido, setValorRecebido] = useState<string>('');
  const [comprovanteAberto, setComprovanteAberto] = useState<boolean>(false);
  const [erroEstoque, setErroEstoque] = useState<string | null>(null);
  const [produtoEditandoPreco, setProdutoEditandoPreco] = useState<ProdutoVenda | null>(null);
  const [produtoEditandoImagem, setProdutoEditandoImagem] = useState<ProdutoVenda | null>(null);
  const [produtoExcluindo, setProdutoExcluindo] = useState<ProdutoVenda | null>(null);
  const [modalTabelaPrecosAberto, setModalTabelaPrecosAberto] = useState<boolean>(false);
  const [modalNovoProdutoAberto, setModalNovoProdutoAberto] = useState<boolean>(false);
  const [modalPixAberto, setModalPixAberto] = useState<boolean>(false);
  const [pixCopiado, setPixCopiado] = useState<boolean>(false);

  // Observation popover or inline modal
  const [itemObsEditando, setItemObsEditando] = useState<number | null>(null);
  const [textoObs, setTextoObs] = useState<string>('');

  const categorias = ['Todos', 'Pizzas', 'Bebidas', 'Sobremesas', 'Combos Kids', 'Lanches'];

  // Filter products
  const produtosFiltrados = useMemo(() => {
    return produtos.filter((p) => {
      const matchCat = categoriaAtiva === 'Todos' || p.categoria === categoriaAtiva;
      const matchBusca =
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        p.descricao.toLowerCase().includes(busca.toLowerCase());
      return matchCat && matchBusca && p.ativo;
    });
  }, [produtos, categoriaAtiva, busca]);

  // Cart operations
  const adicionarAoCarrinho = (produto: ProdutoVenda) => {
    setErroEstoque(null);
    setCarrinho((prev) => {
      const index = prev.findIndex((item) => item.produto.id === produto.id);
      if (index >= 0) {
        const novaQtd = prev[index].quantidade + 1;
        const disp = verificarDisponibilidade(produto.id, novaQtd);
        if (!disp.disponivel) {
          setErroEstoque(disp.motivo || 'Estoque insuficiente para adicionar mais unidades.');
          return prev;
        }
        const updated = [...prev];
        updated[index] = { ...updated[index], quantidade: novaQtd };
        return updated;
      } else {
        const disp = verificarDisponibilidade(produto.id, 1);
        if (!disp.disponivel) {
          setErroEstoque(disp.motivo || 'Insumo em falta no estoque.');
          return prev;
        }
        return [...prev, { produto, quantidade: 1, observacao: '' }];
      }
    });
  };

  const alterarQuantidade = (produtoId: number, delta: number) => {
    setErroEstoque(null);
    setCarrinho((prev) => {
      return prev
        .map((item) => {
          if (item.produto.id === produtoId) {
            const novaQtd = item.quantidade + delta;
            if (novaQtd <= 0) return null;
            const disp = verificarDisponibilidade(produtoId, novaQtd);
            if (!disp.disponivel) {
              setErroEstoque(disp.motivo || 'Estoque insuficiente.');
              return item;
            }
            return { ...item, quantidade: novaQtd };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removerDoCarrinho = (produtoId: number) => {
    setCarrinho((prev) => prev.filter((item) => item.produto.id !== produtoId));
  };

  const totalCarrinho = useMemo(() => {
    return carrinho.reduce((acc, item) => acc + item.produto.precoVenda * item.quantidade, 0);
  }, [carrinho]);

  const trocoCalculado = useMemo(() => {
    if (formaPagamento !== 'DINHEIRO') return 0;
    const rec = parseFloat(valorRecebido.replace(',', '.')) || 0;
    return Math.max(0, rec - totalCarrinho);
  }, [formaPagamento, valorRecebido, totalCarrinho]);

  const salvarObservacao = (produtoId: number) => {
    setCarrinho((prev) =>
      prev.map((item) =>
        item.produto.id === produtoId ? { ...item, observacao: textoObs } : item
      )
    );
    setItemObsEditando(null);
    setTextoObs('');
  };

  const abrirModalPagamento = () => {
    if (carrinho.length === 0) return;
    setValorRecebido(totalCarrinho.toFixed(2));
    setModalPagamentoAberto(true);
  };

  const [imprimirAutomatico, setImprimirAutomatico] = useState<boolean>(true);
  const [deveImprimirComprovante, setDeveImprimirComprovante] = useState<boolean>(false);

  const confirmarPedidoFinal = (deveImprimir?: boolean) => {
    const valorPagoNum = parseFloat(valorRecebido.replace(',', '.')) || totalCarrinho;
    const imprimir = deveImprimir !== undefined ? deveImprimir : imprimirAutomatico;

    const res = criarPedido({
      clienteNome: clienteNome || 'Cliente Balcão',
      tipoAtendimento,
      itens: carrinho.map((it) => ({
        produtoId: it.produto.id,
        quantidade: it.quantidade,
        observacao: it.observacao,
      })),
      formaPagamento,
      valorPago: valorPagoNum,
      valorTroco: trocoCalculado,
      observacoesGerais,
    });

    if (res.success) {
      setModalPagamentoAberto(false);
      setCarrinho([]);
      setClienteNome('');
      setObservacoesGerais('');
      setDeveImprimirComprovante(imprimir);
      setComprovanteAberto(true);
    } else {
      setErroEstoque(res.error || 'Erro ao processar pedido.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Mini Chefe Promo Banner */}
      <div className="mb-6 bg-gradient-to-r from-[#0a1024] via-[#0d1630] to-[#14122c] rounded-2xl p-4 sm:p-5 text-white shadow-[0_0_25px_rgba(0,240,255,0.12)] border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src="/assets/aistudio/PHOTO-2026-09-16-14-34-02_d38a36e1.jpg"
              alt="Cantinho do Mini Chefe"
              className="w-16 h-16 rounded-xl object-cover object-top border-2 border-amber-400 shadow-[0_0_15px_rgba(255,184,0,0.5)] shrink-0"
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-[0_0_8px_#00ff88]"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-brand font-black text-xl neon-text-amber">
                Cantinho do Mini Chefe
              </span>
              <span className="text-[10px] bg-cyan-500/15 text-cyan-300 px-2 py-0.5 rounded-full font-bold border border-cyan-400/40 shadow-[0_0_8px_rgba(0,240,255,0.25)]">
                Cyber Promoção
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Pequeno chefe e grandes sabores &bull; Pizza Artesanal R$ 5,50 &bull; Suco Natural R$ 5,00 &bull; Brownie R$ 6,00
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <button
            onClick={() => {
              // Quick combo add
              const combo = produtos.find((p) => p.categoria === 'Combos Kids');
              if (combo) adicionarAoCarrinho(combo);
            }}
            className="w-full md:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-xs rounded-xl transition-all shadow-[0_0_18px_rgba(255,184,0,0.5)] hover:shadow-[0_0_25px_rgba(255,184,0,0.7)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Lançar Combo Mini Chefe (R$ 15,00)</span>
          </button>
        </div>
      </div>

      {erroEstoque && (
        <div className="mb-4 bg-rose-950/70 border border-rose-500/50 text-rose-200 px-4 py-3 rounded-xl flex items-center justify-between text-xs shadow-[0_0_15px_rgba(244,63,94,0.25)]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
            <span>{erroEstoque}</span>
          </div>
          <button
            onClick={() => setErroEstoque(null)}
            className="font-bold text-rose-300 hover:text-white cursor-pointer ml-4"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Main Grid: Products (2/3) + Cart Order Ticket (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Section: Catalog & Filter */}
        <div className="lg:col-span-8 space-y-4">
          {/* Search & Categories Bar */}
          <div className="bg-[#0a1020]/90 backdrop-blur-md p-3.5 rounded-2xl shadow-[0_0_20px_rgba(0,240,255,0.06)] border border-cyan-500/25 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar produto por nome ou ingrediente..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-[#060b17] border border-cyan-500/30 text-cyan-100 placeholder:text-slate-500 rounded-xl focus:bg-[#080f20] focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all"
              />
              {busca && (
                <button
                  onClick={() => setBusca('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-cyan-300"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Category Segmented Control & Price Edit Shortcut */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {categorias.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoriaAtiva(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      categoriaAtiva === cat
                        ? 'bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.6)] border border-cyan-200'
                        : 'bg-slate-900/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalNovoProdutoAberto(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] whitespace-nowrap transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title="Incluir novo produto ou combo no cardápio"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-950 font-black" />
                  <span>Novo Item / Combo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalPixAberto(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-400/40 shadow-[0_0_10px_rgba(0,255,136,0.2)] whitespace-nowrap transition-all cursor-pointer"
                  title="Visualizar ou alterar chave PIX da loja"
                >
                  <Key className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Chave PIX</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTabelaPrecosAberto(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-400/40 shadow-[0_0_10px_rgba(255,184,0,0.2)] whitespace-nowrap transition-all cursor-pointer"
                  title="Visualizar e alterar preços de produtos e combos"
                >
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Alterar Preços</span>
                </button>
              </div>
            </div>
          </div>

          {/* Product Cards Grid with Visual Image Showcase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {produtosFiltrados.map((prod) => {
              const disp = verificarDisponibilidade(prod.id, 1);
              const isCombo = prod.categoria === 'Combos Kids';

              return (
                <div
                  key={prod.id}
                  className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                    disp.disponivel
                      ? 'bg-[#0c1426]/90 backdrop-blur-md border-cyan-500/25 hover:border-cyan-400 hover:shadow-[0_0_22px_rgba(0,240,255,0.28)] hover:-translate-y-0.5 cursor-pointer'
                      : 'bg-[#070b16]/60 border-slate-800 opacity-60 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (disp.disponivel) adicionarAoCarrinho(prod);
                  }}
                >
                  {/* Product Visual Image Banner */}
                  <div className="h-36 w-full relative overflow-hidden bg-slate-950 border-b border-cyan-500/20 group/img">
                    {prod.imagemUrl ? (
                      <img
                        src={prod.imagemUrl}
                        alt={prod.nome}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0c1426] via-[#101b34] to-[#080d1a] text-slate-500">
                        <ImageIcon className="w-8 h-8 text-cyan-400/40 mb-1" />
                        <span className="text-[10px] font-mono text-cyan-400/60">Sem foto definida</span>
                      </div>
                    )}

                    {/* Dark gradient shadow for crisp badge legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c1426] via-transparent to-black/60 pointer-events-none" />

                    {/* Top Overlay Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 z-10">
                      <span className="text-[10px] font-bold text-cyan-300 bg-black/70 backdrop-blur-xs border border-cyan-500/40 px-2 py-0.5 rounded-md shadow-[0_0_8px_rgba(0,240,255,0.3)] uppercase tracking-wider font-mono">
                        {prod.categoria}
                      </span>

                      {/* Button to Create / Change Image */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProdutoEditandoImagem(prod);
                        }}
                        className="px-2 py-1 rounded-lg bg-black/75 hover:bg-black text-cyan-300 hover:text-white border border-cyan-500/40 backdrop-blur-xs transition-all shadow-[0_0_10px_rgba(0,240,255,0.3)] hover:scale-105 cursor-pointer flex items-center gap-1 text-[10px] font-mono"
                        title="Criar ou alterar foto deste produto com IA ou galeria"
                      >
                        <Camera className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="hidden sm:inline">Foto</span>
                      </button>
                    </div>

                    {/* Bottom Prep Time Tag on Image */}
                    <div className="absolute bottom-2 left-2.5 flex items-center gap-1 text-[10px] font-mono font-bold text-slate-300 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded border border-white/10">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{prod.tempoPreparoMinutos} min</span>
                    </div>

                    {isCombo && (
                      <div className="absolute bottom-2 right-2.5 flex items-center gap-1 text-[9px] font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-500/50 px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(255,184,0,0.3)]">
                        <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
                        <span>Combo</span>
                      </div>
                    )}
                  </div>

                  {/* Card Header & Content */}
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-brand font-bold text-white text-base leading-snug group-hover:text-cyan-300 transition-colors">
                        {prod.nome}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {prod.descricao}
                      </p>
                    </div>

                    {isCombo && (
                      <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-400/40 px-2 py-0.5 rounded-md shadow-[0_0_10px_rgba(255,184,0,0.2)]">
                        <span>Pizza + Suco Natural + Brownie</span>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Price & Quick Action */}
                  <div className="px-4 py-3 bg-[#070d1c]/90 border-t border-cyan-500/15 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">PREÇO</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-brand font-black text-base neon-text-amber tabular-nums">
                          R$ {prod.precoVenda.toFixed(2).replace('.', ',')}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProdutoEditandoPreco(prod);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/20 transition-colors cursor-pointer"
                          title="Alterar preço deste produto ou combo"
                        >
                          <Tag className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProdutoExcluindo(prod);
                          }}
                          className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                          title="Excluir produto ou combo do cardápio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {disp.disponivel ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          adicionarAoCarrinho(prod);
                        }}
                        className="w-8 h-8 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 text-slate-950 flex items-center justify-center font-black shadow-[0_0_12px_rgba(0,240,255,0.55)] transition-all active:scale-95 cursor-pointer"
                        title="Adicionar ao Pedido"
                      >
                        <Plus className="w-4 h-4 text-slate-950" />
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-950/80 border border-rose-500/40 px-2 py-1 rounded">
                        Sem Estoque
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {produtosFiltrados.length === 0 && (
            <div className="bg-[#0a1020]/90 rounded-2xl border border-cyan-500/20 p-8 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto text-cyan-400/50 mb-2 animate-bounce" />
              <p className="text-sm font-semibold text-slate-200">Nenhum produto encontrado</p>
              <p className="text-xs text-slate-400 mt-1">
                Tente buscar com outro termo ou selecionar outra categoria.
              </p>
            </div>
          )}
        </div>

        {/* Right Section: Interactive Fast Food Cart / Comanda */}
        <div className="lg:col-span-4 bg-[#0a1022]/95 backdrop-blur-xl rounded-2xl shadow-[0_0_25px_rgba(0,240,255,0.12)] border border-cyan-500/30 flex flex-col sticky top-20 overflow-hidden">
          {/* Cart Header */}
          <div className="p-4 border-b border-cyan-500/25 bg-[#070b17] text-white flex items-center justify-between">
            <div>
              <h2 className="font-brand font-bold text-base text-white flex items-center gap-2">
                <span>Comanda do Pedido</span>
                <span className="text-xs bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 px-2 py-0.2 rounded-full font-black shadow-[0_0_10px_rgba(0,240,255,0.6)]">
                  {carrinho.reduce((a, b) => a + b.quantidade, 0)}
                </span>
              </h2>
              <p className="text-[11px] text-cyan-300/80 font-mono">Terminal KDS Integrado</p>
            </div>
            {carrinho.length > 0 && (
              <button
                onClick={() => setCarrinho([])}
                className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                title="Limpar comanda"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>
            )}
          </div>

          {/* Customer & Type Selector */}
          <div className="p-4 border-b border-cyan-500/15 bg-[#060b17]/80 space-y-3">
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#091024] border border-cyan-500/25 rounded-xl">
              {(['BALCAO', 'MESA', 'DELIVERY'] as const).map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => setTipoAtendimento(tipo)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    tipoAtendimento === tipo
                      ? 'bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.6)]'
                      : 'text-slate-400 hover:text-cyan-300'
                  }`}
                >
                  {tipo === 'BALCAO' ? 'Balcão' : tipo === 'MESA' ? 'Mesa' : 'Delivery'}
                </button>
              ))}
            </div>

            <div>
              <input
                type="text"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                placeholder="Nome do Cliente ou Nº da Mesa (opcional)"
                className="w-full px-3 py-1.5 text-xs bg-[#080e1e] border border-cyan-500/30 text-cyan-100 placeholder:text-slate-500 rounded-lg focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all"
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="p-4 flex-1 overflow-y-auto max-h-[340px] divide-y divide-slate-800/80 space-y-2">
            {carrinho.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                  <Plus className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-200">Comanda vazia</p>
                <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                  Clique nos lanches, pizzas e sucos ao lado para adicionar ao pedido.
                </p>
              </div>
            ) : (
              carrinho.map((item) => (
                <div key={item.produto.id} className="pt-2 first:pt-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className="font-semibold text-xs text-white leading-tight block">
                        {item.produto.nome}
                      </span>
                      <span className="text-[11px] text-slate-400 tabular-nums font-mono">
                        R$ {item.produto.precoVenda.toFixed(2).replace('.', ',')} un.
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-brand font-black text-xs neon-text-amber tabular-nums block">
                        R$ {(item.produto.precoVenda * item.quantidade).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* Quantity & Actions Bar */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    {/* Add note toggle */}
                    <button
                      onClick={() => {
                        setItemObsEditando(item.produto.id);
                        setTextoObs(item.observacao || '');
                      }}
                      className="text-[11px] text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>{item.observacao ? 'Editar obs' : '+ Obs'}</span>
                    </button>

                    {/* Stepper */}
                    <div className="flex items-center gap-1.5 bg-[#080d1a] border border-cyan-500/20 p-0.5 rounded-lg">
                      <button
                        onClick={() => alterarQuantidade(item.produto.id, -1)}
                        className="w-5 h-5 rounded bg-slate-800 text-cyan-300 flex items-center justify-center hover:bg-cyan-500 hover:text-slate-950 transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-bold text-xs text-white tabular-nums font-mono">
                        {item.quantidade}
                      </span>
                      <button
                        onClick={() => alterarQuantidade(item.produto.id, 1)}
                        className="w-5 h-5 rounded bg-slate-800 text-cyan-300 flex items-center justify-center hover:bg-cyan-500 hover:text-slate-950 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removerDoCarrinho(item.produto.id)}
                      className="text-slate-400 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                      title="Remover item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Active observation display */}
                  {item.observacao && (
                    <div className="text-[10px] bg-cyan-950/60 text-cyan-200 px-2 py-1 rounded border border-cyan-500/40 flex items-center justify-between">
                      <span>Obs: {item.observacao}</span>
                      <button
                        onClick={() => {
                          setCarrinho((prev) =>
                            prev.map((i) =>
                              i.produto.id === item.produto.id ? { ...i, observacao: '' } : i
                            )
                          );
                        }}
                        className="text-cyan-400 hover:text-white ml-1 font-bold"
                      >
                        &times;
                      </button>
                    </div>
                  )}

                  {/* Editing observation modal inline */}
                  {itemObsEditando === item.produto.id && (
                    <div className="p-2 bg-[#080d1c] border border-cyan-500/30 rounded-lg space-y-2 mt-1">
                      <input
                        type="text"
                        value={textoObs}
                        onChange={(e) => setTextoObs(e.target.value)}
                        placeholder="Ex: Sem cebola, massa bem assada, etc."
                        className="w-full px-2 py-1 text-xs bg-slate-950 border border-cyan-500/40 text-cyan-100 rounded focus:outline-none focus:border-cyan-400"
                        autoFocus
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setItemObsEditando(null)}
                          className="px-2 py-0.5 text-[10px] text-slate-400 bg-slate-800 rounded hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => salvarObservacao(item.produto.id)}
                          className="px-2 py-0.5 text-[10px] text-slate-950 bg-cyan-400 rounded font-bold hover:bg-cyan-300"
                        >
                          Salvar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Cart Summary & Checkout */}
          {carrinho.length > 0 && (
            <div className="p-4 bg-[#070c18] border-t border-cyan-500/20 space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Subtotal ({carrinho.reduce((a, b) => a + b.quantidade, 0)} itens)</span>
                <span className="tabular-nums font-mono text-slate-300">
                  R$ {totalCarrinho.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-slate-800">
                <span className="font-brand font-bold text-slate-300 text-sm">TOTAL</span>
                <span className="font-brand font-black text-2xl neon-text-cyan tabular-nums">
                  R$ {totalCarrinho.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <button
                onClick={abrirModalPagamento}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-300 hover:from-emerald-300 hover:to-cyan-200 text-slate-950 font-black text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,136,0.6)] hover:shadow-[0_0_28px_rgba(0,255,136,0.8)] flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Cobrar Pedido</span>
                <span>&bull;</span>
                <span className="tabular-nums">R$ {totalCarrinho.toFixed(2).replace('.', ',')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Pagamento & Conclusão */}
      {modalPagamentoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0c1427] rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.25)] max-w-lg w-full overflow-hidden border border-cyan-500/40 text-white animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-[#070c18] p-5 text-white border-b border-cyan-500/25 flex items-center justify-between">
              <div>
                <h3 className="font-brand font-bold text-lg neon-text-amber">
                  Pagamento &amp; Finalização
                </h3>
                <p className="text-xs text-cyan-300 font-mono">
                  Total da Venda: R$ {totalCarrinho.toFixed(2).replace('.', ',')}
                </p>
              </div>
              <button
                onClick={() => setModalPagamentoAberto(false)}
                className="text-slate-400 hover:text-white cursor-pointer text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Payment Methods Tabs */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2 uppercase tracking-wider font-mono">
                  Selecione a Forma de Pagamento
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'PIX', label: 'PIX Instantâneo', icon: QrCode },
                    { id: 'CARTAO_CREDITO', label: 'Crédito', icon: CreditCard },
                    { id: 'CARTAO_DEBITO', label: 'Débito', icon: CreditCard },
                    { id: 'DINHEIRO', label: 'Dinheiro', icon: Banknote },
                  ].map((f) => {
                    const Icon = f.icon;
                    const isSelected = formaPagamento === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setFormaPagamento(f.id as FormaPagamento);
                          setValorRecebido(totalCarrinho.toFixed(2));
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/15 text-amber-200 font-bold shadow-[0_0_15px_rgba(255,184,0,0.3)]'
                            : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-amber-400 drop-shadow-[0_0_6px_#ffb800]' : 'text-slate-400'}`} />
                        <span className="text-xs">{f.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PIX Details */}
              {formaPagamento === 'PIX' && (
                <div className="bg-[#071318] border border-emerald-500/40 rounded-xl p-4 text-center space-y-3 shadow-[0_0_20px_rgba(0,255,136,0.15)]">
                  <div className="inline-block p-2 bg-slate-950 rounded-lg border border-emerald-500/50 shadow-[0_0_15px_rgba(0,255,136,0.3)]">
                    <QrCode className="w-24 h-24 text-emerald-400 mx-auto" />
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span className="text-[10px] font-mono uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                        {configuracaoPix.tipoChave}
                      </span>
                      <span className="text-xs font-bold text-white font-mono">
                        {configuracaoPix.titular}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-300 block font-mono bg-slate-950/80 px-3 py-1.5 rounded-lg border border-emerald-500/30 break-all select-all">
                      Chave: {configuracaoPix.chave}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Banco: <span className="text-emerald-400 font-semibold">{configuracaoPix.banco}</span> &bull; {configuracaoPix.cidade}
                    </div>
                    <span className="text-[11px] text-cyan-300/90 font-medium block mt-1">
                      QR Code dinâmico no valor exato de <strong className="text-amber-400">R$ {totalCarrinho.toFixed(2).replace('.', ',')}</strong>
                    </span>
                  </div>

                  {/* Actions: Copiar Chave and Alterar Chave */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (!configuracaoPix.chave) return;
                        navigator.clipboard.writeText(configuracaoPix.chave).then(() => {
                          setPixCopiado(true);
                          setTimeout(() => setPixCopiado(false), 2000);
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/40 font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      {pixCopiado ? (
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

                    <button
                      type="button"
                      onClick={() => setModalPixAberto(true)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-cyan-300 hover:bg-slate-800 border border-cyan-500/40 font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 hover:text-white"
                      title="Alterar chave PIX da loja"
                    >
                      <Key className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Alterar Chave PIX</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-400 font-semibold pt-1">
                    <CheckCircle className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>Aguardando compensação instantânea...</span>
                  </div>
                </div>
              )}

              {/* Dinheiro Details */}
              {formaPagamento === 'DINHEIRO' && (
                <div className="bg-[#121220] border border-amber-500/40 rounded-xl p-4 space-y-3 shadow-[0_0_20px_rgba(255,184,0,0.15)]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-200">Valor Recebido (R$):</label>
                    <input
                      type="number"
                      step="0.50"
                      value={valorRecebido}
                      onChange={(e) => setValorRecebido(e.target.value)}
                      className="w-32 px-3 py-1.5 text-right font-mono font-bold text-sm bg-slate-950 border border-amber-400/50 text-amber-300 rounded-lg focus:outline-none focus:border-amber-400 focus:shadow-[0_0_10px_#ffb800]"
                    />
                  </div>

                  {/* Fast cash shortcuts */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-400">Atalhos:</span>
                    {[totalCarrinho, 10, 20, 50, 100].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setValorRecebido(val.toFixed(2))}
                        className="px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 hover:border-amber-400 rounded-md font-semibold text-slate-300 hover:text-amber-300 cursor-pointer shadow-xs"
                      >
                        R$ {val.toFixed(2).replace('.', ',')}
                      </button>
                    ))}
                  </div>

                  {/* Calculated Change */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Troco a devolver:</span>
                    <span className="font-brand font-black text-lg neon-text-lime tabular-nums">
                      R$ {trocoCalculado.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              )}

              {/* Cartão Details */}
              {(formaPagamento === 'CARTAO_CREDITO' || formaPagamento === 'CARTAO_DEBITO') && (
                <div className="bg-[#090f20] border border-cyan-500/30 rounded-xl p-4 space-y-2 text-center">
                  <CreditCard className="w-8 h-8 text-cyan-400 mx-auto drop-shadow-[0_0_8px_#00f0ff]" />
                  <p className="text-xs font-semibold text-slate-200">
                    Aproxime ou insira o cartão na maquininha
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Valor a ser debitado:{' '}
                    <strong className="neon-text-cyan font-mono text-sm ml-1">
                      R$ {totalCarrinho.toFixed(2).replace('.', ',')}
                    </strong>
                  </p>
                </div>
              )}
            </div>

            {/* Thermal Print Checkbox in checkout */}
            <div className="px-6 py-2.5 bg-[#080d1a] border-t border-cyan-500/20 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={imprimirAutomatico}
                  onChange={(e) => setImprimirAutomatico(e.target.checked)}
                  className="rounded border-cyan-500/50 text-cyan-400 focus:ring-cyan-400 w-4 h-4 cursor-pointer bg-slate-950"
                />
                <Printer className="w-4 h-4 text-cyan-400" />
                <span>Imprimir comprovante térmico automaticamente</span>
              </label>
              <span className="text-[11px] text-cyan-400/80 font-mono">Padrão 80mm / 58mm</span>
            </div>

            {/* Modal Actions */}
            <div className="bg-[#070c18] p-4 border-t border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setModalPagamentoAberto(false)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Voltar
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => confirmarPedidoFinal(false)}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Concluir sem Imprimir
                </button>
                <button
                  type="button"
                  onClick={() => confirmarPedidoFinal(true)}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-300 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_18px_rgba(0,255,136,0.6)] hover:shadow-[0_0_25px_rgba(0,255,136,0.8)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-950" />
                  <span>Concluir &amp; Imprimir Pedido</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {comprovanteAberto && ultimoPedidoCriado && (
        <ModalComprovante
          pedido={ultimoPedidoCriado}
          autoPrint={deveImprimirComprovante}
          onClose={() => {
            setComprovanteAberto(false);
            setDeveImprimirComprovante(false);
          }}
        />
      )}

      {/* Edit Single Product/Combo Price Modal */}
      {produtoEditandoPreco && (
        <ModalEditarPreco
          produto={produtoEditandoPreco}
          onClose={() => setProdutoEditandoPreco(null)}
        />
      )}

      {/* Full Menu Price Table Modal */}
      {modalTabelaPrecosAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0c1427] rounded-3xl shadow-[0_0_40px_rgba(255,184,0,0.25)] max-w-2xl w-full overflow-hidden border border-amber-500/40 text-white animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#070c18] p-5 text-white border-b border-amber-500/25 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-[0_0_15px_rgba(255,184,0,0.5)]">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-brand font-bold text-base neon-text-amber">
                    Gestão do Cardápio &amp; Combos
                  </h3>
                  <p className="text-xs text-slate-400">
                    Inclua novos itens, altere preços e gerencie os combos do fast food
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovoProdutoAberto(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.4)] cursor-pointer hover:scale-105 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-950 font-black" />
                  <span>Novo Item</span>
                </button>
                <button
                  onClick={() => setModalTabelaPrecosAberto(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer text-lg font-bold"
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="divide-y divide-slate-800 border border-cyan-500/20 rounded-2xl overflow-hidden bg-[#070c18]/80">
                {produtos.map((p) => {
                  return (
                    <div
                      key={p.id}
                      className="p-3.5 flex items-center justify-between gap-4 hover:bg-cyan-500/5 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{p.nome}</span>
                          <span className="text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-mono">
                            {p.categoria}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {p.descricao}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-brand font-black text-sm neon-text-amber tabular-nums mr-2">
                          R$ {p.precoVenda.toFixed(2).replace('.', ',')}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setProdutoEditandoPreco(p);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-400/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-[0_0_10px_rgba(255,184,0,0.2)]"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Preço</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setProdutoExcluindo(p);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-400/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
                          title="Excluir este item do cardápio"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          <span className="hidden sm:inline">Excluir</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#070c18] p-4 border-t border-amber-500/20 flex justify-end">
              <button
                type="button"
                onClick={() => setModalTabelaPrecosAberto(false)}
                className="px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_15px_rgba(255,184,0,0.5)] transition-all cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Alterar Imagem do Produto */}
      {produtoEditandoImagem && (
        <ModalCriarImagemProduto
          produto={produtoEditandoImagem}
          onClose={() => setProdutoEditandoImagem(null)}
        />
      )}

      {/* Modal Configurar Chave PIX */}
      {modalPixAberto && (
        <ModalConfigurarPix onClose={() => setModalPixAberto(false)} />
      )}

      {/* Modal Incluir Novo Produto ou Combo */}
      {modalNovoProdutoAberto && (
        <ModalNovoProduto
          onClose={() => setModalNovoProdutoAberto(false)}
        />
      )}

      {/* Modal Confirmar Exclusão */}
      {produtoExcluindo && (
        <ModalConfirmarExclusao
          produto={produtoExcluindo}
          onConfirmar={() => {
            excluirProduto(produtoExcluindo.id);
            setProdutoExcluindo(null);
          }}
          onClose={() => setProdutoExcluindo(null)}
        />
      )}
    </div>
  );
};
