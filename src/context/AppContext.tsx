import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Usuario,
  ProdutoVenda,
  Insumo,
  FichaTecnica,
  Pedido,
  ItemPedido,
  Pagamento,
  MovimentacaoEstoque,
  StatusPedido,
  FormaPagamento,
  TipoMovimentacao,
  PerfilUsuario,
  ConfiguracaoPix,
} from '../types';
import {
  initialUsuarios,
  initialProdutos,
  initialInsumos,
  initialFichasTecnicas,
  initialPedidos,
  initialMovimentacoes,
  initialConfiguracaoPix,
} from '../data/initialData';

interface AppContextType {
  // Usuário
  usuarios: Usuario[];
  usuarioAtual: Usuario;
  setUsuarioAtual: (u: Usuario) => void;
  trocarPerfil: (perfil: PerfilUsuario) => void;

  // Catálogo e Estoque
  produtos: ProdutoVenda[];
  insumos: Insumo[];
  fichasTecnicas: FichaTecnica[];
  movimentacoes: MovimentacaoEstoque[];

  // Pedidos
  pedidos: Pedido[];

  // Operações de Estoque & Ficha Técnica
  calcularCustoInsumosProduto: (produtoId: number) => number;
  verificarDisponibilidade: (produtoId: number, quantidade?: number) => { disponivel: boolean; motivo?: string };
  insumosComEstoqueBaixo: Insumo[];
  registrarMovimentacaoEstoque: (dados: {
    insumoId: number;
    tipo: TipoMovimentacao;
    quantidade: number;
    motivo: string;
  }) => void;
  adicionarInsumo: (novo: Omit<Insumo, 'id'>) => void;
  atualizarInsumo: (editado: Insumo) => void;
  adicionarProduto: (
    novo: Omit<ProdutoVenda, 'id'>,
    itensFicha: Array<{ insumoId: number; quantidadeNecessaria: number }>
  ) => ProdutoVenda;
  atualizarProduto: (
    editado: ProdutoVenda,
    itensFicha?: Array<{ insumoId: number; quantidadeNecessaria: number }>
  ) => void;
  excluirProduto: (produtoId: number) => void;
  atualizarPrecoProduto: (produtoId: number, novoPreco: number) => void;
  atualizarImagemProduto: (produtoId: number, imagemUrl: string) => void;
  atualizarFichaTecnica: (
    produtoId: number,
    itensFicha: Array<{ insumoId: number; quantidadeNecessaria: number }>
  ) => void;

  // Operações de Pedidos (Automação de Atendimento & Cozinha)
  criarPedido: (dados: {
    clienteNome: string;
    tipoAtendimento: 'BALCAO' | 'MESA' | 'DELIVERY';
    itens: Array<{ produtoId: number; quantidade: number; observacao?: string }>;
    formaPagamento: FormaPagamento;
    valorPago: number;
    valorTroco?: number;
    observacoesGerais?: string;
  }) => { success: boolean; pedido?: Pedido; error?: string };
  atualizarStatusPedido: (pedidoId: number, novoStatus: StatusPedido) => void;
  cancelarPedido: (pedidoId: number, motivo?: string) => void;

  // Pagamento PIX
  configuracaoPix: ConfiguracaoPix;
  atualizarConfiguracaoPix: (novaConfig: ConfiguracaoPix) => void;

  // Utilitários
  ultimoPedidoCriado: Pedido | null;
  notificacaoSomAtiva: boolean;
  setNotificacaoSomAtiva: (ativa: boolean) => void;
  tocarSomNotificacao: () => void;
  resetarDados: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'cantinho_mini_chefe_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or fallback to seed
  const [usuarios] = useState<Usuario[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}usuarios`);
    return saved ? JSON.parse(saved) : initialUsuarios;
  });

  const [usuarioAtual, setUsuarioAtual] = useState<Usuario>(() => {
    return usuarios[1] || initialUsuarios[1]; // default to Atendente for immediate operational feel
  });

  const [produtos, setProdutos] = useState<ProdutoVenda[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}produtos`);
    if (saved) {
      try {
        const parsed: ProdutoVenda[] = JSON.parse(saved);
        return parsed.map((p) => {
          const init = initialProdutos.find((ip) => ip.id === p.id);
          return {
            ...p,
            imagemUrl: p.imagemUrl || init?.imagemUrl,
          };
        });
      } catch (e) {
        return initialProdutos;
      }
    }
    return initialProdutos;
  });

  const [insumos, setInsumos] = useState<Insumo[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}insumos`);
    return saved ? JSON.parse(saved) : initialInsumos;
  });

  const [fichasTecnicas, setFichasTecnicas] = useState<FichaTecnica[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}fichas`);
    return saved ? JSON.parse(saved) : initialFichasTecnicas;
  });

  const [pedidos, setPedidos] = useState<Pedido[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}pedidos`);
    return saved ? JSON.parse(saved) : initialPedidos;
  });

  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}movimentacoes`);
    return saved ? JSON.parse(saved) : initialMovimentacoes;
  });

  const [ultimoPedidoCriado, setUltimoPedidoCriado] = useState<Pedido | null>(null);
  const [notificacaoSomAtiva, setNotificacaoSomAtiva] = useState<boolean>(true);

  // PIX Configuration state
  const [configuracaoPix, setConfiguracaoPix] = useState<ConfiguracaoPix>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}config_pix`);
    return saved ? JSON.parse(saved) : initialConfiguracaoPix;
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}config_pix`, JSON.stringify(configuracaoPix));
  }, [configuracaoPix]);

  const atualizarConfiguracaoPix = (novaConfig: ConfiguracaoPix) => {
    setConfiguracaoPix(novaConfig);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}produtos`, JSON.stringify(produtos));
  }, [produtos]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}insumos`, JSON.stringify(insumos));
  }, [insumos]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}fichas`, JSON.stringify(fichasTecnicas));
  }, [fichasTecnicas]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}pedidos`, JSON.stringify(pedidos));
  }, [pedidos]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}movimentacoes`, JSON.stringify(movimentacoes));
  }, [movimentacoes]);

  // Audio tone notification for new kitchen orders using Web Audio API
  const tocarSomNotificacao = () => {
    if (!notificacaoSomAtiva) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // AudioContext muted or blocked by browser policy
    }
  };

  // Switch role quickly
  const trocarPerfil = (perfil: PerfilUsuario) => {
    const found = usuarios.find((u) => u.perfil === perfil);
    if (found) {
      setUsuarioAtual(found);
    }
  };

  // Calculate cost of ingredients for a product
  const calcularCustoInsumosProduto = (produtoId: number): number => {
    const receitas = fichasTecnicas.filter((f) => f.produtoId === produtoId);
    let custoTotal = 0;
    receitas.forEach((f) => {
      const insumo = insumos.find((i) => i.id === f.insumoId);
      if (insumo) {
        custoTotal += f.quantidadeNecessaria * insumo.custoUnitario;
      }
    });
    return custoTotal;
  };

  // Check product availability against stock
  const verificarDisponibilidade = (
    produtoId: number,
    quantidade: number = 1
  ): { disponivel: boolean; motivo?: string } => {
    const receitas = fichasTecnicas.filter((f) => f.produtoId === produtoId);
    if (receitas.length === 0) return { disponivel: true };

    for (const itemFicha of receitas) {
      const insumo = insumos.find((i) => i.id === itemFicha.insumoId);
      if (!insumo) continue;
      const necessario = itemFicha.quantidadeNecessaria * quantidade;
      if (insumo.quantidadeAtual < necessario) {
        return {
          disponivel: false,
          motivo: `Insumo insuficiente: "${insumo.nome}" (Disponível: ${insumo.quantidadeAtual} ${insumo.unidadeMedida}, Necessário: ${necessario} ${insumo.unidadeMedida})`,
        };
      }
    }
    return { disponivel: true };
  };

  // Low stock detector
  const insumosComEstoqueBaixo = useMemo(() => {
    return insumos.filter((i) => i.quantidadeAtual <= i.estoqueMinimo);
  }, [insumos]);

  // Create order with automatic stock deduction based on Ficha Técnica
  const criarPedido = (dados: {
    clienteNome: string;
    tipoAtendimento: 'BALCAO' | 'MESA' | 'DELIVERY';
    itens: Array<{ produtoId: number; quantidade: number; observacao?: string }>;
    formaPagamento: FormaPagamento;
    valorPago: number;
    valorTroco?: number;
    observacoesGerais?: string;
  }) => {
    if (!dados.itens || dados.itens.length === 0) {
      return { success: false, error: 'O pedido deve conter pelo menos um item.' };
    }

    // Verify stock availability
    for (const item of dados.itens) {
      const disp = verificarDisponibilidade(item.produtoId, item.quantidade);
      if (!disp.disponivel) {
        return { success: false, error: disp.motivo || 'Estoque insuficiente para um dos itens.' };
      }
    }

    // Generate new Order ID & Number
    const nextId = pedidos.length > 0 ? Math.max(...pedidos.map((p) => p.id)) + 1 : 101;
    const numeroPedido = `#MC-${String(nextId).padStart(3, '0')}`;
    const nowIso = new Date().toISOString();

    // Build items with subtotal
    let valorTotal = 0;
    const itensProcessados: ItemPedido[] = dados.itens.map((it, idx) => {
      const prod = produtos.find((p) => p.id === it.produtoId);
      const precoUnitario = prod ? prod.precoVenda : 0;
      const subtotal = precoUnitario * it.quantidade;
      valorTotal += subtotal;

      return {
        id: idx + 1,
        pedidoId: nextId,
        produtoId: it.produtoId,
        nomeProduto: prod ? prod.nome : 'Produto Desconhecido',
        quantidade: it.quantidade,
        precoUnitario,
        observacao: it.observacao,
        subtotal,
      };
    });

    // Payment object
    const pagamento: Pagamento = {
      id: Date.now(),
      pedidoId: nextId,
      forma: dados.formaPagamento,
      valorPago: dados.valorPago,
      valorTroco: dados.valorTroco || 0,
      dataPagamento: nowIso,
      comprovanteTransacao: `AUT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    };

    const novoPedido: Pedido = {
      id: nextId,
      numeroPedido,
      clienteNome: dados.clienteNome.trim() || 'Cliente Mini Chefe',
      tipoAtendimento: dados.tipoAtendimento,
      dataHora: nowIso,
      status: 'RECEBIDO',
      valorTotal,
      itens: itensProcessados,
      pagamentos: [pagamento],
      usuarioId: usuarioAtual.id,
      observacoesGerais: dados.observacoesGerais,
    };

    // AUTOMATIC STOCK DEDUCTION (SAIDA_VENDA)
    // Gather all ingredient requirements for all items in the order
    const deduzirInsumos: Record<number, number> = {};
    for (const it of dados.itens) {
      const receitas = fichasTecnicas.filter((f) => f.produtoId === it.produtoId);
      for (const f of receitas) {
        const totalInsumo = f.quantidadeNecessaria * it.quantidade;
        deduzirInsumos[f.insumoId] = (deduzirInsumos[f.insumoId] || 0) + totalInsumo;
      }
    }

    const novasMovimentacoes: MovimentacaoEstoque[] = [];
    const insumosAtualizados = insumos.map((ins) => {
      if (deduzirInsumos[ins.id]) {
        const qtdDeduzida = deduzirInsumos[ins.id];
        novasMovimentacoes.push({
          id: Date.now() + Math.random(),
          insumoId: ins.id,
          nomeInsumo: ins.nome,
          dataHora: nowIso,
          tipo: 'SAIDA_VENDA',
          quantidade: qtdDeduzida,
          motivo: `Baixa automática Ficha Técnica - Pedido ${numeroPedido}`,
          usuarioId: usuarioAtual.id,
          nomeUsuario: usuarioAtual.nome,
          pedidoId: nextId,
        });

        return {
          ...ins,
          quantidadeAtual: Math.max(0, Number((ins.quantidadeAtual - qtdDeduzida).toFixed(2))),
        };
      }
      return ins;
    });

    setInsumos(insumosAtualizados);
    setMovimentacoes((prev) => [...novasMovimentacoes, ...prev]);
    setPedidos((prev) => [novoPedido, ...prev]);
    setUltimoPedidoCriado(novoPedido);

    tocarSomNotificacao();
    return { success: true, pedido: novoPedido };
  };

  // Change order status with kitchen workflow timestamps
  const atualizarStatusPedido = (pedidoId: number, novoStatus: StatusPedido) => {
    const nowIso = new Date().toISOString();
    setPedidos((prev) =>
      prev.map((p) => {
        if (p.id !== pedidoId) return p;
        const atualizado = { ...p, status: novoStatus };
        if (novoStatus === 'EM_PREPARO' && !p.dataHoraPreparoInicio) {
          atualizado.dataHoraPreparoInicio = nowIso;
        } else if (novoStatus === 'PRONTO' && !p.dataHoraPronto) {
          atualizado.dataHoraPronto = nowIso;
        } else if (novoStatus === 'FINALIZADO' && !p.dataHoraFinalizado) {
          atualizado.dataHoraFinalizado = nowIso;
        }
        return atualizado;
      })
    );
  };

  // Cancel order & restore inventory automatically
  const cancelarPedido = (pedidoId: number, motivo?: string) => {
    const pedido = pedidos.find((p) => p.id === pedidoId);
    if (!pedido || pedido.status === 'CANCELADO') return;

    const nowIso = new Date().toISOString();

    // Revert stock deducted by this order
    const devolverInsumos: Record<number, number> = {};
    for (const it of pedido.itens) {
      const receitas = fichasTecnicas.filter((f) => f.produtoId === it.produtoId);
      for (const f of receitas) {
        const totalInsumo = f.quantidadeNecessaria * it.quantidade;
        devolverInsumos[f.insumoId] = (devolverInsumos[f.insumoId] || 0) + totalInsumo;
      }
    }

    const novasMovimentacoes: MovimentacaoEstoque[] = [];
    const insumosAtualizados = insumos.map((ins) => {
      if (devolverInsumos[ins.id]) {
        const qtdDevolvida = devolverInsumos[ins.id];
        novasMovimentacoes.push({
          id: Date.now() + Math.random(),
          insumoId: ins.id,
          nomeInsumo: ins.nome,
          dataHora: nowIso,
          tipo: 'AJUSTE',
          quantidade: qtdDevolvida,
          motivo: `Estorno de estoque - Pedido Cancelado ${pedido.numeroPedido}: ${motivo || 'Cancelamento'}`,
          usuarioId: usuarioAtual.id,
          nomeUsuario: usuarioAtual.nome,
          pedidoId: pedido.id,
        });

        return {
          ...ins,
          quantidadeAtual: Number((ins.quantidadeAtual + qtdDevolvida).toFixed(2)),
        };
      }
      return ins;
    });

    setInsumos(insumosAtualizados);
    setMovimentacoes((prev) => [...novasMovimentacoes, ...prev]);
    setPedidos((prev) =>
      prev.map((p) => (p.id === pedidoId ? { ...p, status: 'CANCELADO' as StatusPedido } : p))
    );
  };

  // Register manual stock movement (ENTRADA, SAIDA_PERDA, AJUSTE)
  const registrarMovimentacaoEstoque = (dados: {
    insumoId: number;
    tipo: TipoMovimentacao;
    quantidade: number;
    motivo: string;
  }) => {
    const target = insumos.find((i) => i.id === dados.insumoId);
    if (!target) return;

    let novaQtd = target.quantidadeAtual;
    if (dados.tipo === 'ENTRADA') {
      novaQtd += dados.quantidade;
    } else if (dados.tipo === 'SAIDA_PERDA' || dados.tipo === 'SAIDA_VENDA') {
      novaQtd = Math.max(0, novaQtd - dados.quantidade);
    } else if (dados.tipo === 'AJUSTE') {
      novaQtd = dados.quantidade; // Adjusts absolute count
    }

    const nowIso = new Date().toISOString();
    const mov: MovimentacaoEstoque = {
      id: Date.now(),
      insumoId: dados.insumoId,
      nomeInsumo: target.nome,
      dataHora: nowIso,
      tipo: dados.tipo,
      quantidade: dados.quantidade,
      motivo: dados.motivo.trim() || 'Movimentação manual autorizada',
      usuarioId: usuarioAtual.id,
      nomeUsuario: usuarioAtual.nome,
    };

    setInsumos((prev) =>
      prev.map((i) => (i.id === dados.insumoId ? { ...i, quantidadeAtual: Number(novaQtd.toFixed(2)) } : i))
    );
    setMovimentacoes((prev) => [mov, ...prev]);
  };

  // Add new Insumo
  const adicionarInsumo = (novo: Omit<Insumo, 'id'>) => {
    const newId = insumos.length > 0 ? Math.max(...insumos.map((i) => i.id)) + 1 : 1;
    const insumoCompleto: Insumo = { ...novo, id: newId };
    setInsumos((prev) => [...prev, insumoCompleto]);

    // Register initial entry movement
    if (novo.quantidadeAtual > 0) {
      registrarMovimentacaoEstoque({
        insumoId: newId,
        tipo: 'ENTRADA',
        quantidade: novo.quantidadeAtual,
        motivo: 'Cadastro inicial de insumo no estoque',
      });
    }
  };

  // Update Insumo
  const atualizarInsumo = (editado: Insumo) => {
    setInsumos((prev) => prev.map((i) => (i.id === editado.id ? editado : i)));
  };

  // Add new Product with Ficha Técnica
  const adicionarProduto = (
    novo: Omit<ProdutoVenda, 'id'>,
    itensFicha: Array<{ insumoId: number; quantidadeNecessaria: number }>
  ) => {
    const newProdId = produtos.length > 0 ? Math.max(...produtos.map((p) => p.id)) + 1 : 1;
    const prodCompleto: ProdutoVenda = { ...novo, id: newProdId };
    setProdutos((prev) => [...prev, prodCompleto]);

    if (itensFicha.length > 0) {
      let fichaIdStart = fichasTecnicas.length > 0 ? Math.max(...fichasTecnicas.map((f) => f.id)) + 1 : 1;
      const novasFichas: FichaTecnica[] = itensFicha.map((item) => ({
        id: fichaIdStart++,
        produtoId: newProdId,
        insumoId: item.insumoId,
        quantidadeNecessaria: item.quantidadeNecessaria,
      }));
      setFichasTecnicas((prev) => [...prev, ...novasFichas]);
    }

    return prodCompleto;
  };

  // Delete product or combo and its associated recipes
  const excluirProduto = (produtoId: number) => {
    setProdutos((prev) => prev.filter((p) => p.id !== produtoId));
    setFichasTecnicas((prev) => prev.filter((f) => f.produtoId !== produtoId));
  };

  // Update Product and optionally replace its Ficha Técnica
  const atualizarProduto = (
    editado: ProdutoVenda,
    itensFicha?: Array<{ insumoId: number; quantidadeNecessaria: number }>
  ) => {
    setProdutos((prev) => prev.map((p) => (p.id === editado.id ? editado : p)));

    if (itensFicha) {
      setFichasTecnicas((prev) => {
        const semAntigas = prev.filter((f) => f.produtoId !== editado.id);
        let idCounter = prev.length > 0 ? Math.max(...prev.map((f) => f.id)) + 1 : 1;
        const novas = itensFicha.map((it) => ({
          id: idCounter++,
          produtoId: editado.id,
          insumoId: it.insumoId,
          quantidadeNecessaria: it.quantidadeNecessaria,
        }));
        return [...semAntigas, ...novas];
      });
    }
  };

  // Quick price update for products and combos
  const atualizarPrecoProduto = (produtoId: number, novoPreco: number) => {
    setProdutos((prev) =>
      prev.map((p) =>
        p.id === produtoId ? { ...p, precoVenda: Number(novoPreco.toFixed(2)) } : p
      )
    );
  };

  // Quick image update for products and combos
  const atualizarImagemProduto = (produtoId: number, imagemUrl: string) => {
    setProdutos((prev) =>
      prev.map((p) => (p.id === produtoId ? { ...p, imagemUrl } : p))
    );
  };

  // Update Ficha Técnica of a product directly
  const atualizarFichaTecnica = (
    produtoId: number,
    itensFicha: Array<{ insumoId: number; quantidadeNecessaria: number }>
  ) => {
    setFichasTecnicas((prev) => {
      const semAntigas = prev.filter((f) => f.produtoId !== produtoId);
      let idCounter = prev.length > 0 ? Math.max(...prev.map((f) => f.id)) + 1 : 1;
      const novas = itensFicha.map((it) => ({
        id: idCounter++,
        produtoId: produtoId,
        insumoId: it.insumoId,
        quantidadeNecessaria: it.quantidadeNecessaria,
      }));
      return [...semAntigas, ...novas];
    });
  };

  // Factory reset for demo testing
  const resetarDados = () => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}produtos`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}insumos`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}fichas`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}pedidos`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}movimentacoes`);
    setProdutos(initialProdutos);
    setInsumos(initialInsumos);
    setFichasTecnicas(initialFichasTecnicas);
    setPedidos(initialPedidos);
    setMovimentacoes(initialMovimentacoes);
    setUsuarioAtual(initialUsuarios[1]);
  };

  return (
    <AppContext.Provider
      value={{
        usuarios,
        usuarioAtual,
        setUsuarioAtual,
        trocarPerfil,
        produtos,
        insumos,
        fichasTecnicas,
        movimentacoes,
        pedidos,
        calcularCustoInsumosProduto,
        verificarDisponibilidade,
        insumosComEstoqueBaixo,
        registrarMovimentacaoEstoque,
        adicionarInsumo,
        atualizarInsumo,
        adicionarProduto,
        atualizarProduto,
        excluirProduto,
        atualizarPrecoProduto,
        atualizarImagemProduto,
        atualizarFichaTecnica,
        criarPedido,
        atualizarStatusPedido,
        cancelarPedido,
        ultimoPedidoCriado,
        configuracaoPix,
        atualizarConfiguracaoPix,
        notificacaoSomAtiva,
        setNotificacaoSomAtiva,
        tocarSomNotificacao,
        resetarDados,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
