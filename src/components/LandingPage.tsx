import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  ShoppingBag, 
  Plus, 
  Check, 
  Play, 
  MessageSquareShare, 
  Compass,
  Eye,
  PackageCheck,
  ChevronRight,
  Sparkles,
  Tag,
  X
} from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { Product, CartItem } from '../types';
import { ContactModal } from './ContactModal';
import { CartDrawer } from './CartDrawer';
import { BoaVistaLogo } from './BoaVistaLogo';
import { ProductDetailModal } from './ProductDetailModal';
import { isProductNew } from '../utils/productUtils';

export const LandingPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedBrand, setSelectedBrand] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  // Rotation of the 3 featured hero cards every 5 seconds (preserving existing model and layout)
  const [heroOffset, setHeroOffset] = useState(0);

  useEffect(() => {
    if (PRODUCTS.length <= 1) return;

    const interval = setInterval(() => {
      setHeroOffset((prev) => (prev + 1) % PRODUCTS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Cards for the hero photo fan matching Capturar.PNG with smooth cyclic rotation
  const heroProducts = useMemo(() => {
    if (PRODUCTS.length === 0) return [];
    return [
      PRODUCTS[heroOffset % PRODUCTS.length],
      PRODUCTS[(heroOffset + 1) % PRODUCTS.length],
      PRODUCTS[(heroOffset + 2) % PRODUCTS.length],
    ];
  }, [heroOffset]);
  // Dynamic category pills exactly as originally configured, including Novidades (4 weeks)
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    let novidadesCount = 0;

    PRODUCTS.forEach((p) => {
      const cat = p.category || 'Geral';
      map.set(cat, (map.get(cat) || 0) + 1);
      if (isProductNew(p)) {
        novidadesCount += 1;
      }
    });

    const list = [{ label: 'Todos', count: PRODUCTS.length }];

    if (novidadesCount > 0) {
      list.push({ label: 'Novidades', count: novidadesCount });
    }

    map.forEach((count, label) => {
      list.push({ label, count });
    });
    return list;
  }, []);

  // Brands list dynamically extracted from products
  const brands = useMemo(() => {
    const map = new Map<string, number>();
    PRODUCTS.forEach((p) => {
      const b = p.brand || (p.name.includes('BIC') ? 'BIC' : p.name.includes('Rebecca') ? 'Rebecca Bonbon' : 'Jandaia');
      map.set(b, (map.get(b) || 0) + 1);
    });

    const list = [{ label: 'Todas as Marcas', value: 'Todas', count: PRODUCTS.length }];
    map.forEach((count, label) => {
      list.push({ label, value: label, count });
    });
    return list;
  }, []);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      // Category filter (previous exact logic)
      const matchesCategory =
        selectedCategory === 'Todos'
          ? true
          : selectedCategory === 'Novidades'
          ? isProductNew(product)
          : product.category === selectedCategory;

      // Brand filter
      let matchesBrand = true;
      if (selectedBrand !== 'Todas') {
        const pBrand = product.brand || (product.name.includes('BIC') ? 'BIC' : product.name.includes('Rebecca') ? 'Rebecca Bonbon' : 'Jandaia');
        matchesBrand = pBrand.toLowerCase() === selectedBrand.toLowerCase();
      }

      // Search query
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesBrand && matchesSearch;
    });
  }, [selectedCategory, selectedBrand, searchQuery]);

  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    setRecentlyAddedId(product.id);
    setTimeout(() => {
      setRecentlyAddedId(null);
    }, 1200);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#241E19] flex flex-col selection:bg-[#F5D8BF] selection:text-[#5C3A14]">
      {/* Top Navbar with Pastel Orange Bar Crossing the Entire Page */}
      <header className="sticky top-0 z-30 bg-[#FFE5CE] border-b border-[#F5C7A1] px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className="group text-left cursor-pointer"
            >
              <BoaVistaLogo />
            </button>

            {/* Mobile cart button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-1.5 bg-[#241E19] text-white px-3.5 py-2 rounded-full text-xs font-semibold shadow-xs hover:bg-[#38312B] transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{totalCartCount}</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="w-full md:max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9A6B48]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar caderno, mochila, squishy, caneta BIC, Rebecca Bonbon..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/95 border border-[#F0B88A] rounded-full text-xs sm:text-sm text-[#241E19] placeholder-[#9A6B48] focus:outline-hidden focus:border-[#DF8035] focus:bg-white shadow-2xs transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-[#9A6B48] hover:text-[#241E19]"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Desktop Right Action Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            <button
              onClick={() => setIsContactOpen(true)}
              className="flex items-center gap-2 bg-white/90 hover:bg-white border border-[#F0B88A] text-[#241E19] px-4 py-2.5 rounded-full text-xs font-semibold transition-colors shadow-2xs"
            >
              <MapPin className="w-3.5 h-3.5 text-[#DF8035]" />
              <span>Uberaba - MG</span>
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2.5 bg-[#241E19] hover:bg-[#38312B] text-white px-5 py-2.5 rounded-full text-xs font-semibold transition-colors shadow-xs group"
            >
              <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Carrinho</span>
              <span className="bg-[#DF8035] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {totalCartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* HERO SECTION MATCHING Capturar.PNG */}
        <section className="px-4 sm:px-8 pt-10 sm:pt-14 pb-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Authentic Brand Headline & Delivery Flow */}
            <div className="lg:col-span-6 space-y-6">
              {/* Badge: NO BAIRRO DESDE 2009 */}
              <div>
                <span className="inline-block px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-[#DF8035] border border-[#F5D8BF] bg-[#FAF7F2] shadow-2xs">
                  NO BAIRRO DESDE 2009
                </span>
              </div>

              {/* Exact Editorial Title: Material bom, pedido em três toques. */}
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-serif font-extrabold text-[#241E19] leading-[1.08] tracking-tight">
                Material bom,<br />
                <span className="text-[#DF8035]">pedido em três</span><br />
                toques.
              </h1>

              {/* Exact Description */}
              <p className="text-[#6E645D] text-base sm:text-lg leading-relaxed max-w-lg font-normal">
                Monte seu carrinho com calma, escolha retirada ou entrega e mande tudo pronto no nosso WhatsApp. A gente separa e avisa quando estiver na bancada.
              </p>

              {/* Address and Hours Pills */}
              <div className="space-y-2.5 pt-1">
                <div>
                  <button
                    onClick={() => setIsContactOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-[#6E645D] bg-white border border-[#E8E3DC] hover:border-[#DF8035] hover:text-[#241E19] transition-all shadow-2xs text-left"
                  >
                    <MapPin className="w-4 h-4 text-[#DF8035] shrink-0" />
                    <span>Avenida Elias Cruvinel, 970 — Bairro Boa Vista, Uberaba/MG</span>
                  </button>
                </div>

                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-[#6E645D] bg-white border border-[#E8E3DC] shadow-2xs">
                    <Clock className="w-4 h-4 text-[#DF8035] shrink-0" />
                    <span>Seg a Sex 8h30–18h30 · Sáb 9h–14h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 3 Polaroid-style Photo Cards Fan (as seen in Capturar.PNG) */}
            <div className="lg:col-span-6 flex items-center justify-center pt-4 lg:pt-0">
              <div className="relative flex items-center justify-center w-full max-w-lg py-6">
                {/* Left Angled Card */}
                {heroProducts[0] && (
                  <div 
                    onClick={() => setSelectedDetailProduct(heroProducts[0])}
                    className="w-36 sm:w-44 lg:w-48 aspect-3/4 bg-white rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 shadow-xl border border-white/80 transform -rotate-8 hover:-rotate-4 hover:scale-105 transition-all duration-300 cursor-pointer z-10 -mr-6 sm:-mr-8 overflow-hidden group"
                  >
                    <div className="w-full h-full rounded-xl sm:rounded-2xl bg-[#F7F4EF] p-2 flex items-center justify-center overflow-hidden relative">
                      <img
                        key={heroProducts[0].id}
                        src={heroProducts[0].image}
                        alt={heroProducts[0].name}
                        className="w-full h-full object-contain filter drop-shadow-sm transition-opacity duration-700 ease-in-out"
                      />
                    </div>
                  </div>
                )}

                {/* Center Raised Card */}
                {heroProducts[1] && (
                  <div 
                    onClick={() => setSelectedDetailProduct(heroProducts[1])}
                    className="w-40 sm:w-48 lg:w-52 aspect-3/4 bg-white rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 shadow-2xl border border-white/90 transform hover:scale-105 transition-all duration-300 cursor-pointer z-20 overflow-hidden group"
                  >
                    <div className="w-full h-full rounded-xl sm:rounded-2xl bg-[#F7F4EF] p-2 flex items-center justify-center overflow-hidden relative">
                      <img
                        key={heroProducts[1].id}
                        src={heroProducts[1].image}
                        alt={heroProducts[1].name}
                        className="w-full h-full object-contain filter drop-shadow-sm transition-opacity duration-700 ease-in-out"
                      />
                    </div>
                  </div>
                )}

                {/* Right Angled Card */}
                {heroProducts[2] && (
                  <div 
                    onClick={() => setSelectedDetailProduct(heroProducts[2])}
                    className="w-36 sm:w-44 lg:w-48 aspect-3/4 bg-white rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 shadow-xl border border-white/80 transform rotate-8 hover:rotate-4 hover:scale-105 transition-all duration-300 cursor-pointer z-10 -ml-6 sm:-ml-8 overflow-hidden group"
                  >
                    <div className="w-full h-full rounded-xl sm:rounded-2xl bg-[#F7F4EF] p-2 flex items-center justify-center overflow-hidden relative">
                      <img
                        key={heroProducts[2].id}
                        src={heroProducts[2].image}
                        alt={heroProducts[2].name}
                        className="w-full h-full object-contain filter drop-shadow-sm transition-opacity duration-700 ease-in-out"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* PILL CATEGORIES (PREVIOUS ORIGINAL DESIGN + MARCAS FILTER) */}
        <section id="catalogo" className="px-4 sm:px-8 pt-4 pb-4 max-w-7xl mx-auto space-y-3">
          {/* Main Category Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.label;
                return (
                  <button
                    key={cat.label}
                    onClick={() => setSelectedCategory(cat.label)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shadow-2xs ${
                      isActive
                        ? 'bg-[#DF8035] text-white shadow-sm'
                        : 'bg-white text-[#6E645D] hover:bg-stone-100 border border-[#E8E3DC]'
                    }`}
                  >
                    {cat.label === 'Novidades' && <Sparkles className="w-3.5 h-3.5 text-amber-200" />}
                    <span>{cat.label}</span>
                    <span className={`text-[11px] ${isActive ? 'text-white/90' : 'text-[#8C827A]'}`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active filters clear badge */}
            {(selectedCategory !== 'Todos' || selectedBrand !== 'Todas' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('Todos');
                  setSelectedBrand('Todas');
                  setSearchQuery('');
                }}
                className="self-start sm:self-auto text-xs text-[#DF8035] hover:text-[#c46922] font-semibold flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-[#DF8035]/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Limpar filtros
              </button>
            )}
          </div>

          {/* Brands Filter Bar */}
          <div className="bg-white/70 backdrop-blur-xs border border-[#E8E3DC] rounded-2xl p-2.5 sm:px-4 flex items-center gap-2 overflow-x-auto scrollbar-none shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#6E645D] whitespace-nowrap pr-2 border-r border-[#E8E3DC] shrink-0">
              <Tag className="w-3.5 h-3.5 text-[#DF8035]" />
              <span>Marcas:</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {brands.map((b) => {
                const isBrandActive = selectedBrand === b.value;
                return (
                  <button
                    key={b.value}
                    onClick={() => setSelectedBrand(b.value)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
                      isBrandActive
                        ? 'bg-[#241E19] text-white shadow-2xs'
                        : 'bg-stone-100 hover:bg-stone-200/80 text-[#6E645D]'
                    }`}
                  >
                    <span>{b.label}</span>
                    {b.value !== 'Todas' && (
                      <span className={`text-[10px] ${isBrandActive ? 'text-stone-300' : 'text-[#8C827A]'}`}>
                        ({b.count})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* CATALOG SECTION HEADER: "Todo o catálogo" as seen in Capturar.PNG */}
        <section className="px-4 sm:px-8 pb-16 max-w-7xl mx-auto">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#241E19]">
              Todo o catálogo
            </h2>
            <span className="text-xs sm:text-sm text-[#8C827A] font-medium">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
            </span>
          </div>

          {/* Clean Rounded Card Grid Matching the Reference */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E3DC] max-w-lg mx-auto shadow-xs">
              <PackageCheck className="w-12 h-12 text-[#DF8035] mx-auto mb-3 opacity-70" />
              <p className="font-serif text-lg text-[#241E19] font-bold">Nenhum produto encontrado</p>
              <p className="text-xs text-[#6E645D] mt-1 mb-4">
                Tente buscar por outro termo ou limpe os filtros.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('Todos');
                  setSelectedBrand('Todas');
                  setSearchQuery('');
                }}
                className="px-5 py-2.5 rounded-full bg-[#DF8035] text-white text-xs font-bold shadow-xs"
              >
                Ver Catálogo Completo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {filteredProducts.map((product, index) => {
                const isJustAdded = recentlyAddedId === product.id;
                return (
                  <div
                    key={product.id}
                    onClick={() => setSelectedDetailProduct(product)}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="animate-card-fade-in bg-white border border-[#E8E3DC] rounded-3xl p-4 flex flex-col justify-between transition-all duration-300 ease-out hover:shadow-2xl hover:shadow-stone-300/50 hover:-translate-y-1.5 hover:border-[#DF8035]/40 group relative cursor-pointer"
                  >
                    <div>
                      {/* Product Image Stage */}
                      <div className="relative aspect-square w-full bg-[#FAF7F2] rounded-2xl overflow-hidden mb-3 border border-[#EBE4DA] flex items-center justify-center p-3 group-hover:bg-[#f6f1e8] transition-colors duration-300">
                        {/* Clean minimal category tag */}
                        <span className="absolute top-2.5 left-2.5 z-10 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-white/95 text-[#DF8035] border border-stone-200 shadow-2xs backdrop-blur-xs">
                          {product.category}
                        </span>

                        {/* Badge area */}
                        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col items-end gap-1">
                          {isProductNew(product) && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase bg-[#DF8035] text-white shadow-xs animate-pulse">
                              ✨ Novidade
                            </span>
                          )}
                          {product.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#241E19] text-white shadow-2xs">
                              {product.badge}
                            </span>
                          )}
                        </div>

                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500 ease-out drop-shadow-sm"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] uppercase font-bold text-[#DF8035] tracking-wider">
                          {product.brand || (product.name.includes('BIC') ? 'BIC' : product.name.includes('Rebecca') ? 'Rebecca Bonbon' : 'Jandaia')}
                        </span>
                        <span className="text-[10px] text-stone-300">•</span>
                        <span className="text-[10px] text-[#8C827A] font-medium">
                          {product.category}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-sm sm:text-base text-[#241E19] leading-snug group-hover:text-[#DF8035] transition-colors duration-200 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-[11px] text-[#6E645D] mt-1.5 leading-relaxed line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    {/* Bottom Action Area */}
                    <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#8C827A] uppercase font-semibold block">Preço</span>
                        <span className="font-serif font-extrabold text-base sm:text-lg text-[#DF8035]">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          title="Adicionar ao carrinho"
                          className={`p-2 rounded-xl text-xs font-bold transition-all duration-200 shadow-2xs hover:scale-105 active:scale-95 flex items-center justify-center ${
                            isJustAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#241E19] hover:bg-[#DF8035] text-white'
                          }`}
                        >
                          {isJustAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>

                        <a
                          href={`https://wa.me/553488710753?text=${encodeURIComponent(`Olá! Gostaria de pedir o item: ${product.name} (R$ ${product.price.toFixed(2).replace('.', ',')}) na Papelaria Boa Vista.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Pedir no WhatsApp"
                          className="p-2 rounded-xl text-xs bg-[#25D366] hover:bg-[#20ba59] text-white shadow-2xs hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
                        >
                          <MessageSquareShare className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E8E3DC] py-12 px-4 sm:px-8 mt-auto text-xs text-[#6E645D]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-center md:text-left">
            <BoaVistaLogo size="sm" />
            <div>
              <p className="text-[11px] text-[#8C827A]">Av. Elias Cruvinel, 970 — Bairro Boa Vista, Uberaba/MG</p>
              <p className="text-[10px] text-[#8C827A]">Seg a Sex 8h30–18h30 · Sáb 9h–14h</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsContactOpen(true)}
              className="hover:text-[#DF8035] transition-colors"
            >
              Contato & Horários
            </button>
            <a
              href="https://wa.me/553488710753"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-600 flex items-center gap-1 transition-colors font-semibold"
            >
              <MessageSquareShare className="w-3.5 h-3.5" />
              <span>WhatsApp (+55 34 8871-0753)</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedDetailProduct}
        isOpen={!!selectedDetailProduct}
        onClose={() => setSelectedDetailProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Contact & Hours Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      {/* Botão Flutuante Fixo de WhatsApp */}
      <a
        href="https://wa.me/553488710753?text=Ol%C3%A1%21%20Gostaria%20de%20tirar%20uma%20d%C3%BAvida%20e%20fazer%20um%20pedido%20na%20Papelaria%20Boa%20Vista."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Fale conosco no WhatsApp"
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#20ba59] text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group hover:scale-105 active:scale-95"
      >
        <MessageSquareShare className="w-6 h-6 animate-pulse" />
        <span className="hidden sm:inline font-bold text-xs tracking-wide">Falar no WhatsApp</span>
      </a>
    </div>
  );
};
