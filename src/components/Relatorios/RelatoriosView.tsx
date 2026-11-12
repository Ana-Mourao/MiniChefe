import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Pedido, FormaPagamento, ProdutoVenda } from '../../types';
import { ModalEditarPreco } from '../ModalEditarPreco';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Clock,
  PieChart,
  Download,
  Printer,
  Calendar,
  Layers,
  Award,
  Sparkles,
  Tag,
  Edit3,
  FileText,
  Loader2,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const RelatoriosView: React.FC = () => {
  const { pedidos, produtos, fichasTecnicas, insumos, calcularCustoInsumosProduto } = useApp();

  const [periodo, setPeriodo] = useState<'HOJE' | 'ONTEM' | '7DIAS' | 'MES' | 'TODOS'>('TODOS');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('TODAS');
  const [ordenacaoProduto, setOrdenacaoProduto] = useState<'qtd' | 'faturamento' | 'lucro'>('qtd');
  const [produtoEditandoPreco, setProdutoEditandoPreco] = useState<ProdutoVenda | null>(null);
  const [gerandoPdf, setGerandoPdf] = useState(false);

  // Filter orders according to period
  const pedidosFiltrados = useMemo(() => {
    const agora = new Date();
    const hojeInicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()).getTime();
    const ontemInicio = hojeInicio - 24 * 60 * 60 * 1000;
    const seteDiasAtras = hojeInicio - 7 * 24 * 60 * 60 * 1000;
    const mesInicio = new Date(agora.getFullYear(), agora.getMonth(), 1).getTime();

    return pedidos.filter((p) => {
      if (p.status === 'CANCELADO') return false; // Ignore cancelled orders in revenue
      const timestamp = new Date(p.dataHora).getTime();

      switch (periodo) {
        case 'HOJE':
          return timestamp >= hojeInicio;
        case 'ONTEM':
          return timestamp >= ontemInicio && timestamp < hojeInicio;
        case '7DIAS':
          return timestamp >= seteDiasAtras;
        case 'MES':
          return timestamp >= mesInicio;
        case 'TODOS':
        default:
          return true;
      }
    });
  }, [pedidos, periodo]);

  // Overall Financial & Operational Metrics
  const metricas = useMemo(() => {
    let faturamento = 0;
    let custoInsumos = 0;
    let tempoTotalMinutos = 0;
    let pedidosComTempo = 0;

    const vendasPorForma: Record<FormaPagamento, number> = {
      PIX: 0,
      DINHEIRO: 0,
      CARTAO_CREDITO: 0,
      CARTAO_DEBITO: 0,
    };

    pedidosFiltrados.forEach((p) => {
      faturamento += p.valorTotal;

      // Add payments
      p.pagamentos.forEach((pag) => {
        if (vendasPorForma[pag.forma] !== undefined) {
          vendasPorForma[pag.forma] += pag.valorPago;
        }
      });

      // Calculate cost of items
      p.itens.forEach((it) => {
        const custoUnit = calcularCustoInsumosProduto(it.produtoId);
        custoInsumos += custoUnit * it.quantidade;
      });

      // Preparation time
      if (p.dataHoraPronto && p.dataHora) {
        const diffMin = Math.round(
          (new Date(p.dataHoraPronto).getTime() - new Date(p.dataHora).getTime()) / 60000
        );
        if (diffMin > 0 && diffMin < 120) {
          tempoTotalMinutos += diffMin;
          pedidosComTempo++;
        }
      }
    });

    const totalPedidos = pedidosFiltrados.length;
    const ticketMedio = totalPedidos > 0 ? faturamento / totalPedidos : 0;
    const lucroBruto = faturamento - custoInsumos;
    const margemBrutaPct = faturamento > 0 ? (lucroBruto / faturamento) * 100 : 0;
    const tempoMedio = pedidosComTempo > 0 ? tempoTotalMinutos / pedidosComTempo : 6.8;

    return {
      faturamento,
      custoInsumos,
      lucroBruto,
      margemBrutaPct,
      totalPedidos,
      ticketMedio,
      tempoMedio,
      vendasPorForma,
    };
  }, [pedidosFiltrados, calcularCustoInsumosProduto]);

  // CATEGORY REPORT METRICS
  const relatorioCategorias = useMemo(() => {
    const catsMap: Record<
      string,
      {
        categoria: string;
        unidades: number;
        faturamento: number;
        custoInsumos: number;
        lucro: number;
      }
    > = {};

    pedidosFiltrados.forEach((p) => {
      p.itens.forEach((it) => {
        const prod = produtos.find((pr) => pr.id === it.produtoId);
        const cat = prod ? prod.categoria : 'Outros';

        if (!catsMap[cat]) {
          catsMap[cat] = {
            categoria: cat,
            unidades: 0,
            faturamento: 0,
            custoInsumos: 0,
            lucro: 0,
          };
        }

        const custoUnit = calcularCustoInsumosProduto(it.produtoId);
        const custoTotalItem = custoUnit * it.quantidade;

        catsMap[cat].unidades += it.quantidade;
        catsMap[cat].faturamento += it.subtotal;
        catsMap[cat].custoInsumos += custoTotalItem;
        catsMap[cat].lucro += it.subtotal - custoTotalItem;
      });
    });

    return Object.values(catsMap).sort((a, b) => b.faturamento - a.faturamento);
  }, [pedidosFiltrados, produtos, calcularCustoInsumosProduto]);

  // PRODUCT DETAILED REPORT METRICS
  const relatorioProdutos = useMemo(() => {
    const prodMap: Record<
      number,
      {
        id: number;
        nome: string;
        categoria: string;
        precoVenda: number;
        unidades: number;
        faturamento: number;
        custoTotal: number;
        lucroTotal: number;
        margemPct: number;
        imagemUrl?: string;
      }
    > = {};

    // Initialize all products so 0-sales items also appear if needed
    produtos.forEach((p) => {
      prodMap[p.id] = {
        id: p.id,
        nome: p.nome,
        categoria: p.categoria,
        precoVenda: p.precoVenda,
        unidades: 0,
        faturamento: 0,
        custoTotal: 0,
        lucroTotal: 0,
        margemPct: 0,
        imagemUrl: p.imagemUrl,
      };
    });

    pedidosFiltrados.forEach((p) => {
      p.itens.forEach((it) => {
        if (!prodMap[it.produtoId]) {
          prodMap[it.produtoId] = {
            id: it.produtoId,
            nome: it.nomeProduto,
            categoria: 'Geral',
            precoVenda: it.precoUnitario,
            unidades: 0,
            faturamento: 0,
            custoTotal: 0,
            lucroTotal: 0,
            margemPct: 0,
          };
        }

        const custoUnit = calcularCustoInsumosProduto(it.produtoId);
        prodMap[it.produtoId].unidades += it.quantidade;
        prodMap[it.produtoId].faturamento += it.subtotal;
        prodMap[it.produtoId].custoTotal += custoUnit * it.quantidade;
      });
    });

    const lista = Object.values(prodMap).map((item) => {
      const lucroTotal = item.faturamento - item.custoTotal;
      const margemPct = item.faturamento > 0 ? (lucroTotal / item.faturamento) * 100 : 0;
      return { ...item, lucroTotal, margemPct };
    });

    // Apply category filter if selected
    const filtrados = lista.filter(
      (p) => categoriaFiltro === 'TODAS' || p.categoria === categoriaFiltro
    );

    // Sort
    return filtrados.sort((a, b) => {
      if (ordenacaoProduto === 'qtd') return b.unidades - a.unidades;
      if (ordenacaoProduto === 'faturamento') return b.faturamento - a.faturamento;
      return b.lucroTotal - a.lucroTotal;
    });
  }, [pedidosFiltrados, produtos, categoriaFiltro, ordenacaoProduto, calcularCustoInsumosProduto]);

  // Hourly distribution for peak analysis (Fast food lunch & afternoon snack)
  const vendasPorHora = useMemo(() => {
    const horas: Record<number, number> = {};
    for (let h = 9; h <= 22; h++) {
      horas[h] = 0;
    }

    pedidosFiltrados.forEach((p) => {
      const h = new Date(p.dataHora).getHours();
      if (horas[h] !== undefined) {
        horas[h] += p.valorTotal;
      }
    });

    const maxVal = Math.max(...Object.values(horas), 1);
    return Object.entries(horas).map(([horaStr, valor]) => ({
      hora: Number(horaStr),
      horaFormatada: `${horaStr}h`,
      valor,
      alturaPct: Math.round((valor / maxVal) * 100),
    }));
  }, [pedidosFiltrados]);

  // Faturamento diário ao longo da última semana para o gráfico Recharts
  const faturamentoDiarioSemana = useMemo(() => {
    const agora = new Date();
    const resultado = [];

    // Últimos 7 dias (do 6º dia atrás até hoje)
    for (let i = 6; i >= 0; i--) {
      const dataRef = new Date(agora);
      dataRef.setDate(agora.getDate() - i);
      dataRef.setHours(0, 0, 0, 0);

      const dataFim = new Date(dataRef);
      dataFim.setHours(23, 59, 59, 999);

      const inicioTimestamp = dataRef.getTime();
      const fimTimestamp = dataFim.getTime();

      const pedidosDoDia = pedidos.filter((p) => {
        if (p.status === 'CANCELADO') return false;
        const t = new Date(p.dataHora).getTime();
        return t >= inicioTimestamp && t <= fimTimestamp;
      });

      const faturamento = pedidosDoDia.reduce((acc, p) => acc + p.valorTotal, 0);
      const qtdPedidos = pedidosDoDia.length;
      const ticketMedio = qtdPedidos > 0 ? faturamento / qtdPedidos : 0;

      const diaSemana = dataRef.toLocaleDateString('pt-BR', { weekday: 'short' });
      const diaMes = dataRef.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const diaFormatado =
        i === 0
          ? `Hoje (${diaMes})`
          : `${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1, 3)} ${diaMes}`;

      resultado.push({
        dataIso: dataRef.toISOString(),
        diaFormatado,
        faturamento: Number(faturamento.toFixed(2)),
        pedidos: qtdPedidos,
        ticketMedio: Number(ticketMedio.toFixed(2)),
      });
    }

    return resultado;
  }, [pedidos]);

  const totalFaturamentoSemana = useMemo(() => {
    return faturamentoDiarioSemana.reduce((acc, d) => acc + d.faturamento, 0);
  }, [faturamentoDiarioSemana]);

  const mediaDiariaSemana = useMemo(() => {
    return totalFaturamentoSemana / (faturamentoDiarioSemana.length || 1);
  }, [totalFaturamentoSemana, faturamentoDiarioSemana]);

  const melhorDiaSemana = useMemo(() => {
    if (faturamentoDiarioSemana.length === 0) return null;
    return [...faturamentoDiarioSemana].sort((a, b) => b.faturamento - a.faturamento)[0];
  }, [faturamentoDiarioSemana]);

  // Export full CSV report
  const exportarRelatorioCsv = () => {
    let csv = '=== CANTINHO DO MINI CHEFE - RELATÓRIO GERENCIAL ===\n';
    csv += `Período: ${periodo}\n`;
    csv += `Data de Emissão: ${new Date().toLocaleString('pt-BR')}\n\n`;

    csv += '--- MÉTRICAS GERAIS ---\n';
    csv += `Faturamento Total,R$ ${metricas.faturamento.toFixed(2)}\n`;
    csv += `Custo Insumos (CMV),R$ ${metricas.custoInsumos.toFixed(2)}\n`;
    csv += `Lucro Bruto,R$ ${metricas.lucroBruto.toFixed(2)}\n`;
    csv += `Margem Lucro,${metricas.margemBrutaPct.toFixed(1)}%\n`;
    csv += `Total de Pedidos,${metricas.totalPedidos}\n`;
    csv += `Ticket Médio,R$ ${metricas.ticketMedio.toFixed(2)}\n\n`;

    csv += '--- RELATÓRIO POR CATEGORIA ---\n';
    csv += 'Categoria,Unidades Vendidas,Faturamento Total,Custo Insumos,Lucro Bruto,Margem %\n';
    relatorioCategorias.forEach((c) => {
      const m = c.faturamento > 0 ? ((c.lucro / c.faturamento) * 100).toFixed(1) : '0.0';
      csv += `"${c.categoria}",${c.unidades},R$ ${c.faturamento.toFixed(2)},R$ ${c.custoInsumos.toFixed(
        2
      )},R$ ${c.lucro.toFixed(2)},${m}%\n`;
    });
    csv += '\n';

    csv += '--- RELATÓRIO DETALHADO POR PRODUTO ---\n';
    csv += 'Ranking,Produto,Categoria,Preço Venda,Qtd Vendida,Faturamento,Custo Insumos,Lucro Bruto,Margem %\n';
    relatorioProdutos.forEach((p, idx) => {
      csv += `${idx + 1},"${p.nome}","${p.categoria}",R$ ${p.precoVenda.toFixed(2)},${
        p.unidades
      },R$ ${p.faturamento.toFixed(2)},R$ ${p.custoTotal.toFixed(2)},R$ ${p.lucroTotal.toFixed(
        2
      )},${p.margemPct.toFixed(1)}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_gerencial_minichefe_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export formatted executive PDF report for management meetings
  const exportarRelatorioPdf = () => {
    try {
      setGerandoPdf(true);
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margemEsq = 14;
      const margemDir = 14;
      const larguraUtil = pageWidth - margemEsq - margemDir;

      const formatarMoeda = (val: number) =>
        `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      const labelsPeriodo: Record<string, string> = {
        HOJE: 'Hoje',
        ONTEM: 'Ontem',
        '7DIAS': 'Últimos 7 Dias',
        MES: 'Este Mês',
        TODOS: 'Histórico Completo',
      };
      const nomePeriodo = labelsPeriodo[periodo] || periodo;

      // 1. Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 32, 'F');

      // Top golden accent stripe
      doc.setFillColor(245, 158, 11); // amber-500
      doc.rect(0, 0, pageWidth, 3.5, 'F');

      // Brand Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.text('CANTINHO DO MINI CHEFE', margemEsq, 13.5);

      // Subtitle & Slogan
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(245, 158, 11); // amber-500
      doc.text('FAST FOOD & LANCHES KIDS  •  PEQUENO CHEFE E GRANDES SABORES', margemEsq, 19.5);

      // Document Category badge
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text('RELATÓRIO GERENCIAL EXECUTIVO', pageWidth - margemDir, 13.5, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(
        `Emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })}  •  Gestora: Ana Shirley`,
        pageWidth - margemDir,
        19.5,
        { align: 'right' }
      );

      // Filter context bar
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(margemEsq, 35, larguraUtil, 9, 'F');
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.setLineWidth(0.2);
      doc.rect(margemEsq, 35, larguraUtil, 9, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text('PERÍODO:', margemEsq + 4, 41);
      doc.setFont('helvetica', 'normal');
      doc.text(`${nomePeriodo.toUpperCase()}`, margemEsq + 20, 41);

      doc.setFont('helvetica', 'bold');
      doc.text('CATEGORIA:', margemEsq + 62, 41);
      doc.setFont('helvetica', 'normal');
      doc.text(categoriaFiltro === 'TODAS' ? 'TODAS AS CATEGORIAS' : categoriaFiltro.toUpperCase(), margemEsq + 83, 41);

      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL DE PEDIDOS:', margemEsq + 130, 41);
      doc.setFont('helvetica', 'normal');
      doc.text(`${metricas.totalPedidos} pedidos atendidos`, margemEsq + 160, 41);

      // 2. Executive KPI Cards Table
      autoTable(doc, {
        startY: 47,
        head: [['FATURAMENTO BRUTO', 'CUSTO INSUMOS (CMV)', 'LUCRO BRUTO', 'MARGEM BRUTA', 'TICKET MÉDIO', 'TEMPO COZINHA']],
        body: [
          [
            formatarMoeda(metricas.faturamento),
            formatarMoeda(metricas.custoInsumos),
            formatarMoeda(metricas.lucroBruto),
            `${metricas.margemBrutaPct.toFixed(1)}%`,
            formatarMoeda(metricas.ticketMedio),
            `${metricas.tempoMedio.toFixed(1)} min`,
          ],
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [248, 250, 252],
          fontSize: 7.5,
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: 2.2,
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
          textColor: [15, 23, 42],
          fontSize: 8.5,
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: 2.5,
        },
        columnStyles: {
          0: { textColor: [15, 23, 42], fontStyle: 'bold' },
          1: { textColor: [225, 29, 72] }, // red/rose CMV
          2: { textColor: [16, 185, 129] }, // emerald Lucro
          3: { textColor: [16, 185, 129] },
          4: { textColor: [217, 119, 6] }, // amber Ticket
          5: { textColor: [30, 41, 59] },
        },
        margin: { left: margemEsq, right: margemDir },
      });

      let currentY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 6 : 65;

      // 3. Weekly Revenue Table (Faturamento Diário da Semana)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('1. FATURAMENTO DIÁRIO DOS ÚLTIMOS 7 DIAS (TENDÊNCIA SEMANAL)', margemEsq, currentY);

      const semanaRows: (string | number)[][] = faturamentoDiarioSemana.map((d) => {
        const perc =
          totalFaturamentoSemana > 0
            ? ((d.faturamento / totalFaturamentoSemana) * 100).toFixed(1) + '%'
            : '0.0%';
        return [
          d.diaFormatado,
          `${d.pedidos} pedidos`,
          formatarMoeda(d.faturamento),
          formatarMoeda(d.ticketMedio),
          perc,
        ];
      });

      // Total row
      const totalPedidosSemana = faturamentoDiarioSemana.reduce((acc, d) => acc + d.pedidos, 0);
      semanaRows.push([
        'TOTAL DOS 7 DIAS',
        `${totalPedidosSemana} pedidos`,
        formatarMoeda(totalFaturamentoSemana),
        formatarMoeda(mediaDiariaSemana),
        '100.0%',
      ]);

      autoTable(doc, {
        startY: currentY + 2,
        head: [['Dia / Data', 'Qtd Pedidos', 'Faturamento (R$)', 'Ticket Médio (R$)', 'Participação']],
        body: semanaRows,
        theme: 'striped',
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontSize: 7.5,
          fontStyle: 'bold',
          cellPadding: 1.8,
        },
        bodyStyles: {
          fontSize: 7.5,
          cellPadding: 1.8,
        },
        columnStyles: {
          0: { cellWidth: 48, fontStyle: 'bold' },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 36, halign: 'right', fontStyle: 'bold' },
          3: { cellWidth: 36, halign: 'right' },
          4: { cellWidth: 32, halign: 'center' },
        },
        didParseCell: (data) => {
          if (data.row.index === semanaRows.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [241, 245, 249];
          }
        },
        margin: { left: margemEsq, right: margemDir },
      });

      currentY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 6 : currentY + 45;

      // 4. Performance by Category
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('2. DESEMPENHO CONSOLIDADO POR CATEGORIA DE PRODUTOS', margemEsq, currentY);

      const catRows: (string | number)[][] = relatorioCategorias.map((c) => {
        const margem = c.faturamento > 0 ? ((c.lucro / c.faturamento) * 100).toFixed(1) + '%' : '0.0%';
        const part =
          metricas.faturamento > 0
            ? ((c.faturamento / metricas.faturamento) * 100).toFixed(1) + '%'
            : '0.0%';
        return [
          c.categoria,
          `${c.unidades} un`,
          formatarMoeda(c.faturamento),
          formatarMoeda(c.custoInsumos),
          formatarMoeda(c.lucro),
          margem,
          part,
        ];
      });

      autoTable(doc, {
        startY: currentY + 2,
        head: [['Categoria', 'Qtd Vendida', 'Faturamento (R$)', 'Custo Insumos', 'Lucro Bruto', 'Margem %', 'Mix Vendas']],
        body: catRows,
        theme: 'striped',
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontSize: 7.5,
          fontStyle: 'bold',
          cellPadding: 1.8,
        },
        bodyStyles: {
          fontSize: 7.5,
          cellPadding: 1.8,
        },
        columnStyles: {
          0: { cellWidth: 42, fontStyle: 'bold' },
          1: { cellWidth: 22, halign: 'center' },
          2: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
          3: { cellWidth: 26, halign: 'right' },
          4: { cellWidth: 26, halign: 'right', fontStyle: 'bold', textColor: [16, 185, 129] },
          5: { cellWidth: 20, halign: 'center' },
          6: { cellWidth: 20, halign: 'center' },
        },
        margin: { left: margemEsq, right: margemDir },
      });

      currentY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 6 : currentY + 45;

      // Check if space remains for product ranking or add page
      if (currentY > 195) {
        doc.addPage();
        currentY = 18;
      }

      // 5. Product Detailed Ranking Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      const tituloTabelaProd = `3. RANKING E DESEMPENHO DETALHADO POR PRODUTO (${
        categoriaFiltro === 'TODAS' ? 'TODAS AS CATEGORIAS' : categoriaFiltro.toUpperCase()
      })`;
      doc.text(tituloTabelaProd, margemEsq, currentY);

      const prodRows: (string | number)[][] = relatorioProdutos.map((p, idx) => {
        return [
          `${idx + 1}º`,
          p.nome,
          p.categoria,
          formatarMoeda(p.precoVenda),
          `${p.unidades} un`,
          formatarMoeda(p.faturamento),
          formatarMoeda(p.custoTotal),
          formatarMoeda(p.lucroTotal),
          `${p.margemPct.toFixed(1)}%`,
        ];
      });

      autoTable(doc, {
        startY: currentY + 2,
        head: [['#', 'Produto', 'Categoria', 'Preço Unit.', 'Qtd', 'Faturamento', 'Custo CMV', 'Lucro Bruto', 'Margem']],
        body: prodRows,
        theme: 'striped',
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontSize: 7.2,
          fontStyle: 'bold',
          cellPadding: 1.8,
        },
        bodyStyles: {
          fontSize: 7.2,
          cellPadding: 1.8,
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 46, fontStyle: 'bold' },
          2: { cellWidth: 24 },
          3: { cellWidth: 20, halign: 'right' },
          4: { cellWidth: 16, halign: 'center' },
          5: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
          6: { cellWidth: 20, halign: 'right' },
          7: { cellWidth: 22, halign: 'right', fontStyle: 'bold', textColor: [16, 185, 129] },
          8: { cellWidth: 16, halign: 'center' },
        },
        margin: { left: margemEsq, right: margemDir },
      });

      // 6. Payment Breakdown Box
      let finalTableY = (doc as any).lastAutoTable?.finalY || currentY + 50;
      if (finalTableY > 230) {
        doc.addPage();
        finalTableY = 18;
      } else {
        finalTableY += 6;
      }

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margemEsq, finalTableY, larguraUtil, 21, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margemEsq, finalTableY, larguraUtil, 21, 2, 2, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text('DISTRIBUIÇÃO DE FORMAS DE PAGAMENTO NO PERÍODO:', margemEsq + 4, finalTableY + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      const pix = metricas.vendasPorForma?.PIX || 0;
      const cc = metricas.vendasPorForma?.CARTAO_CREDITO || 0;
      const cd = metricas.vendasPorForma?.CARTAO_DEBITO || 0;
      const din = metricas.vendasPorForma?.DINHEIRO || 0;
      const totalPag = pix + cc + cd + din || 1;

      const pPix = ((pix / totalPag) * 100).toFixed(1);
      const pCc = ((cc / totalPag) * 100).toFixed(1);
      const pCd = ((cd / totalPag) * 100).toFixed(1);
      const pDin = ((din / totalPag) * 100).toFixed(1);

      doc.text(`• PIX: ${formatarMoeda(pix)} (${pPix}%)`, margemEsq + 4, finalTableY + 12);
      doc.text(`• Cartão de Crédito: ${formatarMoeda(cc)} (${pCc}%)`, margemEsq + 48, finalTableY + 12);
      doc.text(`• Cartão de Débito: ${formatarMoeda(cd)} (${pCd}%)`, margemEsq + 102, finalTableY + 12);
      doc.text(`• Dinheiro em Espécie: ${formatarMoeda(din)} (${pDin}%)`, margemEsq + 144, finalTableY + 12);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        'Nota: Relatório gerado automaticamente para alinhamento estratégico, reuniões de diretoria e auditoria do Cantinho do Mini Chefe.',
        margemEsq + 4,
        finalTableY + 17.5
      );

      // 7. Footer on Every Page
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(margemEsq, 287, pageWidth - margemDir, 287);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(
          'Cantinho do Mini Chefe Fast Food  •  Documento Confidencial de Gestão  •  Pequeno chefe e grandes sabores',
          margemEsq,
          291
        );
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - margemDir, 291, { align: 'right' });
      }

      // Download file
      const dataArquivo = new Date().toISOString().slice(0, 10);
      doc.save(`relatorio_gerencial_minichefe_${periodo.toLowerCase()}_${dataArquivo}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Não foi possível gerar o PDF. Por favor, tente novamente.');
    } finally {
      setGerandoPdf(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Period Selector */}
      <div className="bg-[#0a1022]/90 backdrop-blur-md rounded-3xl p-6 text-white shadow-[0_0_25px_rgba(0,240,255,0.08)] border border-cyan-500/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_15px_rgba(255,184,0,0.4)]">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-brand font-black text-2xl text-white neon-text-amber">
                Relatórios de Vendas &amp; Desempenho
              </h1>
              <p className="text-xs text-cyan-300/80 font-mono">
                Painel do Gestor &bull; Análise de lucratividade, produtos e categorias em tempo real.
              </p>
            </div>
          </div>
        </div>

        {/* Period Selector & Export Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-[#060b17] rounded-xl border border-cyan-500/30">
            {[
              { id: 'HOJE', label: 'Hoje' },
              { id: 'ONTEM', label: 'Ontem' },
              { id: '7DIAS', label: '7 Dias' },
              { id: 'MES', label: 'Este Mês' },
              { id: 'TODOS', label: 'Histórico' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriodo(p.id as typeof periodo)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer font-mono ${
                  periodo === p.id
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black shadow-[0_0_12px_rgba(255,184,0,0.4)]'
                    : 'text-slate-400 hover:text-cyan-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportarRelatorioPdf}
              disabled={gerandoPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer shadow-[0_0_15px_rgba(255,184,0,0.35)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              title="Gerar documento PDF formatado com dados da tela para reuniões de gestão"
            >
              {gerandoPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <FileText className="w-4 h-4 text-slate-950" />
              )}
              <span>{gerandoPdf ? 'Gerando...' : 'Exportar PDF'}</span>
            </button>
            <button
              onClick={exportarRelatorioCsv}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Baixar dados em planilha CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Imprimir relatório gerencial"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (Cyber Dark with Neon Accents) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Faturamento */}
        <div className="bg-[#0a1022]/90 backdrop-blur-md p-4 rounded-2xl border border-cyan-500/20 shadow-[0_0_15px_rgba(0,240,255,0.06)] hover:border-cyan-500/40 transition-all space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider font-mono">
            Faturamento Bruto
          </span>
          <div className="font-mono font-black text-xl neon-text-cyan tabular-nums">
            R$ {metricas.faturamento.toFixed(2).replace('.', ',')}
          </div>
          <span className="text-[10px] text-cyan-400 font-mono font-bold block">
            {metricas.totalPedidos} vendas registradas
          </span>
        </div>

        {/* Custo Insumos CMV */}
        <div className="bg-[#0a1022]/90 backdrop-blur-md p-4 rounded-2xl border border-cyan-500/20 shadow-[0_0_15px_rgba(0,240,255,0.06)] hover:border-cyan-500/40 transition-all space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider font-mono">
            Custo Insumos (CMV)
          </span>
          <div className="font-mono font-black text-xl text-slate-300 tabular-nums">
            R$ {metricas.custoInsumos.toFixed(2).replace('.', ',')}
          </div>
          <span className="text-[10px] text-slate-500 font-mono block">
            Baixa via Ficha Técnica
          </span>
        </div>

        {/* Lucro Bruto */}
        <div className="bg-[#0a1022]/90 backdrop-blur-md p-4 rounded-2xl border border-cyan-500/20 shadow-[0_0_15px_rgba(0,240,255,0.06)] hover:border-cyan-500/40 transition-all space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider font-mono">
            Lucro Bruto
          </span>
          <div className="font-mono font-black text-xl neon-text-lime tabular-nums">
            R$ {metricas.lucroBruto.toFixed(2).replace('.', ',')}
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-bold block">
            Margem: {metricas.margemBrutaPct.toFixed(1)}%
          </span>
        </div>

        {/* Ticket Médio */}
        <div className="bg-[#0a1022]/90 backdrop-blur-md p-4 rounded-2xl border border-cyan-500/20 shadow-[0_0_15px_rgba(0,240,255,0.06)] hover:border-cyan-500/40 transition-all space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider font-mono">
            Ticket Médio
          </span>
          <div className="font-mono font-black text-xl neon-text-amber tabular-nums">
            R$ {metricas.ticketMedio.toFixed(2).replace('.', ',')}
          </div>
          <span className="text-[10px] text-amber-400/80 font-mono block">Média por pedido</span>
        </div>

        {/* Total Pedidos */}
        <div className="bg-[#0a1022]/90 backdrop-blur-md p-4 rounded-2xl border border-cyan-500/20 shadow-[0_0_15px_rgba(0,240,255,0.06)] hover:border-cyan-500/40 transition-all space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider font-mono">
            Pedidos Atendidos
          </span>
          <div className="font-mono font-black text-xl text-white tabular-nums">
            {metricas.totalPedidos}
          </div>
          <span className="text-[10px] text-cyan-400 font-mono font-bold block">Concluídos com sucesso</span>
        </div>

        {/* Tempo Médio */}
        <div className="bg-[#0a1022]/90 backdrop-blur-md p-4 rounded-2xl border border-cyan-500/20 shadow-[0_0_15px_rgba(0,240,255,0.06)] hover:border-cyan-500/40 transition-all space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider font-mono">
            Tempo Médio Cozinha
          </span>
          <div className="font-mono font-black text-xl neon-text-amber tabular-nums">
            {metricas.tempoMedio.toFixed(0)} min
          </div>
          <span className="text-[10px] text-amber-300 font-mono font-bold block">Meta fast-food: &le; 10 min</span>
        </div>
      </div>

      {/* RECHARTS: GRÁFICO DE LINHAS - FATURAMENTO DIÁRIO NA ÚLTIMA SEMANA */}
      <div className="bg-[#0a1022]/90 backdrop-blur-md rounded-3xl p-6 border border-cyan-500/25 shadow-[0_0_25px_rgba(0,240,255,0.08)] space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <h2 className="font-brand font-bold text-base text-white neon-text-cyan">
                Evolução do Faturamento Diário &bull; Última Semana
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Receita diária do Cantinho do Mini Chefe dia a dia ao longo dos últimos 7 dias
            </p>
          </div>

          {/* Quick Metrics of the Week */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-[#060b17] border border-amber-500/30 px-3 py-1.5 rounded-xl shadow-[0_0_10px_rgba(255,184,0,0.1)]">
              <span className="text-[10px] text-amber-400 font-semibold block uppercase tracking-wider font-mono">
                Total da Semana
              </span>
              <span className="font-mono font-bold text-sm neon-text-amber tabular-nums">
                R$ {totalFaturamentoSemana.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div className="bg-[#060b17] border border-cyan-500/30 px-3 py-1.5 rounded-xl shadow-[0_0_10px_rgba(0,240,255,0.1)]">
              <span className="text-[10px] text-cyan-400 font-semibold block uppercase tracking-wider font-mono">
                Média Diária
              </span>
              <span className="font-mono font-bold text-sm text-cyan-200 tabular-nums">
                R$ {mediaDiariaSemana.toFixed(2).replace('.', ',')}
              </span>
            </div>

            {melhorDiaSemana && melhorDiaSemana.faturamento > 0 && (
              <div className="bg-[#060b17] border border-emerald-500/30 px-3 py-1.5 rounded-xl shadow-[0_0_10px_rgba(0,255,136,0.1)]">
                <span className="text-[10px] text-emerald-400 font-semibold block uppercase tracking-wider font-mono">
                  Pico da Semana
                </span>
                <span className="font-mono font-bold text-sm neon-text-lime tabular-nums">
                  R$ {melhorDiaSemana.faturamento.toFixed(2).replace('.', ',')} ({melhorDiaSemana.diaFormatado})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Recharts LineChart Canvas with Futuristic Neon Glow */}
        <div className="w-full h-72 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={faturamentoDiarioSemana}
              margin={{ top: 15, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#13203c" vertical={false} />
              <XAxis
                dataKey="diaFormatado"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#1e293b' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#1e293b' }}
                tickFormatter={(val) => `R$ ${val}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as (typeof faturamentoDiarioSemana)[0];
                    return (
                      <div className="bg-[#060b17] text-white p-3.5 rounded-2xl shadow-[0_0_20px_rgba(0,240,255,0.3)] border border-cyan-500/40 text-xs space-y-1.5 min-w-[190px]">
                        <p className="font-brand font-bold text-amber-300 text-sm border-b border-cyan-500/20 pb-1 font-mono">
                          {label}
                        </p>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-400">Faturamento:</span>
                          <span className="font-mono font-bold neon-text-cyan tabular-nums">
                            R$ {data.faturamento.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-400">Pedidos:</span>
                          <span className="font-mono font-bold text-white tabular-nums">
                            {data.pedidos} vendas
                          </span>
                        </div>
                        {data.ticketMedio > 0 && (
                          <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800">
                            <span className="text-slate-400">Ticket Médio:</span>
                            <span className="font-mono font-bold neon-text-amber tabular-nums">
                              R$ {data.ticketMedio.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="faturamento"
                name="Faturamento (R$)"
                stroke="#00f0ff"
                strokeWidth={3.5}
                dot={{ r: 4, fill: '#00f0ff', stroke: '#060b17', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#ffb800', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Visual Analytics Split: Hourly Distribution & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Sales Bar Graph */}
        <div className="lg:col-span-8 bg-[#0a1022]/90 backdrop-blur-md p-5 rounded-2xl border border-cyan-500/20 shadow-[0_0_20px_rgba(0,240,255,0.06)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-brand font-bold text-white text-sm neon-text-cyan">
                Distribuição de Vendas por Horário (Picos de Atendimento)
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Identifique horários de pico (almoço e lanche) para organizar a equipe
              </p>
            </div>
            <span className="text-xs font-semibold text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-2.5 py-1 rounded-lg font-mono">
              9h às 22h
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-1 sm:gap-2 pt-6 pb-2 px-2 border-b border-slate-800/80">
            {vendasPorHora.map((item) => (
              <div
                key={item.hora}
                className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
              >
                {/* Value tooltip on hover */}
                {item.valor > 0 && (
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-[#060b17] border border-cyan-500/40 text-cyan-300 text-[10px] font-mono px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(0,240,255,0.3)] pointer-events-none whitespace-nowrap z-10">
                    R$ {item.valor.toFixed(0)}
                  </div>
                )}

                <div
                  style={{ height: `${Math.max(4, item.alturaPct)}%` }}
                  className={`w-full max-w-[28px] rounded-t-md transition-all ${
                    item.valor > 0
                      ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 group-hover:from-amber-500 group-hover:to-amber-400 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                      : 'bg-slate-800/60'
                  }`}
                />
                <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                  {item.horaFormatada}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="lg:col-span-4 bg-[#0a1022]/90 backdrop-blur-md p-5 rounded-2xl border border-cyan-500/20 shadow-[0_0_20px_rgba(0,240,255,0.06)] space-y-4">
          <div>
            <h3 className="font-brand font-bold text-white text-sm neon-text-amber">
              Formas de Pagamento
            </h3>
            <p className="text-xs text-slate-400 font-mono">Divisão de faturamento por método</p>
          </div>

          <div className="space-y-3 pt-1">
            {[
              {
                id: 'PIX',
                label: 'PIX Instantâneo',
                val: metricas.vendasPorForma.PIX,
                color: 'bg-emerald-400 shadow-[0_0_8px_rgba(0,255,136,0.4)]',
              },
              {
                id: 'CARTAO_CREDITO',
                label: 'Cartão de Crédito',
                val: metricas.vendasPorForma.CARTAO_CREDITO,
                color: 'bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.4)]',
              },
              {
                id: 'CARTAO_DEBITO',
                label: 'Cartão de Débito',
                val: metricas.vendasPorForma.CARTAO_DEBITO,
                color: 'bg-indigo-400',
              },
              {
                id: 'DINHEIRO',
                label: 'Dinheiro em Espécie',
                val: metricas.vendasPorForma.DINHEIRO,
                color: 'bg-amber-400 shadow-[0_0_8px_rgba(255,184,0,0.4)]',
              },
            ].map((pag) => {
              const pct =
                metricas.faturamento > 0 ? (pag.val / metricas.faturamento) * 100 : 0;
              return (
                <div key={pag.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{pag.label}</span>
                    <span className="font-mono font-bold text-white tabular-nums">
                      R$ {pag.val.toFixed(2).replace('.', ',')}{' '}
                      <span className="text-slate-500 text-[10px]">({pct.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div style={{ width: `${pct}%` }} className={`h-full ${pag.color}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 1: RELATÓRIO POR CATEGORIAS ESPECÍFICAS */}
      <div className="bg-[#0a1022]/90 backdrop-blur-md rounded-2xl border border-cyan-500/20 shadow-[0_0_20px_rgba(0,240,255,0.06)] overflow-hidden">
        <div className="p-5 border-b border-cyan-500/20 flex items-center justify-between">
          <div>
            <h2 className="font-brand font-bold text-base text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span className="neon-text-amber">Desempenho por Categorias Específicas</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Análise comparativa de vendas, custos de insumos e contribuição no faturamento
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 rounded">
            {relatorioCategorias.length} categorias ativas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#070c18] border-b border-cyan-500/20 text-[11px] font-bold uppercase tracking-wider text-cyan-300 font-mono">
              <tr>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-3 text-right">Qtd Vendida</th>
                <th className="py-3 px-3 text-right">Faturamento</th>
                <th className="py-3 px-3 text-right">Custo Insumos</th>
                <th className="py-3 px-3 text-right">Lucro Bruto</th>
                <th className="py-3 px-3 text-right">Margem %</th>
                <th className="py-3 px-4">Participação na Receita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {relatorioCategorias.map((cat) => {
                const partPct =
                  metricas.faturamento > 0 ? (cat.faturamento / metricas.faturamento) * 100 : 0;
                const margemPct =
                  cat.faturamento > 0 ? (cat.lucro / cat.faturamento) * 100 : 0;

                return (
                  <tr key={cat.categoria} className="hover:bg-cyan-500/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white text-sm block">
                        {cat.categoria}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-white tabular-nums">
                      {cat.unidades} un.
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold neon-text-amber tabular-nums">
                      R$ {cat.faturamento.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-400 tabular-nums">
                      R$ {cat.custoInsumos.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold neon-text-lime tabular-nums">
                      R$ {cat.lucro.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-400 tabular-nums">
                      {margemPct.toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div style={{ width: `${partPct}%` }} className="h-full bg-gradient-to-r from-cyan-400 to-amber-400" />
                        </div>
                        <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                          {partPct.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: RELATÓRIO DETALHADO POR PRODUTOS (RANKING E ENGENHARIA DE CARDÁPIO) */}
      <div className="bg-[#0a1022]/90 backdrop-blur-md rounded-2xl border border-cyan-500/20 shadow-[0_0_20px_rgba(0,240,255,0.06)] overflow-hidden">
        <div className="p-5 border-b border-cyan-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="font-brand font-bold text-base text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="neon-text-cyan">Relatório Detalhado por Produtos &bull; Ranking de Desempenho</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Engenharia de cardápio com giro de estoque, lucro individual e margem por item
            </p>
          </div>

          {/* Filter & Sort Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-mono">Categoria:</span>
              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="text-xs bg-[#060b17] border border-cyan-500/30 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 font-mono font-semibold cursor-pointer"
              >
                <option value="TODAS">Todas Categorias</option>
                <option value="Pizzas">Pizzas</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Sobremesas">Sobremesas</option>
                <option value="Combos Kids">Combos Kids</option>
                <option value="Lanches">Lanches</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-mono">Ordenar por:</span>
              <select
                value={ordenacaoProduto}
                onChange={(e) =>
                  setOrdenacaoProduto(e.target.value as 'qtd' | 'faturamento' | 'lucro')
                }
                className="text-xs bg-[#060b17] border border-cyan-500/30 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 font-mono font-semibold cursor-pointer"
              >
                <option value="qtd">Mais Vendidos (Qtd)</option>
                <option value="faturamento">Maior Faturamento (R$)</option>
                <option value="lucro">Maior Lucro Bruto (R$)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#070c18] border-b border-cyan-500/20 text-[11px] font-bold uppercase tracking-wider text-cyan-300 font-mono">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Produto</th>
                <th className="py-3 px-3">Categoria</th>
                <th className="py-3 px-3 text-right">Preço Venda</th>
                <th className="py-3 px-3 text-right">Qtd Vendida</th>
                <th className="py-3 px-3 text-right">Faturamento</th>
                <th className="py-3 px-3 text-right">Custo Insumos</th>
                <th className="py-3 px-3 text-right">Lucro Bruto</th>
                <th className="py-3 px-4 text-right">Margem %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {relatorioProdutos.map((prod, index) => {
                return (
                  <tr key={prod.id} className="hover:bg-cyan-500/5 transition-colors">
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block w-6 h-6 rounded-full font-mono font-bold text-xs flex items-center justify-center ${
                          index === 0
                            ? 'bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(255,184,0,0.5)] font-black'
                            : index === 1
                            ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(0,240,255,0.4)] font-black'
                            : index === 2
                            ? 'bg-amber-300/80 text-slate-950 font-bold'
                            : 'text-slate-500 bg-slate-900 border border-slate-800'
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        {prod.imagemUrl && (
                          <img
                            src={prod.imagemUrl}
                            alt={prod.nome}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-lg object-cover border border-cyan-500/30 shrink-0"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{prod.nome}</span>
                            {index === 0 && (
                              <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-500/40 font-mono font-bold px-1.5 py-0.5 rounded shadow-[0_0_6px_rgba(255,184,0,0.3)]">
                                Top 1
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-medium text-[11px] font-mono">
                        {prod.categoria}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-300 tabular-nums">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="neon-text-amber font-bold">R$ {prod.precoVenda.toFixed(2).replace('.', ',')}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const pOriginal = produtos.find((p) => p.id === prod.id);
                            if (pOriginal) setProdutoEditandoPreco(pOriginal);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/15 border border-transparent hover:border-amber-500/30 transition-colors cursor-pointer"
                          title="Alterar preço deste produto ou combo"
                        >
                          <Tag className="w-3.5 h-3.5 text-amber-400" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-white tabular-nums">
                      {prod.unidades} un.
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold neon-text-cyan tabular-nums">
                      R$ {prod.faturamento.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-400 tabular-nums">
                      R$ {prod.custoTotal.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold neon-text-lime tabular-nums">
                      R$ {prod.lucroTotal.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums">
                      {prod.margemPct.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Alterar Preço */}
      {produtoEditandoPreco && (
        <ModalEditarPreco
          produto={produtoEditandoPreco}
          onClose={() => setProdutoEditandoPreco(null)}
        />
      )}
    </div>
  );
};
