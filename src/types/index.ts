/**
 * Cantinho do Mini Chefe - Domain Types
 * Based on the Class Diagram: Usuario, Pedido, ItemPedido, ProdutoVenda,
 * FichaTecnica, Insumo, MovimentacaoEstoque, Pagamento.
 */

export type PerfilUsuario = 'GESTOR' | 'ATENDENTE' | 'COZINHA';

export interface Usuario {
  id: number;
  nome: string;
  login: string;
  senha?: string;
  perfil: PerfilUsuario;
  cargo: string;
}

export type StatusPedido = 'RECEBIDO' | 'EM_PREPARO' | 'PRONTO' | 'FINALIZADO' | 'CANCELADO';

export type FormaPagamento = 'PIX' | 'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO';

export type TipoChavePix = 'CNPJ' | 'EMAIL' | 'TELEFONE' | 'ALEATORIA' | 'CPF';

export interface ConfiguracaoPix {
  tipoChave: TipoChavePix;
  chave: string;
  titular: string;
  cidade: string;
  banco?: string;
}

export type TipoMovimentacao = 'ENTRADA' | 'SAIDA_VENDA' | 'SAIDA_PERDA' | 'AJUSTE';

export interface Insumo {
  id: number;
  nome: string;
  unidadeMedida: 'kg' | 'g' | 'ml' | 'L' | 'un' | 'fatias';
  quantidadeAtual: number;
  estoqueMinimo: number;
  custoUnitario: number; // Custo por unidade de medida
  categoriaInsumo?: string;
}

export interface FichaTecnica {
  id: number;
  produtoId: number;
  insumoId: number;
  quantidadeNecessaria: number; // Na mesma unidade de medida do Insumo
}

export interface ProdutoVenda {
  id: number;
  nome: string;
  descricao: string;
  precoVenda: number;
  categoria: 'Pizzas' | 'Bebidas' | 'Sobremesas' | 'Combos Kids' | 'Lanches';
  ativo: boolean;
  tempoPreparoMinutos: number;
  destaque?: boolean;
  imagemUrl?: string;
}

export interface ItemPedido {
  id: number;
  pedidoId?: number;
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  observacao?: string;
  subtotal: number;
}

export interface Pagamento {
  id: number;
  pedidoId: number;
  forma: FormaPagamento;
  valorPago: number;
  valorTroco?: number;
  dataPagamento: string;
  comprovanteTransacao?: string;
}

export interface Pedido {
  id: number;
  numeroPedido: string; // ex: #MC-042
  clienteNome: string;
  tipoAtendimento: 'BALCAO' | 'MESA' | 'DELIVERY';
  dataHora: string; // ISO String
  dataHoraPreparoInicio?: string;
  dataHoraPronto?: string;
  dataHoraFinalizado?: string;
  status: StatusPedido;
  valorTotal: number;
  itens: ItemPedido[];
  pagamentos: Pagamento[];
  usuarioId: number;
  observacoesGerais?: string;
}

export interface MovimentacaoEstoque {
  id: number;
  insumoId: number;
  nomeInsumo?: string;
  dataHora: string;
  tipo: TipoMovimentacao;
  quantidade: number;
  motivo: string;
  usuarioId: number;
  nomeUsuario?: string;
  pedidoId?: number;
}

export interface MetricasDesempenho {
  faturamentoTotal: number;
  totalPedidos: number;
  ticketMedio: number;
  tempoMedioPreparoMinutos: number;
  custoTotalInsumos: number;
  lucroBruto: number;
  margemLucroPercentual: number;
  pedidosPorStatus: Record<StatusPedido, number>;
  vendasPorFormaPagamento: Record<FormaPagamento, number>;
}
