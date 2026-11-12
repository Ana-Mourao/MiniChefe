import { Insumo, ProdutoVenda, FichaTecnica, Usuario, Pedido, MovimentacaoEstoque, ConfiguracaoPix } from '../types';

export const initialConfiguracaoPix: ConfiguracaoPix = {
  tipoChave: 'EMAIL',
  chave: 'cantinho.minichefe@pagamentos.com.br',
  titular: 'Cantinho do Mini Chefe Fast Food',
  cidade: 'Fortaleza',
  banco: 'Banco Inter / NuBank',
};

export const initialUsuarios: Usuario[] = [
  {
    id: 1,
    nome: 'Ana Shirley',
    login: 'ana.gestor',
    perfil: 'GESTOR',
    cargo: 'Gerente Geral & Proprietária',
  },
  {
    id: 2,
    nome: 'Lucas Gabriel',
    login: 'lucas.caixa',
    perfil: 'ATENDENTE',
    cargo: 'Operador de Caixa & Balcão',
  },
  {
    id: 3,
    nome: 'Chef Rafaela',
    login: 'rafaela.chefe',
    perfil: 'COZINHA',
    cargo: 'Líder da Cozinha Mini Chefe',
  },
];

export const initialInsumos: Insumo[] = [
  {
    id: 1,
    nome: 'Massa de Pizza Mini Chefe (Broto)',
    unidadeMedida: 'un',
    quantidadeAtual: 85,
    estoqueMinimo: 20,
    custoUnitario: 1.10,
    categoriaInsumo: 'Massas',
  },
  {
    id: 2,
    nome: 'Molho de Tomate Rústico Artesanal',
    unidadeMedida: 'g',
    quantidadeAtual: 3500, // 3.5 kg
    estoqueMinimo: 800,
    custoUnitario: 0.015, // R$ 15 / kg -> 0.015 / g
    categoriaInsumo: 'Molhos',
  },
  {
    id: 3,
    nome: 'Queijo Mussarela Especial Ralado',
    unidadeMedida: 'g',
    quantidadeAtual: 2800, // 2.8 kg
    estoqueMinimo: 1000,
    custoUnitario: 0.038, // R$ 38 / kg -> 0.038 / g
    categoriaInsumo: 'Laticínios',
  },
  {
    id: 4,
    nome: 'Chocolate em Barra 50% Cacau',
    unidadeMedida: 'g',
    quantidadeAtual: 1800, // 1.8 kg
    estoqueMinimo: 500,
    custoUnitario: 0.045, // R$ 45 / kg
    categoriaInsumo: 'Confeitaria',
  },
  {
    id: 5,
    nome: 'Farinha de Trigo Premium',
    unidadeMedida: 'g',
    quantidadeAtual: 6000,
    estoqueMinimo: 1500,
    custoUnitario: 0.006, // R$ 6 / kg
    categoriaInsumo: 'Secos',
  },
  {
    id: 6,
    nome: 'Manteiga Extra sem Sal',
    unidadeMedida: 'g',
    quantidadeAtual: 1200,
    estoqueMinimo: 400,
    custoUnitario: 0.032,
    categoriaInsumo: 'Laticínios',
  },
  {
    id: 7,
    nome: 'Polpa de Maracujá 100% Fruta',
    unidadeMedida: 'ml',
    quantidadeAtual: 3800, // 3.8 Litros
    estoqueMinimo: 1000,
    custoUnitario: 0.014, // R$ 14 / Litro -> 0.014 / ml
    categoriaInsumo: 'Frutas',
  },
  {
    id: 8,
    nome: 'Açúcar Cristal Refinado',
    unidadeMedida: 'g',
    quantidadeAtual: 4200,
    estoqueMinimo: 1000,
    custoUnitario: 0.005,
    categoriaInsumo: 'Secos',
  },
  {
    id: 9,
    nome: 'Mini Pão de Hambúrguer Brioche',
    unidadeMedida: 'un',
    quantidadeAtual: 48,
    estoqueMinimo: 15,
    custoUnitario: 0.90,
    categoriaInsumo: 'Pães',
  },
  {
    id: 10,
    nome: 'Hambúrguer de Carne Bovina 90g',
    unidadeMedida: 'un',
    quantidadeAtual: 52,
    estoqueMinimo: 20,
    custoUnitario: 2.30,
    categoriaInsumo: 'Carnes',
  },
  {
    id: 11,
    nome: 'Queijo Cheddar Fatiado',
    unidadeMedida: 'fatias',
    quantidadeAtual: 90,
    estoqueMinimo: 25,
    custoUnitario: 0.60,
    categoriaInsumo: 'Laticínios',
  },
  {
    id: 12,
    nome: 'Batatinha Frita Palito Crocante',
    unidadeMedida: 'g',
    quantidadeAtual: 2400,
    estoqueMinimo: 800,
    custoUnitario: 0.016,
    categoriaInsumo: 'Congelados',
  },
  {
    id: 13,
    nome: 'Suco de Laranja Pera Natural',
    unidadeMedida: 'ml',
    quantidadeAtual: 950, // ATENÇÃO: estoque baixo para teste de alerta (< 1000)
    estoqueMinimo: 1000,
    custoUnitario: 0.011,
    categoriaInsumo: 'Bebidas',
  },
  {
    id: 14,
    nome: 'Copo Descartável com Tampa 400ml',
    unidadeMedida: 'un',
    quantidadeAtual: 14, // CRÍTICO: Estoque baixo alerta!
    estoqueMinimo: 40,
    custoUnitario: 0.35,
    categoriaInsumo: 'Embalagens',
  },
  {
    id: 15,
    nome: 'Caixinha de Pizza Mini Chefe Kraft',
    unidadeMedida: 'un',
    quantidadeAtual: 65,
    estoqueMinimo: 25,
    custoUnitario: 0.45,
    categoriaInsumo: 'Embalagens',
  },
];

export const initialProdutos: ProdutoVenda[] = [
  {
    id: 1,
    nome: 'Pizza Artesanal Mini Chefe',
    descricao: 'Pizza individual com massa artesanal crocante, molho de tomate rústico e queijo mussarela derretido com toque de orégano.',
    precoVenda: 5.50,
    categoria: 'Pizzas',
    ativo: true,
    tempoPreparoMinutos: 8,
    destaque: true,
    imagemUrl: '/src/assets/images/pizza_artesanal_1794496481086.jpg',
  },
  {
    id: 2,
    nome: 'Brownie Artesanal de Chocolate',
    descricao: 'Brownie fofinho e úmido com chocolate nobre 50% cacau e casquinha crocante irresistível.',
    precoVenda: 6.00,
    categoria: 'Sobremesas',
    ativo: true,
    tempoPreparoMinutos: 3,
    destaque: true,
    imagemUrl: '/src/assets/images/brownie_chocolate_1794496482239.jpg',
  },
  {
    id: 3,
    nome: 'Suco de Maracujá 100% Natural',
    descricao: 'Suco fresco batido na hora com polpa pura de maracujá selecionado. Refrescante e saboroso (400ml).',
    precoVenda: 5.00,
    categoria: 'Bebidas',
    ativo: true,
    tempoPreparoMinutos: 4,
    destaque: true,
    imagemUrl: '/src/assets/images/suco_maracuja_1794496481870.jpg',
  },
  {
    id: 4,
    nome: 'Combo Mini Chefe Supremo',
    descricao: '1 Pizza Artesanal + 1 Suco de Maracujá Natural + 1 Brownie Artesanal. A experiência mais pedida!',
    precoVenda: 15.00,
    categoria: 'Combos Kids',
    ativo: true,
    tempoPreparoMinutos: 10,
    destaque: true,
    imagemUrl: '/src/assets/images/combo_kids_1794496482443.jpg',
  },
  {
    id: 5,
    nome: 'Mini Burger Artesanal Smash',
    descricao: 'Pão brioche fofinho, smash burger bovino 90g grelhado no ponto e queijo cheddar cremoso.',
    precoVenda: 7.50,
    categoria: 'Lanches',
    ativo: true,
    tempoPreparoMinutos: 7,
    destaque: false,
    imagemUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 6,
    nome: 'Batata Frita Crocante Mini',
    descricao: 'Porção individual de batatinhas selecionadas, crocantes por fora e macias por dentro (150g).',
    precoVenda: 4.50,
    categoria: 'Lanches',
    ativo: true,
    tempoPreparoMinutos: 5,
    destaque: false,
    imagemUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 7,
    nome: 'Suco de Laranja da Fazenda',
    descricao: 'Suco 100% natural espremido a frio de laranjas pera doces e suculentas (400ml).',
    precoVenda: 5.00,
    categoria: 'Bebidas',
    ativo: true,
    tempoPreparoMinutos: 4,
    destaque: false,
    imagemUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 8,
    nome: 'Cookie Recheado Gotas de Chocolate',
    descricao: 'Cookie crocante amanteigado com recheio cremoso e generosas gotas de chocolate meio amargo.',
    precoVenda: 4.50,
    categoria: 'Sobremesas',
    ativo: true,
    tempoPreparoMinutos: 2,
    destaque: false,
    imagemUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop&q=80',
  },
];

export const initialFichasTecnicas: FichaTecnica[] = [
  // Pizza Artesanal Mini Chefe (id: 1)
  { id: 1, produtoId: 1, insumoId: 1, quantidadeNecessaria: 1 }, // 1 massa broto
  { id: 2, produtoId: 1, insumoId: 2, quantidadeNecessaria: 50 }, // 50g molho
  { id: 3, produtoId: 1, insumoId: 3, quantidadeNecessaria: 70 }, // 70g mussarela
  { id: 4, produtoId: 1, insumoId: 15, quantidadeNecessaria: 1 }, // 1 caixinha

  // Brownie Artesanal (id: 2)
  { id: 5, produtoId: 2, insumoId: 4, quantidadeNecessaria: 45 }, // 45g chocolate
  { id: 6, produtoId: 2, insumoId: 5, quantidadeNecessaria: 30 }, // 30g farinha
  { id: 7, produtoId: 2, insumoId: 6, quantidadeNecessaria: 25 }, // 25g manteiga
  { id: 8, produtoId: 2, insumoId: 8, quantidadeNecessaria: 20 }, // 20g acucar

  // Suco de Maracuja 100% Natural (id: 3)
  { id: 9, produtoId: 3, insumoId: 7, quantidadeNecessaria: 140 }, // 140ml polpa
  { id: 10, produtoId: 3, insumoId: 8, quantidadeNecessaria: 15 }, // 15g acucar
  { id: 11, produtoId: 3, insumoId: 14, quantidadeNecessaria: 1 }, // 1 copo

  // Combo Mini Chefe Supremo (id: 4) - Consome componentes da pizza + maracuja + brownie
  { id: 12, produtoId: 4, insumoId: 1, quantidadeNecessaria: 1 }, // massa pizza
  { id: 13, produtoId: 4, insumoId: 2, quantidadeNecessaria: 50 }, // molho
  { id: 14, produtoId: 4, insumoId: 3, quantidadeNecessaria: 70 }, // mussarela
  { id: 15, produtoId: 4, insumoId: 7, quantidadeNecessaria: 140 }, // polpa
  { id: 16, produtoId: 4, insumoId: 14, quantidadeNecessaria: 1 }, // copo
  { id: 17, produtoId: 4, insumoId: 4, quantidadeNecessaria: 45 }, // chocolate brownie
  { id: 18, produtoId: 4, insumoId: 15, quantidadeNecessaria: 1 }, // caixinha

  // Mini Burger Artesanal (id: 5)
  { id: 19, produtoId: 5, insumoId: 9, quantidadeNecessaria: 1 }, // 1 pao brioche
  { id: 20, produtoId: 5, insumoId: 10, quantidadeNecessaria: 1 }, // 1 burger 90g
  { id: 21, produtoId: 5, insumoId: 11, quantidadeNecessaria: 1 }, // 1 fatia cheddar

  // Batata Frita Crocante (id: 6)
  { id: 22, produtoId: 6, insumoId: 12, quantidadeNecessaria: 150 }, // 150g batata

  // Suco de Laranja (id: 7)
  { id: 23, produtoId: 7, insumoId: 13, quantidadeNecessaria: 350 }, // 350ml suco
  { id: 24, produtoId: 7, insumoId: 14, quantidadeNecessaria: 1 }, // 1 copo

  // Cookie Recheado (id: 8)
  { id: 25, produtoId: 8, insumoId: 5, quantidadeNecessaria: 35 }, // farinha
  { id: 26, produtoId: 8, insumoId: 4, quantidadeNecessaria: 25 }, // chocolate
  { id: 27, produtoId: 8, insumoId: 6, quantidadeNecessaria: 15 }, // manteiga
];

// Seed sample orders across today and yesterday for rich metrics
export const initialPedidos: Pedido[] = [
  {
    id: 101,
    numeroPedido: '#MC-101',
    clienteNome: 'Mariana Silva',
    tipoAtendimento: 'BALCAO',
    dataHora: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    dataHoraPreparoInicio: new Date(Date.now() - 43 * 60 * 1000).toISOString(),
    dataHoraPronto: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    dataHoraFinalizado: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'FINALIZADO',
    valorTotal: 16.50,
    usuarioId: 2,
    itens: [
      { id: 1, produtoId: 1, nomeProduto: 'Pizza Artesanal Mini Chefe', quantidade: 2, precoUnitario: 5.50, subtotal: 11.00, observacao: 'Bem douradinha' },
      { id: 2, produtoId: 3, nomeProduto: 'Suco de Maracujá 100% Natural', quantidade: 1, precoUnitario: 5.00, subtotal: 5.00 },
    ],
    pagamentos: [
      { id: 1, pedidoId: 101, forma: 'PIX', valorPago: 16.50, dataPagamento: new Date(Date.now() - 44 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 102,
    numeroPedido: '#MC-102',
    clienteNome: 'Bernardo & Mãe',
    tipoAtendimento: 'MESA',
    dataHora: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    dataHoraPreparoInicio: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    dataHoraPronto: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    dataHoraFinalizado: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    status: 'FINALIZADO',
    valorTotal: 21.00,
    usuarioId: 2,
    itens: [
      { id: 3, produtoId: 4, nomeProduto: 'Combo Mini Chefe Supremo', quantidade: 1, precoUnitario: 15.00, subtotal: 15.00, observacao: 'Com canudo ecológico' },
      { id: 4, produtoId: 2, nomeProduto: 'Brownie Artesanal de Chocolate', quantidade: 1, precoUnitario: 6.00, subtotal: 6.00 },
    ],
    pagamentos: [
      { id: 2, pedidoId: 102, forma: 'CARTAO_CREDITO', valorPago: 21.00, dataPagamento: new Date(Date.now() - 34 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 103,
    numeroPedido: '#MC-103',
    clienteNome: 'Clara Nogueira',
    tipoAtendimento: 'BALCAO',
    dataHora: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    dataHoraPreparoInicio: new Date(Date.now() - 16 * 60 * 1000).toISOString(),
    dataHoraPronto: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: 'PRONTO',
    valorTotal: 17.50,
    usuarioId: 2,
    itens: [
      { id: 5, produtoId: 5, nomeProduto: 'Mini Burger Artesanal Smash', quantidade: 1, precoUnitario: 7.50, subtotal: 7.50 },
      { id: 6, produtoId: 6, nomeProduto: 'Batata Frita Crocante Mini', quantidade: 1, precoUnitario: 4.50, subtotal: 4.50, observacao: 'Sal moderado' },
      { id: 7, produtoId: 1, nomeProduto: 'Pizza Artesanal Mini Chefe', quantidade: 1, precoUnitario: 5.50, subtotal: 5.50 },
    ],
    pagamentos: [
      { id: 3, pedidoId: 103, forma: 'DINHEIRO', valorPago: 20.00, valorTroco: 2.50, dataPagamento: new Date(Date.now() - 17 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 104,
    numeroPedido: '#MC-104',
    clienteNome: 'João Pedro Kids',
    tipoAtendimento: 'MESA',
    dataHora: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    dataHoraPreparoInicio: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    status: 'EM_PREPARO',
    valorTotal: 16.50,
    usuarioId: 2,
    itens: [
      { id: 8, produtoId: 1, nomeProduto: 'Pizza Artesanal Mini Chefe', quantidade: 1, precoUnitario: 5.50, subtotal: 5.50, observacao: 'Massa fina' },
      { id: 9, produtoId: 2, nomeProduto: 'Brownie Artesanal de Chocolate', quantidade: 1, precoUnitario: 6.00, subtotal: 6.00 },
      { id: 10, produtoId: 7, nomeProduto: 'Suco de Laranja da Fazenda', quantidade: 1, precoUnitario: 5.00, subtotal: 5.00 },
    ],
    pagamentos: [
      { id: 4, pedidoId: 104, forma: 'PIX', valorPago: 16.50, dataPagamento: new Date(Date.now() - 9 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 105,
    numeroPedido: '#MC-105',
    clienteNome: 'Sofia Santos',
    tipoAtendimento: 'BALCAO',
    dataHora: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    status: 'RECEBIDO',
    valorTotal: 15.00,
    usuarioId: 2,
    itens: [
      { id: 11, produtoId: 4, nomeProduto: 'Combo Mini Chefe Supremo', quantidade: 1, precoUnitario: 15.00, subtotal: 15.00, observacao: 'Para viagem na caixinha' },
    ],
    pagamentos: [
      { id: 5, pedidoId: 105, forma: 'CARTAO_DEBITO', valorPago: 15.00, dataPagamento: new Date(Date.now() - 2 * 60 * 1000).toISOString() }
    ]
  },
  // Yesterday's sample orders for trend metrics
  {
    id: 98,
    numeroPedido: '#MC-098',
    clienteNome: 'Gabriel Menezes',
    tipoAtendimento: 'BALCAO',
    dataHora: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    dataHoraPreparoInicio: new Date(Date.now() - 26 * 60 * 60 * 1000 + 2 * 60000).toISOString(),
    dataHoraPronto: new Date(Date.now() - 26 * 60 * 60 * 1000 + 9 * 60000).toISOString(),
    dataHoraFinalizado: new Date(Date.now() - 26 * 60 * 60 * 1000 + 15 * 60000).toISOString(),
    status: 'FINALIZADO',
    valorTotal: 30.00,
    usuarioId: 2,
    itens: [
      { id: 12, produtoId: 4, nomeProduto: 'Combo Mini Chefe Supremo', quantidade: 2, precoUnitario: 15.00, subtotal: 30.00 },
    ],
    pagamentos: [
      { id: 6, pedidoId: 98, forma: 'PIX', valorPago: 30.00, dataPagamento: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 99,
    numeroPedido: '#MC-099',
    clienteNome: 'Eduardo Costa',
    tipoAtendimento: 'DELIVERY',
    dataHora: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    dataHoraPreparoInicio: new Date(Date.now() - 25 * 60 * 60 * 1000 + 3 * 60000).toISOString(),
    dataHoraPronto: new Date(Date.now() - 25 * 60 * 60 * 1000 + 11 * 60000).toISOString(),
    dataHoraFinalizado: new Date(Date.now() - 25 * 60 * 60 * 1000 + 25 * 60000).toISOString(),
    status: 'FINALIZADO',
    valorTotal: 23.50,
    usuarioId: 2,
    itens: [
      { id: 13, produtoId: 1, nomeProduto: 'Pizza Artesanal Mini Chefe', quantidade: 2, precoUnitario: 5.50, subtotal: 11.00 },
      { id: 14, produtoId: 2, nomeProduto: 'Brownie Artesanal de Chocolate', quantidade: 1, precoUnitario: 6.00, subtotal: 6.00 },
      { id: 15, produtoId: 5, nomeProduto: 'Mini Burger Artesanal Smash', quantidade: 1, precoUnitario: 7.50, subtotal: 7.50, observacao: 'Sem cebola' },
    ],
    pagamentos: [
      { id: 7, pedidoId: 99, forma: 'CARTAO_CREDITO', valorPago: 23.50, dataPagamento: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString() }
    ]
  },
  // Day -2 (2 days ago)
  {
    id: 95,
    numeroPedido: '#MC-095',
    clienteNome: 'Carla Dias',
    tipoAtendimento: 'BALCAO',
    dataHora: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    status: 'FINALIZADO',
    valorTotal: 45.00,
    usuarioId: 2,
    itens: [
      { id: 16, produtoId: 4, nomeProduto: 'Combo Mini Chefe Supremo', quantidade: 3, precoUnitario: 15.00, subtotal: 45.00 },
    ],
    pagamentos: [{ id: 8, pedidoId: 95, forma: 'PIX', valorPago: 45.00, dataPagamento: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() }]
  },
  {
    id: 96,
    numeroPedido: '#MC-096',
    clienteNome: 'Felipe Rocha',
    tipoAtendimento: 'MESA',
    dataHora: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
    status: 'FINALIZADO',
    valorTotal: 32.50,
    usuarioId: 2,
    itens: [
      { id: 17, produtoId: 1, nomeProduto: 'Pizza Artesanal Mini Chefe', quantidade: 3, precoUnitario: 5.50, subtotal: 16.50 },
      { id: 18, produtoId: 3, nomeProduto: 'Suco de Maracujá 100% Natural', quantidade: 2, precoUnitario: 5.00, subtotal: 10.00 },
      { id: 19, produtoId: 2, nomeProduto: 'Brownie Artesanal de Chocolate', quantidade: 1, precoUnitario: 6.00, subtotal: 6.00 },
    ],
    pagamentos: [{ id: 9, pedidoId: 96, forma: 'CARTAO_DEBITO', valorPago: 32.50, dataPagamento: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString() }]
  },
  // Day -3 (3 days ago)
  {
    id: 91,
    numeroPedido: '#MC-091',
    clienteNome: 'Vanessa Lins',
    tipoAtendimento: 'BALCAO',
    dataHora: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    status: 'FINALIZADO',
    valorTotal: 60.00,
    usuarioId: 2,
    itens: [
      { id: 20, produtoId: 4, nomeProduto: 'Combo Mini Chefe Supremo', quantidade: 4, precoUnitario: 15.00, subtotal: 60.00 },
    ],
    pagamentos: [{ id: 10, pedidoId: 91, forma: 'PIX', valorPago: 60.00, dataPagamento: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString() }]
  },
  // Day -4 (4 days ago)
  {
    id: 87,
    numeroPedido: '#MC-087',
    clienteNome: 'Rodrigo Lima',
    tipoAtendimento: 'BALCAO',
    dataHora: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    status: 'FINALIZADO',
    valorTotal: 41.50,
    usuarioId: 2,
    itens: [
      { id: 21, produtoId: 1, nomeProduto: 'Pizza Artesanal Mini Chefe', quantidade: 4, precoUnitario: 5.50, subtotal: 22.00 },
      { id: 22, produtoId: 5, nomeProduto: 'Mini Burger Artesanal Smash', quantidade: 2, precoUnitario: 7.50, subtotal: 15.00 },
      { id: 23, produtoId: 6, nomeProduto: 'Batata Frita Crocante Mini', quantidade: 1, precoUnitario: 4.50, subtotal: 4.50 },
    ],
    pagamentos: [{ id: 11, pedidoId: 87, forma: 'CARTAO_CREDITO', valorPago: 41.50, dataPagamento: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString() }]
  },
  // Day -5 (5 days ago)
  {
    id: 83,
    numeroPedido: '#MC-083',
    clienteNome: 'Amanda Prado',
    tipoAtendimento: 'MESA',
    dataHora: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
    status: 'FINALIZADO',
    valorTotal: 52.00,
    usuarioId: 2,
    itens: [
      { id: 24, produtoId: 4, nomeProduto: 'Combo Mini Chefe Supremo', quantidade: 3, precoUnitario: 15.00, subtotal: 45.00 },
      { id: 25, produtoId: 8, nomeProduto: 'Cookie Recheado Gotas de Chocolate', quantidade: 1, precoUnitario: 4.50, subtotal: 4.50 },
    ],
    pagamentos: [{ id: 12, pedidoId: 83, forma: 'DINHEIRO', valorPago: 52.00, dataPagamento: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString() }]
  },
  // Day -6 (6 days ago)
  {
    id: 79,
    numeroPedido: '#MC-079',
    clienteNome: 'Juliana Barros',
    tipoAtendimento: 'BALCAO',
    dataHora: new Date(Date.now() - 144 * 60 * 60 * 1000).toISOString(),
    status: 'FINALIZADO',
    valorTotal: 38.00,
    usuarioId: 2,
    itens: [
      { id: 26, produtoId: 1, nomeProduto: 'Pizza Artesanal Mini Chefe', quantidade: 2, precoUnitario: 5.50, subtotal: 11.00 },
      { id: 27, produtoId: 2, nomeProduto: 'Brownie Artesanal de Chocolate', quantidade: 2, precoUnitario: 6.00, subtotal: 12.00 },
      { id: 28, produtoId: 4, nomeProduto: 'Combo Mini Chefe Supremo', quantidade: 1, precoUnitario: 15.00, subtotal: 15.00 },
    ],
    pagamentos: [{ id: 13, pedidoId: 79, forma: 'PIX', valorPago: 38.00, dataPagamento: new Date(Date.now() - 144 * 60 * 60 * 1000).toISOString() }]
  },
];

export const initialMovimentacoes: MovimentacaoEstoque[] = [
  {
    id: 1,
    insumoId: 1,
    nomeInsumo: 'Massa de Pizza Mini Chefe (Broto)',
    dataHora: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    tipo: 'ENTRADA',
    quantidade: 100,
    motivo: 'Recebimento de lote fresco do fornecedor Massas do Chefe',
    usuarioId: 1,
    nomeUsuario: 'Ana Shirley',
  },
  {
    id: 2,
    insumoId: 3,
    nomeInsumo: 'Queijo Mussarela Especial Ralado',
    dataHora: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    tipo: 'ENTRADA',
    quantidade: 4000,
    motivo: 'Compra semanal laticínio',
    usuarioId: 1,
    nomeUsuario: 'Ana Shirley',
  },
  {
    id: 3,
    insumoId: 7,
    nomeInsumo: 'Polpa de Maracujá 100% Fruta',
    dataHora: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    tipo: 'ENTRADA',
    quantidade: 5000,
    motivo: 'Reposição de polpas congeladas',
    usuarioId: 1,
    nomeUsuario: 'Ana Shirley',
  },
  {
    id: 4,
    insumoId: 14,
    nomeInsumo: 'Copo Descartável com Tampa 400ml',
    dataHora: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    tipo: 'SAIDA_PERDA',
    quantidade: 10,
    motivo: 'Lote danificado no transporte interno',
    usuarioId: 3,
    nomeUsuario: 'Chef Rafaela',
  },
];
