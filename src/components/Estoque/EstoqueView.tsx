import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Insumo, TipoMovimentacao, ProdutoVenda } from '../../types';
import { ModalEditarPreco } from '../ModalEditarPreco';
import { ModalCriarImagemProduto } from '../ModalCriarImagemProduto';
import { ModalNovoProduto } from '../ModalNovoProduto';
import { ModalConfirmarExclusao } from '../ModalConfirmarExclusao';
import {
  Package,
  Plus,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  History,
  BookOpen,
  AlertTriangle,
  Search,
  Filter,
  DollarSign,
  CheckCircle,
  FileSpreadsheet,
  Tag,
  Edit3,
  Box,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';

export const EstoqueView: React.FC = () => {
  const {
    insumos,
    produtos,
    fichasTecnicas,
    movimentacoes,
    usuarioAtual,
    registrarMovimentacaoEstoque,
    adicionarInsumo,
    atualizarInsumo,
    atualizarFichaTecnica,
    atualizarPrecoProduto,
    calcularCustoInsumosProduto,
    excluirProduto,
  } = useApp();

  const [subAba, setSubAba] = useState<'insumos' | 'fichas' | 'precos' | 'historico'>('insumos');
  const [busca, setBusca] = useState<string>('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [apenasEstoqueBaixo, setApenasEstoqueBaixo] = useState<boolean>(false);
  const [produtoEditandoPreco, setProdutoEditandoPreco] = useState<ProdutoVenda | null>(null);
  const [produtoEditandoImagem, setProdutoEditandoImagem] = useState<ProdutoVenda | null>(null);
  const [produtoExcluindo, setProdutoExcluindo] = useState<ProdutoVenda | null>(null);
  const [modalNovoProdutoAberto, setModalNovoProdutoAberto] = useState<boolean>(false);

  // Modal Movimentacao
  const [modalMovAberto, setModalMovAberto] = useState<boolean>(false);
  const [movInsumoId, setMovInsumoId] = useState<number>(insumos[0]?.id || 1);
  const [movTipo, setMovTipo] = useState<TipoMovimentacao>('ENTRADA');
  const [movQtd, setMovQtd] = useState<string>('10');
  const [movMotivo, setMovMotivo] = useState<string>('');

  // Modal Novo Insumo
  const [modalNovoInsumoAberto, setModalNovoInsumoAberto] = useState<boolean>(false);
  const [novoNome, setNovoNome] = useState<string>('');
  const [novaUnidade, setNovaUnidade] = useState<'kg' | 'g' | 'ml' | 'L' | 'un' | 'fatias'>('un');
  const [novaQtdInicial, setNovaQtdInicial] = useState<string>('50');
  const [novoEstoqueMinimo, setNovoEstoqueMinimo] = useState<string>('15');
  const [novoCustoUnit, setNovoCustoUnit] = useState<string>('1.50');
  const [novaCatInsumo, setNovaCatInsumo] = useState<string>('Geral');

  // Modal Edição de Ficha Técnica
  const [produtoEditandoFicha, setProdutoEditandoFicha] = useState<ProdutoVenda | null>(null);
  const [itensFichaEdicao, setItensFichaEdicao] = useState<
    Array<{ insumoId: number; quantidadeNecessaria: number }>
  >([]);

  // Unique categories of insumos
  const categoriasInsumos = useMemo(() => {
    const setCats = new Set<string>();
    insumos.forEach((i) => {
      if (i.categoriaInsumo) setCats.add(i.categoriaInsumo);
    });
    return ['TODAS', ...Array.from(setCats)];
  }, [insumos]);

  // Filtered Insumos
  const insumosFiltrados = useMemo(() => {
    return insumos.filter((item) => {
      const matchBusca = item.nome.toLowerCase().includes(busca.toLowerCase());
      const matchCat = filtroCategoria === 'TODAS' || item.categoriaInsumo === filtroCategoria;
      const matchBaixo = !apenasEstoqueBaixo || item.quantidadeAtual <= item.estoqueMinimo;
      return matchBusca && matchCat && matchBaixo;
    });
  }, [insumos, busca, filtroCategoria, apenasEstoqueBaixo]);

  // Total inventory value in R$
  const valorTotalEstoque = useMemo(() => {
    return insumos.reduce((acc, i) => acc + i.quantidadeAtual * i.custoUnitario, 0);
  }, [insumos]);

  const totalInsumosCriticos = useMemo(() => {
    return insumos.filter((i) => i.quantidadeAtual <= i.estoqueMinimo).length;
  }, [insumos]);

  // Save Movement
  const handleSalvarMovimentacao = (e: React.FormEvent) => {
    e.preventDefault();
    const qtdNum = parseFloat(movQtd.replace(',', '.'));
    if (isNaN(qtdNum) || qtdNum <= 0) return;

    registrarMovimentacaoEstoque({
      insumoId: movInsumoId,
      tipo: movTipo,
      quantidade: qtdNum,
      motivo: movMotivo || (movTipo === 'ENTRADA' ? 'Entrada manual de mercadoria' : 'Baixa ou ajuste'),
    });

    setModalMovAberto(false);
    setMovMotivo('');
    setMovQtd('10');
  };

  // Save New Insumo
  const handleCadastrarInsumo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;

    adicionarInsumo({
      nome: novoNome.trim(),
      unidadeMedida: novaUnidade,
      quantidadeAtual: parseFloat(novaQtdInicial.replace(',', '.')) || 0,
      estoqueMinimo: parseFloat(novoEstoqueMinimo.replace(',', '.')) || 10,
      custoUnitario: parseFloat(novoCustoUnit.replace(',', '.')) || 0.1,
      categoriaInsumo: novaCatInsumo || 'Geral',
    });

    setModalNovoInsumoAberto(false);
    setNovoNome('');
  };

  // Open recipe editor
  const abrirEditorFicha = (prod: ProdutoVenda) => {
    setProdutoEditandoFicha(prod);
    const atuais = fichasTecnicas
      .filter((f) => f.produtoId === prod.id)
      .map((f) => ({ insumoId: f.insumoId, quantidadeNecessaria: f.quantidadeNecessaria }));
    setItensFichaEdicao(atuais);
  };

  const salvarFichaEditada = () => {
    if (!produtoEditandoFicha) return;
    atualizarFichaTecnica(produtoEditandoFicha.id, itensFichaEdicao);
    setProdutoEditandoFicha(null);
  };

  // Export Audit CSV
  const exportarMovimentacoesCsv = () => {
    const headers = 'ID,Data/Hora,Insumo,Tipo,Quantidade,Responsável,Motivo\n';
    const rows = movimentacoes
      .map(
        (m) =>
          `${m.id},"${new Date(m.dataHora).toLocaleString('pt-BR')}","${m.nomeInsumo || ''}","${
            m.tipo
          }",${m.quantidade},"${m.nomeUsuario || ''}","${m.motivo.replace(/"/g, '""')}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `movimentacoes_estoque_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header Summary */}
      <div className="bg-[#0a1024]/90 backdrop-blur-md rounded-3xl p-6 text-white shadow-[0_0_25px_rgba(0,240,255,0.12)] border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-cyan-300 flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_rgba(0,240,255,0.5)]">
              <Package className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h1 className="font-brand font-black text-2xl neon-text-cyan">
                Controle de Estoque &amp; Fichas Técnicas
              </h1>
              <p className="text-xs text-slate-400">
                Baixa automática de insumos por venda, margem de lucro e reposições em tempo real.
              </p>
            </div>
          </div>
        </div>

        {/* Quick KPI pills */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.1)]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
              Valor em Estoque
            </span>
            <span className="font-mono font-bold text-lg neon-text-lime tabular-nums">
              R$ {valorTotalEstoque.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <div className="bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.1)]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
              Insumos Monitorados
            </span>
            <span className="font-mono font-bold text-lg text-white tabular-nums">
              {insumos.length} itens
            </span>
          </div>

          {totalInsumosCriticos > 0 && (
            <div className="bg-rose-950/70 border border-rose-500/50 px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.25)]">
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
              <div>
                <span className="text-[10px] text-rose-300 font-bold block uppercase tracking-wider font-mono">
                  Nível Crítico
                </span>
                <span className="font-bold text-sm text-white">
                  {totalInsumosCriticos} {totalInsumosCriticos === 1 ? 'insumo' : 'insumos'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sub Tabs: Almoxarifado / Fichas Técnicas / Histórico */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSubAba('insumos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subAba === 'insumos'
                ? 'bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 shadow-[0_0_14px_rgba(0,240,255,0.5)] border border-cyan-200'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900/60'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Almoxarifado &amp; Insumos ({insumos.length})</span>
          </button>

          <button
            onClick={() => setSubAba('fichas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subAba === 'fichas'
                ? 'bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 shadow-[0_0_14px_rgba(0,240,255,0.5)] border border-cyan-200'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Fichas Técnicas &amp; Custos ({produtos.length})</span>
          </button>

          <button
            onClick={() => setSubAba('precos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subAba === 'precos'
                ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 shadow-[0_0_14px_rgba(255,184,0,0.5)] border border-amber-200'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900/60'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Cardápio &amp; Preços ({produtos.length})</span>
          </button>

          <button
            onClick={() => setSubAba('historico')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subAba === 'historico'
                ? 'bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 shadow-[0_0_14px_rgba(0,240,255,0.5)] border border-cyan-200'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900/60'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Auditoria de Movimentações ({movimentacoes.length})</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {subAba === 'insumos' && (
            <>
              <button
                onClick={() => {
                  setMovTipo('ENTRADA');
                  setModalMovAberto(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 rounded-xl text-xs font-black shadow-[0_0_14px_rgba(0,255,136,0.5)] hover:scale-[1.02] cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Registrar Entrada / Reposição</span>
              </button>
              <button
                onClick={() => setModalNovoInsumoAberto(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Insumo</span>
              </button>
            </>
          )}

          {subAba === 'historico' && (
            <button
              onClick={exportarMovimentacoesCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: INSUMOS / ALMOXARIFADO */}
      {subAba === 'insumos' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-[#0a1020]/90 backdrop-blur-md p-3.5 rounded-2xl border border-cyan-500/25 flex flex-col md:flex-row items-center justify-between gap-3 shadow-[0_0_15px_rgba(0,240,255,0.06)]">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar insumo por nome..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#060b17] border border-cyan-500/30 text-cyan-100 placeholder:text-slate-500 rounded-lg focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,240,255,0.25)]"
              />
            </div>

            <div className="flex items-center gap-2 self-stretch md:self-auto flex-wrap">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                <span>Categoria:</span>
              </div>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="text-xs bg-[#060b17] border border-cyan-500/30 text-cyan-200 rounded-lg px-2.5 py-1.5 focus:outline-none font-medium cursor-pointer"
              >
                {categoriasInsumos.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setApenasEstoqueBaixo(!apenasEstoqueBaixo)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  apenasEstoqueBaixo
                    ? 'bg-rose-950/80 text-rose-300 border-rose-500/60 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Apenas Estoque Baixo ({totalInsumosCriticos})
              </button>
            </div>
          </div>

          {/* Insumos Table */}
          <div className="bg-[#0a1022]/90 backdrop-blur-md rounded-2xl border border-cyan-500/20 overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.06)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#070c18] border-b border-cyan-500/20 text-[11px] font-bold uppercase tracking-wider text-cyan-300 font-mono">
                  <tr>
                    <th className="py-3 px-4">Insumo</th>
                    <th className="py-3 px-3">Categoria</th>
                    <th className="py-3 px-3 text-right">Qtd Atual</th>
                    <th className="py-3 px-3 text-right">Estoque Mínimo</th>
                    <th className="py-3 px-3 text-right">Custo Unit.</th>
                    <th className="py-3 px-3 text-right">Valor em Estoque</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {insumosFiltrados.map((item) => {
                    const isBaixo = item.quantidadeAtual <= item.estoqueMinimo;
                    const isZerado = item.quantidadeAtual <= 0;
                    const totalValorItem = item.quantidadeAtual * item.custoUnitario;

                    return (
                      <tr key={item.id} className="hover:bg-cyan-500/5 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-white block">{item.nome}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            ID #{item.id} &bull; Unidade: {item.unidadeMedida}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-medium text-[11px] font-mono">
                            {item.categoriaInsumo || 'Geral'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-white tabular-nums">
                          {item.quantidadeAtual} {item.unidadeMedida}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-slate-400 tabular-nums">
                          {item.estoqueMinimo} {item.unidadeMedida}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-cyan-200 tabular-nums">
                          R$ {item.custoUnitario.toFixed(3).replace('.', ',')}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold neon-text-amber tabular-nums">
                          R$ {totalValorItem.toFixed(2).replace('.', ',')}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          {isZerado ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.3)] animate-pulse">
                              Zerado
                            </span>
                          ) : isBaixo ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-[0_0_8px_rgba(255,184,0,0.3)]">
                              Repor Urgente
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-[0_0_8px_rgba(0,255,136,0.3)]">
                              Normal
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setMovInsumoId(item.id);
                                setMovTipo('ENTRADA');
                                setModalMovAberto(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 hover:bg-emerald-500/30 font-bold text-[11px] transition-all cursor-pointer shadow-xs"
                              title="Registrar entrada deste insumo"
                            >
                              + Entrada
                            </button>
                            <button
                              onClick={() => {
                                setMovInsumoId(item.id);
                                setMovTipo('SAIDA_PERDA');
                                setModalMovAberto(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-400/40 hover:bg-rose-500/30 font-bold text-[11px] transition-all cursor-pointer shadow-xs"
                              title="Registrar perda/descarte"
                            >
                              - Perda
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FICHAS TÉCNICAS (RECEITAS & MARGEM DE LUCRO) */}
      {subAba === 'fichas' && (
        <div className="space-y-6">
          <div className="bg-[#070f20]/90 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_15px_rgba(255,184,0,0.08)]">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                <strong className="neon-text-amber font-mono">Engenharia de Cardápio:</strong> A ficha técnica define a lista de insumos
                necessários para produzir cada unidade. Toda vez que um pedido é vendido, o sistema
                deduz essa receita automaticamente do almoxarifado!
              </span>
            </div>
            <button
              type="button"
              onClick={() => setModalNovoProdutoAberto(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] flex items-center gap-1.5 cursor-pointer shrink-0 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 text-slate-950 font-black" />
              <span>Novo Produto / Combo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {produtos.map((prod) => {
              const receitas = fichasTecnicas.filter((f) => f.produtoId === prod.id);
              const custoInsumos = calcularCustoInsumosProduto(prod.id);
              const lucroBruto = prod.precoVenda - custoInsumos;
              const margemPct = prod.precoVenda > 0 ? (lucroBruto / prod.precoVenda) * 100 : 0;

              return (
                <div
                  key={prod.id}
                  className="bg-[#0a1022]/90 backdrop-blur-md rounded-2xl border border-cyan-500/20 shadow-[0_0_20px_rgba(0,240,255,0.06)] hover:border-cyan-500/40 transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          onClick={() => setProdutoEditandoImagem(prod)}
                          className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-950 border border-cyan-500/30 shrink-0 group cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.15)]"
                          title="Clique para criar ou alterar a foto deste produto"
                        >
                          {prod.imagemUrl ? (
                            <img
                              src={prod.imagemUrl}
                              alt={prod.nome}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                              <ImageIcon className="w-5 h-5 text-cyan-400/50" />
                              <span className="text-[8px] font-mono">+ Foto</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="w-4 h-4 text-cyan-300" />
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                            {prod.categoria}
                          </span>
                          <h3 className="font-brand font-black text-lg text-white mt-1">
                            {prod.nome}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">{prod.descricao}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-500 block font-mono uppercase tracking-wider">
                          Preço de Venda
                        </span>
                        <div className="flex items-center gap-1.5 justify-end mt-0.5">
                          <span className="font-brand font-black text-lg neon-text-amber tabular-nums">
                            R$ {prod.precoVenda.toFixed(2).replace('.', ',')}
                          </span>
                          <button
                            type="button"
                            onClick={() => setProdutoEditandoPreco(prod)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/30 transition-all cursor-pointer"
                            title="Alterar Preço de Venda"
                          >
                            <Tag className="w-3.5 h-3.5 text-amber-400" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Financial Metrics Strip */}
                    <div className="grid grid-cols-3 gap-2 bg-[#060b17] p-3 rounded-xl border border-slate-800/80 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono block">Custo CMV</span>
                        <span className="font-mono font-bold text-slate-300 tabular-nums">
                          R$ {custoInsumos.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono block">Lucro Bruto/un</span>
                        <span className="font-mono font-bold neon-text-lime tabular-nums">
                          R$ {lucroBruto.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono block">Margem</span>
                        <span className="font-mono font-bold text-emerald-400 tabular-nums">
                          {margemPct.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Ingredients breakdown */}
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-cyan-300/80 font-mono mb-2">
                        Composição da Receita (Ficha Técnica)
                      </h4>
                      <div className="divide-y divide-slate-800/80 bg-[#060b17]/70 rounded-xl border border-slate-800/80 overflow-hidden">
                        {receitas.map((r) => {
                          const ins = insumos.find((i) => i.id === r.insumoId);
                          const custoItem = ins ? r.quantidadeNecessaria * ins.custoUnitario : 0;

                          return (
                            <div
                              key={r.id}
                              className="px-3 py-2 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-200">
                                  {ins ? ins.nome : `Insumo #${r.insumoId}`}
                                </span>
                              </div>
                              <div className="text-right flex items-center gap-3 font-mono">
                                <span className="text-cyan-300 tabular-nums">
                                  {r.quantidadeNecessaria} {ins?.unidadeMedida}
                                </span>
                                <span className="text-slate-500 text-[11px] tabular-nums">
                                  (R$ {custoItem.toFixed(2).replace('.', ',')})
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Card bottom edit actions */}
                  <div className="p-3 bg-[#070c18] border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setProdutoEditandoPreco(prod)}
                        className="px-2 py-1 text-xs font-bold text-amber-300 bg-slate-900 border border-amber-500/30 hover:border-amber-400 hover:bg-slate-800 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                      >
                        <Tag className="w-3.5 h-3.5 text-amber-400" />
                        <span>Preço</span>
                      </button>
                      <button
                        onClick={() => setProdutoEditandoImagem(prod)}
                        className="px-2 py-1 text-xs font-bold text-cyan-300 bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 hover:bg-slate-800 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                      >
                        <Camera className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Foto</span>
                      </button>
                      <button
                        onClick={() => setProdutoExcluindo(prod)}
                        className="px-2 py-1 text-xs font-bold text-rose-300 bg-slate-900 border border-rose-500/30 hover:border-rose-400 hover:bg-slate-800 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                        title="Excluir este produto do cardápio"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Excluir</span>
                      </button>
                    </div>
                    <button
                      onClick={() => abrirEditorFicha(prod)}
                      className="text-xs font-bold text-cyan-400 hover:text-cyan-300 font-mono transition-colors cursor-pointer"
                    >
                      Editar Receita &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB PREÇOS & CARDÁPIO */}
      {subAba === 'precos' && (
        <div className="space-y-4">
          <div className="bg-[#070f20]/90 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_15px_rgba(255,184,0,0.08)]">
            <div className="flex items-center gap-2.5">
              <Tag className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <strong className="block text-sm font-brand font-bold text-white neon-text-amber">
                  Gestão e Alteração de Preços &bull; Cantinho do Mini Chefe
                </strong>
                <span className="text-slate-400 text-xs">
                  Altere os preços de venda de produtos individuais e combos. Os novos preços entram em vigor imediatamente no PDV, nas comandas e nos relatórios de desempenho.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setModalNovoProdutoAberto(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] flex items-center gap-1.5 cursor-pointer shrink-0 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 text-slate-950 font-black" />
              <span>Novo Produto / Combo</span>
            </button>
          </div>

          <div className="bg-[#0a1022]/90 backdrop-blur-md rounded-2xl border border-cyan-500/20 overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.06)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#070c18] border-b border-cyan-500/20 text-[11px] font-bold uppercase tracking-wider text-cyan-300 font-mono">
                  <tr>
                    <th className="py-3 px-4">Produto / Combo</th>
                    <th className="py-3 px-3">Categoria</th>
                    <th className="py-3 px-3 text-right">Custo Insumos (CMV)</th>
                    <th className="py-3 px-3 text-right">Preço de Venda Atual</th>
                    <th className="py-3 px-3 text-right">Lucro Estimado</th>
                    <th className="py-3 px-3 text-right">Margem %</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {produtos.map((prod) => {
                    const custoInsumos = calcularCustoInsumosProduto(prod.id);
                    const lucroBruto = prod.precoVenda - custoInsumos;
                    const margemPct = prod.precoVenda > 0 ? (lucroBruto / prod.precoVenda) * 100 : 0;
                    const isCombo = prod.categoria === 'Combos Kids';

                    return (
                      <tr key={prod.id} className="hover:bg-cyan-500/5 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              onClick={() => setProdutoEditandoImagem(prod)}
                              className="relative w-11 h-11 rounded-lg overflow-hidden bg-slate-950 border border-cyan-500/30 shrink-0 group cursor-pointer"
                              title="Alterar foto deste produto"
                            >
                              {prod.imagemUrl ? (
                                <img
                                  src={prod.imagemUrl}
                                  alt={prod.nome}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500">
                                  <ImageIcon className="w-4 h-4 text-cyan-400/40" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Camera className="w-3.5 h-3.5 text-cyan-300" />
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm block">
                                  {prod.nome}
                                </span>
                                {isCombo && (
                                  <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-500/40 font-mono font-bold px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(255,184,0,0.25)]">
                                    Combo Kids
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 line-clamp-1">
                                {prod.descricao}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-medium text-[11px] font-mono">
                            {prod.categoria}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-slate-400 tabular-nums">
                          R$ {custoInsumos.toFixed(2).replace('.', ',')}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-base neon-text-amber tabular-nums">
                          R$ {prod.precoVenda.toFixed(2).replace('.', ',')}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold neon-text-lime tabular-nums">
                          R$ {lucroBruto.toFixed(2).replace('.', ',')}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-400 tabular-nums">
                          {margemPct.toFixed(1)}%
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setProdutoEditandoImagem(prod)}
                              className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow-[0_0_8px_rgba(0,240,255,0.2)]"
                              title="Criar ou alterar foto deste produto"
                            >
                              <Camera className="w-3.5 h-3.5 text-cyan-400" />
                              <span className="hidden sm:inline">Foto</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setProdutoEditandoPreco(prod)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-[0_0_10px_rgba(255,184,0,0.2)]"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                              <span>Preço</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setProdutoExcluindo(prod)}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow-[0_0_8px_rgba(244,63,94,0.2)]"
                              title="Excluir este produto do cardápio"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                              <span className="hidden sm:inline">Excluir</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDITORIA DE MOVIMENTAÇÕES */}
      {subAba === 'historico' && (
        <div className="space-y-4">
          <div className="bg-[#0a1022]/90 backdrop-blur-md rounded-2xl border border-cyan-500/20 overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.06)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#070c18] border-b border-cyan-500/20 text-[11px] font-bold uppercase tracking-wider text-cyan-300 font-mono">
                  <tr>
                    <th className="py-3 px-4">Data/Hora</th>
                    <th className="py-3 px-3">Insumo</th>
                    <th className="py-3 px-3">Tipo de Movimentação</th>
                    <th className="py-3 px-3 text-right">Quantidade</th>
                    <th className="py-3 px-3">Responsável</th>
                    <th className="py-3 px-4">Motivo / Pedido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {movimentacoes.map((mov) => {
                    const isEntrada = mov.tipo === 'ENTRADA';
                    const isVenda = mov.tipo === 'SAIDA_VENDA';
                    const isPerda = mov.tipo === 'SAIDA_PERDA';

                    return (
                      <tr key={mov.id} className="hover:bg-cyan-500/5 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-cyan-300/70">
                          {new Date(mov.dataHora).toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3 px-3 font-semibold text-white">
                          {mov.nomeInsumo || `Insumo #${mov.insumoId}`}
                        </td>
                        <td className="py-3 px-3">
                          {isEntrada && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(0,255,136,0.2)]">
                              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                              <span>Entrada / Compra</span>
                            </span>
                          )}
                          {isVenda && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(0,240,255,0.2)]">
                              <ArrowDownRight className="w-3 h-3 text-cyan-400" />
                              <span>Baixa Venda (Auto)</span>
                            </span>
                          )}
                          {isPerda && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-300 bg-rose-950/80 border border-rose-500/40 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(244,63,94,0.2)]">
                              <ArrowDownRight className="w-3 h-3 text-rose-400" />
                              <span>Perda / Descarte</span>
                            </span>
                          )}
                          {mov.tipo === 'AJUSTE' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(255,184,0,0.2)]">
                              <span>Ajuste de Balanço</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold tabular-nums">
                          <span className={isEntrada ? 'text-emerald-400' : isPerda ? 'text-rose-400' : 'text-cyan-300'}>
                            {isEntrada ? '+' : '-'}
                            {mov.quantidade}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-medium">
                          {mov.nomeUsuario || 'Sistema'}
                        </td>
                        <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                          {mov.motivo}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Registrar Movimentação */}
      {modalMovAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0a1022] rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.15)] max-w-md w-full overflow-hidden border border-cyan-500/30">
            <div className="bg-[#060b17] p-4 text-white border-b border-cyan-500/20 flex items-center justify-between">
              <h3 className="font-brand font-bold text-base text-cyan-300 flex items-center gap-2">
                <Box className="w-5 h-5 text-amber-400" />
                <span>Registrar Movimentação de Estoque</span>
              </h3>
              <button
                onClick={() => setModalMovAberto(false)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSalvarMovimentacao} className="p-6 space-y-4 text-slate-200">
              <div>
                <label className="text-xs font-bold text-cyan-300 block mb-1 font-mono">
                  Selecione o Insumo:
                </label>
                <select
                  value={movInsumoId}
                  onChange={(e) => setMovInsumoId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-[#060b17] border border-cyan-500/30 text-white rounded-xl focus:outline-none focus:border-cyan-400 font-medium"
                >
                  {insumos.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nome} (Atual: {i.quantidadeAtual} {i.unidadeMedida})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-cyan-300 block mb-1 font-mono">
                  Tipo de Operação:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ENTRADA', label: 'Entrada (+)' },
                    { id: 'SAIDA_PERDA', label: 'Perda (-)' },
                    { id: 'AJUSTE', label: 'Ajuste Balanço' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setMovTipo(t.id as TipoMovimentacao)}
                      className={`py-2 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                        movTipo === t.id
                          ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_12px_rgba(255,184,0,0.3)]'
                          : 'border-slate-800 bg-[#060b17] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-cyan-300 block mb-1 font-mono">Quantidade:</label>
                <input
                  type="number"
                  step="any"
                  value={movQtd}
                  onChange={(e) => setMovQtd(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#060b17] border border-cyan-500/30 text-white rounded-xl focus:outline-none focus:border-cyan-400 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-cyan-300 block mb-1 font-mono">
                  Motivo / Justificativa:
                </label>
                <input
                  type="text"
                  value={movMotivo}
                  onChange={(e) => setMovMotivo(e.target.value)}
                  placeholder="Ex: Compra NF-e 1249, Validade vencida, etc."
                  className="w-full px-3 py-2 text-xs bg-[#060b17] border border-cyan-500/30 text-white rounded-xl focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalMovAberto(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_15px_rgba(255,184,0,0.3)] transition-all cursor-pointer"
                >
                  Confirmar Movimentação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Novo Insumo */}
      {modalNovoInsumoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0a1022] rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.15)] max-w-md w-full overflow-hidden border border-cyan-500/30">
            <div className="bg-[#060b17] p-4 text-white border-b border-cyan-500/20 flex items-center justify-between">
              <h3 className="font-brand font-bold text-base text-cyan-300 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <span>Cadastrar Novo Insumo</span>
              </h3>
              <button
                onClick={() => setModalNovoInsumoAberto(false)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCadastrarInsumo} className="p-6 space-y-4 text-slate-200">
              <div>
                <label className="text-xs font-bold text-cyan-300 block mb-1 font-mono">
                  Nome do Insumo:
                </label>
                <input
                  type="text"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Ex: Orégano Desidratado Especial"
                  className="w-full px-3 py-2 text-xs bg-[#060b17] border border-cyan-500/30 text-white rounded-xl focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-cyan-300 block mb-1 font-mono">
                    Unidade de Medida:
                  </label>
                  <select
                    value={novaUnidade}
                    onChange={(e) =>
                      setNovaUnidade(
                        e.target.value as 'kg' | 'g' | 'ml' | 'L' | 'un' | 'fatias'
                      )
                    }
                    className="w-full px-3 py-2 text-xs bg-[#060b17] border border-cyan-500/30 text-white rounded-xl focus:outline-none focus:border-cyan-400"
                  >
                    <option value="un">un (unidades)</option>
                    <option value="g">g (gramas)</option>
                    <option value="kg">kg (quilos)</option>
                    <option value="ml">ml (mililitros)</option>
                    <option value="L">L (litros)</option>
                    <option value="fatias">fatias</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-cyan-300 block mb-1 font-mono">Categoria:</label>
                  <input
                    type="text"
                    value={novaCatInsumo}
                    onChange={(e) => setNovaCatInsumo(e.target.value)}
                    placeholder="Ex: Temperos"
                    className="w-full px-3 py-2 text-xs bg-[#060b17] border border-cyan-500/30 text-white rounded-xl focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-cyan-300 block mb-1 font-mono">Qtd Inicial:</label>
                  <input
                    type="number"
                    step="any"
                    value={novaQtdInicial}
                    onChange={(e) => setNovaQtdInicial(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#060b17] border border-cyan-500/30 text-white rounded-xl focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-cyan-300 block mb-1 font-mono">
                    Estoque Mínimo:
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={novoEstoqueMinimo}
                    onChange={(e) => setNovoEstoqueMinimo(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#060b17] border border-cyan-500/30 text-white rounded-xl focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-cyan-300 block mb-1 font-mono">
                    Custo Unit. (R$):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={novoCustoUnit}
                    onChange={(e) => setNovoCustoUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#060b17] border border-cyan-500/30 text-white rounded-xl focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovoInsumoAberto(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
                >
                  Salvar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Ficha Técnica */}
      {produtoEditandoFicha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0a1022] rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.15)] max-w-lg w-full overflow-hidden border border-cyan-500/30">
            <div className="bg-[#060b17] p-4 text-white border-b border-cyan-500/20 flex items-center justify-between">
              <div>
                <h3 className="font-brand font-bold text-base text-cyan-300">
                  Ficha Técnica: {produtoEditandoFicha.nome}
                </h3>
                <p className="text-xs text-amber-300/80 font-mono">
                  Defina os insumos que compõem este produto
                </p>
              </div>
              <button
                onClick={() => setProdutoEditandoFicha(null)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-3">
                {itensFichaEdicao.map((item, idx) => {
                  const ins = insumos.find((i) => i.id === item.insumoId);
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-[#060b17] rounded-xl border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1">
                        <select
                          value={item.insumoId}
                          onChange={(e) => {
                            const nId = Number(e.target.value);
                            setItensFichaEdicao((prev) =>
                              prev.map((it, i) => (i === idx ? { ...it, insumoId: nId } : it))
                            );
                          }}
                          className="w-full text-xs bg-[#0a1022] text-white border border-cyan-500/30 rounded-lg p-2 font-medium focus:border-cyan-400"
                        >
                          {insumos.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.nome} ({i.unidadeMedida})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-24">
                        <input
                          type="number"
                          step="any"
                          value={item.quantidadeNecessaria}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setItensFichaEdicao((prev) =>
                              prev.map((it, i) =>
                                i === idx ? { ...it, quantidadeNecessaria: val } : it
                              )
                            );
                          }}
                          className="w-full text-xs bg-[#0a1022] text-white border border-cyan-500/30 rounded-lg p-2 font-mono text-right focus:border-cyan-400"
                        />
                      </div>

                      <span className="text-xs text-cyan-300 font-mono">{ins?.unidadeMedida}</span>

                      <button
                        type="button"
                        onClick={() => {
                          setItensFichaEdicao((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="text-rose-400 hover:text-rose-300 font-bold text-base px-1 cursor-pointer"
                        title="Remover insumo"
                      >
                        &times;
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (insumos.length > 0) {
                    setItensFichaEdicao((prev) => [
                      ...prev,
                      { insumoId: insumos[0].id, quantidadeNecessaria: 1 },
                    ]);
                  }
                }}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Ingrediente à Ficha</span>
              </button>
            </div>

            <div className="bg-[#060b17] p-4 border-t border-cyan-500/20 flex justify-end gap-2">
              <button
                onClick={() => setProdutoEditandoFicha(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={salvarFichaEditada}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_15px_rgba(255,184,0,0.3)] cursor-pointer"
              >
                Salvar Ficha Técnica
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Alterar Preço */}
      {produtoEditandoPreco && (
        <ModalEditarPreco
          produto={produtoEditandoPreco}
          onClose={() => setProdutoEditandoPreco(null)}
        />
      )}

      {/* Modal Criar / Alterar Imagem do Produto */}
      {produtoEditandoImagem && (
        <ModalCriarImagemProduto
          produto={produtoEditandoImagem}
          onClose={() => setProdutoEditandoImagem(null)}
        />
      )}

      {/* Modal Incluir Novo Produto ou Combo */}
      {modalNovoProdutoAberto && (
        <ModalNovoProduto
          onClose={() => setModalNovoProdutoAberto(false)}
        />
      )}

      {/* Modal Confirmar Exclusão de Produto ou Combo */}
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
