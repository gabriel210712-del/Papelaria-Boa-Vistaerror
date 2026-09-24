import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  Plus, 
  Check, 
  Eye, 
  ShoppingBag,
  Star
} from 'lucide-react';
import { Product } from '../types';
import { isProductNew } from '../utils/productUtils';

interface FeaturedCarouselProps {
  products: Product[];
  onAddToCart: (product: Product, e?: React.MouseEvent) => void;
  onOpenDetail: (product: Product) => void;
  recentlyAddedId: string | null;
}

type TabType = 'todos' | 'novidades' | 'mais-vendidos';

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  products,
  onAddToCart,
  onOpenDetail,
  recentlyAddedId,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('todos');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Best seller IDs / criteria
  const bestSellerIds = useMemo(() => new Set([
    'caixa-10-pct-papel-sulfite-chamex-a4-75g-5000f',
    'caixa-10-pct-papel-sulfite-magnum-a4-75g-5000f',
    'papel-sulfite-chamex-a4-75g-500f',
    'papel-sulfite-magnum-digital-a4-75g-500f',
    'lapis-de-cor-24-cores-faber-castell-ecolapis',
    'lapis-de-cor-12-cores-faber-castell-ecolapis',
    'caneta-bic-cristal-azul-unidade',
    'caderno-enaldinho-80f-jandaia',
    'rebecca-bonbon-sweet-dreams-2026',
    'taba-squishy-paper-manteiga-fidget',
  ]), []);

  // Filter items according to tab
  const featuredList = useMemo(() => {
    if (activeTab === 'novidades') {
      return products.filter((p) => isProductNew(p));
    }
    if (activeTab === 'mais-vendidos') {
      return products.filter((p) => 
        bestSellerIds.has(p.id) || 
        (p.badge && p.badge.toLowerCase().includes('vendido'))
      );
    }
    // 'todos': combine high-priority highlights (new items + bestsellers)
    return products.filter((p) => 
      isProductNew(p) || 
      bestSellerIds.has(p.id) || 
      (p.badge && p.badge.length > 0)
    );
  }, [products, activeTab, bestSellerIds]);

  // Check scroll position to enable/disable arrow buttons
  const updateScrollButtons = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateScrollButtons();
    container.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);

    return () => {
      container.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [featuredList]);

  // Gentle auto-scroll when not hovered
  useEffect(() => {
    if (isHovered || featuredList.length <= 2) return;

    const interval = setInterval(() => {
      if (!scrollContainerRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      
      // If reached the end, smoothly roll back to start
      if (scrollLeft >= scrollWidth - clientWidth - 20) {
        scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Advance by approximately one card width
        scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isHovered, featuredList.length]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 320;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section 
      className="px-4 sm:px-8 pt-2 pb-8 max-w-7xl mx-auto pl-8 sm:pl-16 lg:pl-20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Produtos em Destaque"
    >
      {/* Section Header */}
      <div className="bg-gradient-to-r from-amber-50/80 via-white/90 to-orange-50/60 rounded-3xl p-5 sm:p-7 border border-[#F5D8BF]/70 shadow-xs mb-6 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#DF8035]/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-[#DF8035] bg-[#DF8035]/10 border border-[#DF8035]/25 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#DF8035]" />
              <span>Seleção Especial da Papelaria</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-extrabold text-[#241E19] tracking-tight">
              Produtos em Destaque
            </h2>
            
            <p className="text-xs sm:text-sm text-[#6E645D] mt-1 max-w-xl">
              As novidades que acabaram de chegar na loja e os itens favoritos mais pedidos da nossa bancada.
            </p>
          </div>

          {/* Filter Tabs and Navigation Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Carousel Tabs */}
            <div className="inline-flex p-1 bg-white/90 backdrop-blur-xs rounded-2xl border border-[#E8E3DC] shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('todos');
                  if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'todos'
                    ? 'bg-[#DF8035] text-white shadow-2xs'
                    : 'text-[#6E645D] hover:text-[#241E19] hover:bg-stone-50'
                }`}
              >
                <Star className="w-3 h-3" />
                <span>Todos</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('novidades');
                  if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'novidades'
                    ? 'bg-[#DF8035] text-white shadow-2xs'
                    : 'text-[#6E645D] hover:text-[#241E19] hover:bg-stone-50'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Novidades</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('mais-vendidos');
                  if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'mais-vendidos'
                    ? 'bg-[#DF8035] text-white shadow-2xs'
                    : 'text-[#6E645D] hover:text-[#241E19] hover:bg-stone-50'
                }`}
              >
                <Flame className="w-3 h-3 text-amber-500" />
                <span>Mais Vendidos</span>
              </button>
            </div>

            {/* Left / Right Arrow Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                disabled={!canScrollLeft}
                aria-label="Ver produtos anteriores"
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                  canScrollLeft
                    ? 'bg-white text-[#241E19] border-[#E8E3DC] hover:border-[#DF8035] hover:bg-[#DF8035] hover:text-white shadow-2xs'
                    : 'bg-white/50 text-stone-300 border-stone-200 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleScroll('right')}
                disabled={!canScrollRight}
                aria-label="Ver próximos produtos"
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                  canScrollRight
                    ? 'bg-white text-[#241E19] border-[#E8E3DC] hover:border-[#DF8035] hover:bg-[#DF8035] hover:text-white shadow-2xs'
                    : 'bg-white/50 text-stone-300 border-stone-200 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Track */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {featuredList.map((product) => {
          const isRecentlyAdded = recentlyAddedId === product.id;
          const isNew = isProductNew(product);
          const isBestSeller = bestSellerIds.has(product.id) || (product.badge && product.badge.toLowerCase().includes('vendido'));

          return (
            <div
              key={product.id}
              onClick={() => onOpenDetail(product)}
              className="w-[260px] sm:w-[280px] lg:w-[290px] shrink-0 snap-start bg-white rounded-3xl p-3.5 border border-[#E8E3DC] hover:border-[#DF8035]/60 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group cursor-pointer relative"
            >
              {/* Product Visual Container */}
              <div className="relative aspect-4/3 sm:aspect-square w-full rounded-2xl bg-[#FAF8F5] p-3 flex items-center justify-center overflow-hidden mb-3 border border-stone-100">
                {/* Floating Badges */}
                <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
                  {isNew && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                      <Sparkles className="w-2.5 h-2.5" />
                      Novidade
                    </span>
                  )}
                  {isBestSeller && !isNew && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                      <Flame className="w-2.5 h-2.5" />
                      Mais Vendido
                    </span>
                  )}
                  {product.badge && !isNew && !isBestSeller && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DF8035]/15 text-[#DF8035] border border-[#DF8035]/30">
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Quick View Overlay on hover */}
                <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 backdrop-blur-2xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 text-[#241E19] text-xs font-bold rounded-full shadow-md transform translate-y-1 group-hover:translate-y-0 transition-transform">
                    <Eye className="w-3.5 h-3.5 text-[#DF8035]" />
                    Ver Detalhes
                  </span>
                </div>

                {/* Product Image */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-106 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#8C827A] uppercase tracking-wider mb-1">
                    <span>{product.brand || product.category}</span>
                    <span className="text-[10px] font-normal lowercase bg-stone-100 px-1.5 py-0.2 rounded-md">
                      {product.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#241E19] group-hover:text-[#DF8035] transition-colors line-clamp-2 leading-snug">
                    {product.name}
                  </h3>
                </div>

                {/* Price and Add to Cart Action */}
                <div className="mt-3 pt-2.5 border-t border-[#F0EBE4] flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-[#8C827A] block font-medium leading-none">Preço</span>
                    <span className="text-base sm:text-lg font-extrabold text-[#241E19]">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => onAddToCart(product, e)}
                    aria-label={`Adicionar ${product.name} ao carrinho`}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                      isRecentlyAdded
                        ? 'bg-emerald-600 text-white shadow-emerald-200'
                        : 'bg-[#DF8035] hover:bg-[#c66e28] active:scale-95 text-white'
                    }`}
                  >
                    {isRecentlyAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Adicionado!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Adicionar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
