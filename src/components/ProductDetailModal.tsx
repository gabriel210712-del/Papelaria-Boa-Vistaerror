import React from 'react';
import { 
  X, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  Info, 
  Layers, 
  Heart, 
  MessageSquareShare, 
  Plus, 
  Package, 
  AlertCircle,
  Truck,
  Store
} from 'lucide-react';
import { Product } from '../types';
import { isProductNew, getProductFullImageUrl } from '../utils/productUtils';
import { buildWhatsAppUrl, openWhatsAppSafely } from '../utils/whatsapp';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  if (!isOpen || !product) return null;

  const handleWhatsAppInquiry = () => {
    const imageUrl = getProductFullImageUrl(product);
    const photoLine = imageUrl ? `\n📸 *Foto do item:* ${imageUrl}` : '';
    const text = `Olá, Papelaria Boa Vista! Gostaria de pedir ou saber mais sobre o item *${product.name}* (R$ ${product.price.toFixed(2).replace('.', ',')}) que vi no catálogo online.${photoLine}`;
    const whatsappUrl = buildWhatsAppUrl(text);
    openWhatsAppSafely(whatsappUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF7F2] border border-[#E8E3DC] rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E3DC] bg-white flex items-center justify-between sticky top-0 z-10 rounded-t-3xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFF5EB] text-[#DF8035] border border-[#F5D8BF]">
              {product.tag}
            </span>
            {isProductNew(product) && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#DF8035] text-white shadow-xs">
                ✨ Novidade (4 semanas)
              </span>
            )}
            {product.badge && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#241E19] text-white">
                {product.badge}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#E8E3DC] flex items-center justify-center text-[#6E645D] hover:text-[#241E19] transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-sm text-[#241E19]">
          {/* Main Visual & Key Summary */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-5 bg-white p-3 rounded-2xl border border-[#E8E3DC] shadow-xs">
              <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 relative group">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-300"
                />
              </div>
              {/* Brand authentication badge - only for Rebecca Bonbon products */}
              {product.name.toLowerCase().includes('rebecca bonbon') || product.tag?.toLowerCase().includes('rebecca bonbon') ? (
                <div className="mt-3 text-center">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-block">
                    ✓ Produto Original Rebecca Bonbon
                  </span>
                </div>
              ) : (
                <div className="mt-3 text-center">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-block">
                    ✓ Produto 100% Original e Lacrado
                  </span>
                </div>
              )}
            </div>

            <div className="md:col-span-7 space-y-4">
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#241E19] leading-snug">
                {product.name}
              </h2>

              <div className="flex items-baseline gap-3">
                <span className="font-serif font-extrabold text-3xl text-[#DF8035]">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
              </div>

              {/* Delivery / Pickup badges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-[#E8E3DC] flex items-center gap-2">
                  <Store className="w-4 h-4 text-[#DF8035] shrink-0" />
                  <div>
                    <span className="font-bold block text-[11px]">Retirada na Loja</span>
                    <span className="text-[10px] text-[#6E645D]">Bairro Boa Vista - Uberaba</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#E8E3DC] flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#DF8035] shrink-0" />
                  <div>
                    <span className="font-bold block text-[11px]">Entrega Rápida</span>
                    <span className="text-[10px] text-[#6E645D]">Mín. R$ 50 · Uberaba-MG</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => {
                    onAddToCart(product);
                    onClose();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#DF8035] hover:bg-[#c96f26] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar ao Carrinho</span>
                </button>

                <button
                  onClick={handleWhatsAppInquiry}
                  className="py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <MessageSquareShare className="w-4 h-4" />
                  <span>Tirar Dúvidas</span>
                </button>
              </div>
            </div>
          </div>

          {/* Full Description */}
          {product.details?.fullDescription && (
            <div className="bg-white p-5 rounded-2xl border border-[#E8E3DC] space-y-2">
              <h3 className="font-serif font-bold text-base text-[#241E19] flex items-center gap-2">
                <Info className="w-4 h-4 text-[#DF8035]" />
                Descrição Completa
              </h3>
              <div className="text-xs leading-relaxed text-[#6E645D] whitespace-pre-line space-y-2">
                {product.details.fullDescription}
              </div>
            </div>
          )}

          {/* Diferenciais */}
          {product.details?.differentiators && product.details.differentiators.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-[#E8E3DC] space-y-3">
              <h3 className="font-serif font-bold text-base text-[#241E19] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#DF8035]" />
                Diferenciais do Produto
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {product.details.differentiators.map((diff, index) => (
                  <li key={index} className="flex items-start gap-2 text-[#4A4036]">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{diff}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Especificações Técnicas */}
          {product.details?.technicalSpecs && (
            <div className="bg-white p-5 rounded-2xl border border-[#E8E3DC] space-y-3">
              <h3 className="font-serif font-bold text-base text-[#241E19] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#DF8035]" />
                Especificações Técnicas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(product.details.technicalSpecs)
                  .filter(([label]) => !label.toLowerCase().includes('estoque'))
                  .map(([label, value]) => (
                    <div key={label} className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E3DC] flex justify-between">
                      <span className="font-semibold text-[#6E645D]">{label}:</span>
                      <span className="font-bold text-[#241E19]">{value}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Conteúdo da Embalagem & Cuidados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {product.details?.packageContents && (
              <div className="bg-white p-4 rounded-2xl border border-[#E8E3DC] space-y-2">
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#241E19] flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-[#DF8035]" />
                  Conteúdo da Embalagem
                </h4>
                <ul className="text-xs text-[#6E645D] space-y-1">
                  {product.details.packageContents.map((c, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#DF8035]" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.details?.careInstructions && (
              <div className="bg-white p-4 rounded-2xl border border-[#E8E3DC] space-y-2">
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#241E19] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-[#DF8035]" />
                  Cuidados com o Produto
                </h4>
                <ul className="text-xs text-[#6E645D] space-y-1">
                  {product.details.careInstructions.map((care, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>{care}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="px-6 py-4 bg-white border-t border-[#E8E3DC] flex items-center justify-between rounded-b-3xl">
          <div className="text-xs text-[#8C827A]">
            Papelaria Boa Vista · Av. Elias Cruvinel, 970, Uberaba-MG
          </div>
          <button
            onClick={() => {
              onAddToCart(product);
              onClose();
            }}
            className="py-2.5 px-5 rounded-xl bg-[#DF8035] hover:bg-[#c96f26] text-white font-bold text-xs shadow-xs"
          >
            Adicionar por R$ {product.price.toFixed(2).replace('.', ',')}
          </button>
        </div>
      </div>
    </div>
  );
};
