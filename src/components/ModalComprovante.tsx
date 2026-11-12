import React, { useState, useEffect } from 'react';
import { Pedido } from '../types';
import { useApp } from '../context/AppContext';
import { Printer, CheckCircle2, X, Copy, Check, Download, ChefHat, Sparkles } from 'lucide-react';

interface ModalComprovanteProps {
  pedido: Pedido | null;
  onClose: () => void;
  autoPrint?: boolean;
}

export const ModalComprovante: React.FC<ModalComprovanteProps> = ({
  pedido,
  onClose,
  autoPrint = false,
}) => {
  const { configuracaoPix } = useApp();
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    document.body.classList.add('thermal-print-active');
    return () => {
      document.body.classList.remove('thermal-print-active');
    };
  }, []);

  useEffect(() => {
    if (autoPrint && pedido) {
      const timer = setTimeout(() => {
        window.print();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [autoPrint, pedido]);

  if (!pedido) return null;

  const pagamento = pedido.pagamentos[0];
  const dataFormatada = new Date(pedido.dataHora).toLocaleDateString('pt-BR');
  const horaFormatada = new Date(pedido.dataHora).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  // Generate plain-text thermal ESC/POS formatted receipt for copy/download
  const gerarTextoTermico = () => {
    const separador = '------------------------------------------';
    const duplo = '==========================================';

    let txt = `${duplo}\n`;
    txt += `          CANTINHO DO MINI CHEFE          \n`;
    txt += `      Pequeno chefe e grandes sabores     \n`;
    txt += `         Fast Food & Lanches Kids         \n`;
    txt += `${duplo}\n`;
    txt += `PEDIDO: ${pedido.numeroPedido}\n`;
    txt += `DATA: ${dataFormatada} ${horaFormatada}\n`;
    txt += `CLIENTE: ${pedido.clienteNome.toUpperCase()}\n`;
    txt += `TIPO: ${pedido.tipoAtendimento}\n`;
    txt += `STATUS: EM PREPARO NA COZINHA\n`;
    txt += `${separador}\n`;
    txt += `QTD  ITEM                         VALOR   \n`;
    txt += `${separador}\n`;

    pedido.itens.forEach((it) => {
      const qtdStr = `${it.quantidade}x`.padEnd(5, ' ');
      const valStr = `R$ ${it.subtotal.toFixed(2).replace('.', ',')}`.padStart(10, ' ');
      const nomeCortado = it.nomeProduto.substring(0, 27).padEnd(27, ' ');
      txt += `${qtdStr}${nomeCortado}${valStr}\n`;
      if (it.observacao) {
        txt += `     * OBS: ${it.observacao}\n`;
      }
    });

    txt += `${separador}\n`;
    txt += `SUBTOTAL:                 R$ ${pedido.valorTotal.toFixed(2).replace('.', ',')}\n`;
    txt += `TOTAL A PAGAR:            R$ ${pedido.valorTotal.toFixed(2).replace('.', ',')}\n`;
    if (pagamento) {
      txt += `FORMA DE PGTO:            ${pagamento.forma.replace('_', ' ')}\n`;
      if (pagamento.forma === 'PIX' && configuracaoPix?.chave) {
        txt += `CHAVE PIX:                ${configuracaoPix.chave}\n`;
        txt += `BENEFICIÁRIO:             ${configuracaoPix.titular}\n`;
      }
      txt += `VALOR PAGO:               R$ ${pagamento.valorPago.toFixed(2).replace('.', ',')}\n`;
      if (pagamento.valorTroco && pagamento.valorTroco > 0) {
        txt += `TROCO:                    R$ ${pagamento.valorTroco.toFixed(2).replace('.', ',')}\n`;
      }
    }
    txt += `${duplo}\n`;
    txt += `    OBRIGADO PELA PREFERÊNCIA, AMIGUINHO! \n`;
    txt += `      Acompanhe sua senha no painel!      \n`;
    txt += `${duplo}\n`;
    return txt;
  };

  const handleCopiarTexto = () => {
    const txt = gerarTextoTermico();
    navigator.clipboard.writeText(txt).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  const handleDownloadTxt = () => {
    const txt = gerarTextoTermico();
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprovante_${pedido.numeroPedido.replace('#', '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0a1022] rounded-3xl shadow-[0_0_40px_rgba(0,240,255,0.2)] max-w-lg w-full overflow-hidden border border-cyan-500/40 animate-in fade-in zoom-in-95 duration-150">
        {/* Success header */}
        <div className="bg-[#060b17] px-6 py-4 text-white flex items-center justify-between border-b border-cyan-500/20 no-print">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-[0_0_12px_rgba(255,184,0,0.5)]">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-brand font-bold text-base text-white flex items-center gap-2">
                <span className="neon-text-amber">Pedido Concluído!</span>
                <span className="text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-mono font-bold px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(0,255,136,0.25)]">
                  Pronto p/ Impressão
                </span>
              </h3>
              <p className="text-xs text-cyan-300/80 font-mono">
                Resumo formatado para impressora térmica (58mm / 80mm)
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

        {/* Printable Thermal Receipt Container */}
        <div className="p-6 bg-[#060b18] max-h-[65vh] overflow-y-auto flex justify-center border-b border-slate-800/80">
          <div
            id="comprovante-thermal-root"
            className="bg-white border border-slate-300 p-5 rounded-xl shadow-xs font-mono text-xs text-slate-800 w-full max-w-[340px] space-y-3"
          >
            {/* Thermal Brand Header */}
            <div className="text-center border-b border-dashed border-slate-400 pb-3 space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-slate-900 font-brand font-black text-lg uppercase tracking-wide">
                <span>Cantinho do Mini Chefe</span>
              </div>
              <p className="text-[10px] text-slate-600 font-sans uppercase tracking-wider font-semibold">
                Pequeno chefe e grandes sabores
              </p>
              <p className="text-[10px] text-slate-500">Fast Food &bull; Atendimento Rápido</p>

              {/* Password callout */}
              <div className="mt-2 pt-2 border-t border-dotted border-slate-300">
                <span className="text-[10px] uppercase text-slate-500 font-bold block">
                  SENHA DE RETIRADA
                </span>
                <div className="text-2xl font-black text-slate-900 font-brand tracking-widest">
                  {pedido.numeroPedido}
                </div>
              </div>
            </div>

            {/* Metadata Info */}
            <div className="text-[11px] border-b border-dashed border-slate-400 pb-2 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Data/Hora:</span>
                <span className="font-bold">
                  {dataFormatada} {horaFormatada}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cliente:</span>
                <span className="font-bold truncate max-w-[180px]">{pedido.clienteNome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Modalidade:</span>
                <span className="font-bold uppercase">{pedido.tipoAtendimento}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fila da Cozinha:</span>
                <span className="font-bold text-amber-700">EM PREPARO</span>
              </div>
            </div>

            {/* Itemized List */}
            <div className="space-y-1.5 border-b border-dashed border-slate-400 pb-3">
              <div className="flex justify-between font-bold text-[10px] uppercase text-slate-500 border-b border-slate-200 pb-1">
                <span>Qtd &bull; Item</span>
                <span>Subtotal</span>
              </div>
              {pedido.itens.map((it) => (
                <div key={it.id} className="space-y-0.5 text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">
                      {it.quantidade}x {it.nomeProduto}
                    </span>
                    <span className="tabular-nums font-bold text-slate-900 shrink-0">
                      R$ {it.subtotal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  {it.observacao && (
                    <div className="text-[10px] text-amber-800 italic pl-3 font-medium">
                      &bull; Obs: {it.observacao}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals & Payments */}
            <div className="space-y-1 text-xs border-b border-dashed border-slate-400 pb-2">
              <div className="flex justify-between text-base font-black text-slate-900 pt-1">
                <span>TOTAL:</span>
                <span className="tabular-nums">
                  R$ {pedido.valorTotal.toFixed(2).replace('.', ',')}
                </span>
              </div>

              {pagamento && (
                <div className="space-y-0.5 pt-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Forma: {pagamento.forma.replace('_', ' ')}</span>
                    <span className="tabular-nums font-semibold">
                      R$ {pagamento.valorPago.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  {pagamento.forma === 'PIX' && configuracaoPix?.chave && (
                    <div className="text-[10px] text-emerald-800 font-mono bg-emerald-50 p-1 rounded border border-emerald-200">
                      Chave PIX: {configuracaoPix.chave} ({configuracaoPix.titular})
                    </div>
                  )}
                </div>
              )}

              {pagamento && pagamento.valorTroco !== undefined && pagamento.valorTroco > 0 && (
                <div className="flex justify-between text-xs font-bold text-emerald-800">
                  <span>TROCO:</span>
                  <span className="tabular-nums">
                    R$ {pagamento.valorTroco.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              )}
            </div>

            {/* Simulated Barcode / QR Section */}
            <div className="text-center pt-2 space-y-1">
              <div className="h-8 bg-slate-900 rounded mx-auto flex items-center justify-center text-[9px] text-amber-200 font-mono tracking-widest px-2">
                |||| | ||||| || |||||| |||| | ||||| |||||
              </div>
              <p className="text-[9px] text-slate-400 font-mono">AUT: {pedido.id}-{Date.now().toString().slice(-6)}</p>
            </div>

            {/* Receipt Footer */}
            <div className="text-center text-[10px] text-slate-500 pt-1 border-t border-dotted border-slate-300">
              <p className="font-semibold text-slate-700">Agradecemos a sua visita!</p>
              <p className="text-[9px] text-slate-400">Cantinho do Mini Chefe Fast Food</p>
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="bg-[#060b17] px-6 py-4 border-t border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopiarTexto}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0a1022] hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              title="Copiar texto bruto para impressoras seriais/bluetooth"
            >
              {copiado ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-cyan-400" />
                  <span>Copiar Texto</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadTxt}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0a1022] hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              title="Baixar arquivo TXT de impressão"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Baixar .TXT</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>Imprimir Pedido</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_15px_rgba(255,184,0,0.3)] transition-all cursor-pointer"
            >
              Novo Pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
