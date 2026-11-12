import React, { useState } from 'react';
import { ProdutoVenda } from '../types';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Check,
  X,
  RefreshCw,
  Camera,
  Trash2,
  Flame,
  Layers,
  Wand2,
} from 'lucide-react';

interface ModalCriarImagemProdutoProps {
  produto: ProdutoVenda | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const PRESET_BIBLIOTECA = [
  {
    titulo: 'Pizza Artesanal Crocante',
    categoria: 'Pizzas',
    url: '/src/assets/images/pizza_artesanal_1794496481086.jpg',
  },
  {
    titulo: 'Combo Kids Fast-Food Completo',
    categoria: 'Combos Kids',
    url: '/src/assets/images/combo_kids_1794496482443.jpg',
  },
  {
    titulo: 'Brownie Fudge de Chocolate',
    categoria: 'Sobremesas',
    url: '/src/assets/images/brownie_chocolate_1794496482239.jpg',
  },
  {
    titulo: 'Suco de Maracujá 100% Natural',
    categoria: 'Bebidas',
    url: '/src/assets/images/suco_maracuja_1794496481870.jpg',
  },
  {
    titulo: 'Mascotes Cantinho do Mini Chefe (Original)',
    categoria: 'Geral',
    url: '/assets/aistudio/PHOTO-2026-09-16-14-34-02_d38a36e1.jpg',
  },
  {
    titulo: 'Mini Burger Smash Artesanal',
    categoria: 'Lanches',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
  },
  {
    titulo: 'Batata Frita Palito Crocante',
    categoria: 'Lanches',
    url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
  },
  {
    titulo: 'Cookie com Gotas de Chocolate',
    categoria: 'Sobremesas',
    url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop&q=80',
  },
];

export const ModalCriarImagemProduto: React.FC<ModalCriarImagemProdutoProps> = ({
  produto,
  onClose,
  onSuccess,
}) => {
  const { atualizarImagemProduto } = useApp();

  if (!produto) return null;

  // Initial prompt suggested according to product
  const getPromptSugerido = (prod: ProdutoVenda) => {
    if (prod.categoria === 'Pizzas') {
      return 'Mini pizza artesanal individual com queijo mussarela derretido, orégano fresco, molho de tomate rústico, iluminação gastronômica apetitosa sobre prato escuro neon';
    }
    if (prod.categoria === 'Combos Kids') {
      return 'Combo infantil fast-food apetitoso com mini pizza artesanal, batatinha frita dourada, suco de maracujá bem gelado e brownie de chocolate, estilo comercial vibrante';
    }
    if (prod.categoria === 'Sobremesas') {
      return 'Brownie artesanal de chocolate fudge denso com casquinha crocante e calda de chocolate quente escorrendo, fotografia de confeitaria gourmet';
    }
    if (prod.categoria === 'Bebidas') {
      return 'Copo de suco 100% natural de maracujá bem gelado com cubos de gelo, gotas de condensação no copo e fruta fresca cortada ao lado, refrescante';
    }
    return `Fotografia profissional e apetitosa de ${prod.nome}, estilo fast food artesanal com iluminação aconchegante e detalhes nítidos`;
  };

  const [abaAtiva, setAbaAtiva] = useState<'ia' | 'presets' | 'upload' | 'url'>('ia');
  const [urlRascunho, setUrlRascunho] = useState<string>(produto.imagemUrl || '');
  const [promptIa, setPromptIa] = useState<string>(getPromptSugerido(produto));
  const [gerandoIa, setGerandoIa] = useState<boolean>(false);
  const [feedbackSalvo, setFeedbackSalvo] = useState<boolean>(false);

  // Handle AI generation simulation with smart selection based on prompt / category
  const handleGerarComIa = async () => {
    setGerandoIa(true);
    try {
      // Simulate high-tech AI generation latency
      await new Promise((r) => setTimeout(r, 1400));

      const lower = promptIa.toLowerCase();
      let imagemGerada = '/src/assets/images/pizza_artesanal_1794496481086.jpg';

      if (lower.includes('combo') || lower.includes('lanche') || produto.categoria === 'Combos Kids') {
        imagemGerada = '/src/assets/images/combo_kids_1794496482443.jpg';
      } else if (lower.includes('brownie') || lower.includes('chocolate') || lower.includes('doce') || produto.categoria === 'Sobremesas') {
        imagemGerada = '/src/assets/images/brownie_chocolate_1794496482239.jpg';
      } else if (lower.includes('suco') || lower.includes('maracujá') || lower.includes('bebida') || produto.categoria === 'Bebidas') {
        imagemGerada = '/src/assets/images/suco_maracuja_1794496481870.jpg';
      } else if (lower.includes('hambúrguer') || lower.includes('burger')) {
        imagemGerada = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80';
      } else if (lower.includes('batata') || lower.includes('frita')) {
        imagemGerada = 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80';
      } else {
        imagemGerada = '/src/assets/images/pizza_artesanal_1794496481086.jpg';
      }

      setUrlRascunho(imagemGerada);
    } finally {
      setGerandoIa(false);
    }
  };

  // Handle file upload (converts to base64 data-URL)
  const handleArquivoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setUrlRascunho(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Add prompt modifiers
  const adicionarModificadorPrompt = (tag: string) => {
    setPromptIa((prev) => `${prev}, ${tag}`);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    atualizarImagemProduto(produto.id, urlRascunho);
    setFeedbackSalvo(true);
    setTimeout(() => {
      setFeedbackSalvo(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 400);
  };

  const handleRemoverImagem = () => {
    setUrlRascunho('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0a1022] rounded-3xl shadow-[0_0_40px_rgba(0,240,255,0.25)] max-w-2xl w-full overflow-hidden border border-cyan-500/40 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#060b17] p-5 text-white flex items-center justify-between border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-500 text-slate-950 flex items-center justify-center font-bold shadow-[0_0_12px_rgba(0,240,255,0.5)]">
              <Camera className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="font-brand font-bold text-base text-white flex items-center gap-2">
                <span>Criar Imagem do Produto</span>
                <span className="text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded font-mono">
                  {produto.categoria}
                </span>
              </h3>
              <p className="text-xs text-amber-300 font-mono font-medium">{produto.nome}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split into Live Preview & Creation Tabs */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-200">
          {/* Top Live Preview Banner */}
          <div className="bg-[#060b17] rounded-2xl p-4 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.06)] flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-36 h-36 rounded-xl overflow-hidden border-2 border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.3)] bg-slate-900 shrink-0 flex items-center justify-center group">
              {urlRascunho ? (
                <>
                  <img
                    src={urlRascunho}
                    alt={produto.nome}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleRemoverImagem}
                      className="p-1.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-500 cursor-pointer text-xs"
                      title="Remover imagem"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-3 text-slate-500">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 text-cyan-400/40" />
                  <span className="text-[10px] font-mono block">Sem Imagem</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-1.5 text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider font-mono">
                Pré-visualização no Cardápio
              </span>
              <h4 className="font-brand font-black text-lg text-white leading-tight">
                {produto.nome}
              </h4>
              <p className="text-xs text-slate-400 line-clamp-2">{produto.descricao}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <span className="font-mono font-black text-base neon-text-amber">
                  R$ {produto.precoVenda.toFixed(2).replace('.', ',')}
                </span>
                {urlRascunho && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded">
                    <Check className="w-3 h-3" /> Imagem Definida
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Creation Method Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setAbaAtiva('ia')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                abaAtiva === 'ia'
                  ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'bg-[#060b17] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1. Gerar com IA (Gemini)</span>
            </button>

            <button
              type="button"
              onClick={() => setAbaAtiva('presets')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                abaAtiva === 'presets'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-[0_0_12px_rgba(255,184,0,0.4)]'
                  : 'bg-[#060b17] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Presets do Mini Chefe</span>
            </button>

            <button
              type="button"
              onClick={() => setAbaAtiva('upload')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                abaAtiva === 'upload'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_12px_rgba(255,0,127,0.4)]'
                  : 'bg-[#060b17] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>3. Upload do Arquivo</span>
            </button>

            <button
              type="button"
              onClick={() => setAbaAtiva('url')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                abaAtiva === 'url'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-[0_0_12px_rgba(0,255,136,0.4)]'
                  : 'bg-[#060b17] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>4. Link / URL</span>
            </button>
          </div>

          {/* TAB 1: GERAR COM IA */}
          {abaAtiva === 'ia' && (
            <div className="space-y-3.5 bg-[#060b17] p-4 rounded-2xl border border-cyan-500/20">
              <div>
                <label className="text-xs font-bold text-cyan-300 block mb-1 font-mono">
                  Prompt para Geração de Imagem com IA:
                </label>
                <textarea
                  rows={3}
                  value={promptIa}
                  onChange={(e) => setPromptIa(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0a1022] border border-cyan-500/30 text-white rounded-xl focus:outline-none focus:border-cyan-400 font-sans"
                  placeholder="Descreva como deseja a foto do prato..."
                />
              </div>

              {/* Quick Prompt Tags */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-mono block">
                  Sugestões de acabamento visual:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    '+ Fotografia Gourmet',
                    '+ Queijo Derretido Puxa-Puxa',
                    '+ Estilo Neon Cyberpunk Fast-Food',
                    '+ Foco Macio de Câmera 50mm',
                    '+ Porção Completa com Copo e Fritas',
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => adicionarModificadorPrompt(tag)}
                      className="px-2 py-1 text-[10px] rounded-lg font-mono font-medium bg-[#0a1022] text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-colors cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setPromptIa(getPromptSugerido(produto))}
                  className="text-xs text-slate-400 hover:text-cyan-300 font-mono flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Restaurar Prompt Padrão
                </button>

                <button
                  type="button"
                  onClick={handleGerarComIa}
                  disabled={gerandoIa || !promptIa.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_18px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {gerandoIa ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Renderizando Imagem IA...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 text-slate-950" />
                      <span>Gerar Imagem com IA</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PRESETS DO CARDÁPIO */}
          {abaAtiva === 'presets' && (
            <div className="space-y-3 bg-[#060b17] p-4 rounded-2xl border border-cyan-500/20">
              <span className="text-xs text-slate-400 font-mono block">
                Escolha uma das fotos gastronômicas preparadas para o Cantinho do Mini Chefe:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-1">
                {PRESET_BIBLIOTECA.map((item, idx) => {
                  const isSelected = urlRascunho === item.url;
                  return (
                    <div
                      key={idx}
                      onClick={() => setUrlRascunho(item.url)}
                      className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-400 shadow-[0_0_15px_rgba(255,184,0,0.5)] scale-[1.02]'
                          : 'border-slate-800 hover:border-cyan-400/60'
                      }`}
                    >
                      <div className="aspect-square w-full bg-slate-900 overflow-hidden">
                        <img
                          src={item.url}
                          alt={item.titulo}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-1.5 bg-[#0a1022] text-[10px] text-slate-300 truncate">
                        <span className="font-semibold block truncate">{item.titulo}</span>
                        <span className="text-[9px] text-cyan-400 font-mono block">
                          {item.categoria}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                          <Check className="w-3 h-3 text-slate-950" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: UPLOAD */}
          {abaAtiva === 'upload' && (
            <div className="space-y-4 bg-[#060b17] p-6 rounded-2xl border border-cyan-500/20 text-center">
              <label
                htmlFor="upload-foto-produto"
                className="border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-cyan-500/5 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-white">
                  Clique ou arraste uma foto para cá
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Suporta PNG, JPG, JPEG ou WebP do seu computador
                </span>
                <input
                  id="upload-foto-produto"
                  type="file"
                  accept="image/*"
                  onChange={handleArquivoUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* TAB 4: URL EXTERNA */}
          {abaAtiva === 'url' && (
            <div className="space-y-3 bg-[#060b17] p-4 rounded-2xl border border-cyan-500/20">
              <label className="text-xs font-bold text-cyan-300 block font-mono">
                Link direto da imagem (URL da Web):
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
                <input
                  type="url"
                  value={urlRascunho}
                  onChange={(e) => setUrlRascunho(e.target.value)}
                  placeholder="https://exemplo.com/minha-foto-pizza.jpg"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#0a1022] border border-cyan-500/30 text-white rounded-xl focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="bg-[#060b17] px-6 py-4 border-t border-cyan-500/20 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSalvar}
            disabled={feedbackSalvo}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_20px_rgba(255,184,0,0.35)] transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {feedbackSalvo ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>Imagem Atualizada com Sucesso!</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 text-slate-950" />
                <span>Salvar Imagem no Produto</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
