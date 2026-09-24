import React, { useState, useRef } from 'react';
import { X, Plus, Minus, Trash2, MessageSquareShare, ShoppingBag, Truck, Store, MapPin, AlertCircle, Camera, Copy, Check, Printer, FileText, ArrowRight, Phone } from 'lucide-react';
import { CartItem } from '../types';
import { getProductFullImageUrl } from '../utils/productUtils';
import { buildOrderPayload, getOrderPrintUrl } from '../utils/orderEncoder';
import { buildWhatsAppUrl, buildWaMeUrl, openWhatsAppSafely, STORE_WHATSAPP_FORMATTED } from '../utils/whatsapp';

const MINIMUM_DELIVERY_ORDER = 50.0;

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [deliveryMethod, setDeliveryMethod] = useState<'retirada' | 'entrega'>('retirada');
  const [neighborhoodType, setNeighborhoodType] = useState<'boa_vista' | 'outros'>('boa_vista');
  const [customNeighborhood, setCustomNeighborhood] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [addressOrNotes, setAddressOrNotes] = useState('');
  const [hasCopied, setHasCopied] = useState(false);
  const [whatsAppSent, setWhatsAppSent] = useState(false);
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    customerName?: string;
    customerPhone?: string;
    customNeighborhood?: string;
    address?: string;
    minimumDelivery?: string;
  }>({});

  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const customNeighborhoodInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const scrollableBodyRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const isDeliveryUnderMinimum = deliveryMethod === 'entrega' && total < MINIMUM_DELIVERY_ORDER;
  const deliveryShortfall = Math.max(0, MINIMUM_DELIVERY_ORDER - total);

  // Delivery fee logic:
  // Retirada na loja: R$ 0,00
  // Entrega no Bairro Boa Vista: R$ 0,00 (Grátis)
  // Entrega em Outros Bairros: R$ 7,00
  const deliveryFee =
    deliveryMethod === 'retirada'
      ? 0.0
      : neighborhoodType === 'boa_vista'
      ? 0.0
      : 7.0;

  const grandTotal = total + deliveryFee;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 2 && digits.length <= 6) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length > 6 && digits.length <= 10) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 10) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    } else if (digits.length > 0) {
      formatted = `(${digits}`;
    }
    setCustomerPhone(formatted);
    if (validationErrors.customerPhone) {
      setValidationErrors((prev) => ({ ...prev, customerPhone: undefined }));
    }
  };

  const generateOrderMessage = (nameOverride?: string, methodOverride?: 'retirada' | 'entrega') => {
    const finalName = (nameOverride ?? customerName).trim() || 'Cliente';
    const finalMethod = methodOverride ?? deliveryMethod;
    const finalFee =
      finalMethod === 'retirada'
        ? 0.0
        : neighborhoodType === 'boa_vista'
        ? 0.0
        : 7.0;
    const finalGrandTotal = total + finalFee;

    let message = `🌻 *NOVO PEDIDO - PAPELARIA BOA VISTA* 🌻\n\n`;
    message += `👤 *Cliente:* ${finalName}\n`;
    if (customerPhone.trim()) {
      message += `📱 *Telefone/WhatsApp:* ${customerPhone.trim()}\n`;
    }

    if (finalMethod === 'retirada') {
      message += `📍 *Modalidade:* Retirada na Loja (Av. Elias Cruvinel, 970 - Bairro Boa Vista, Uberaba-MG)\n`;
      if (addressOrNotes.trim()) {
        message += `📝 *Observações:* ${addressOrNotes.trim()}\n`;
      }
    } else {
      const bairroDesc =
        neighborhoodType === 'boa_vista'
          ? 'Bairro Boa Vista (Entrega Grátis)'
          : `${customNeighborhood.trim()} - Taxa: R$ 7,00`;
      message += `🛵 *Modalidade:* Entrega a Domicílio (Uberaba)\n`;
      message += `🏘️ *Bairro:* ${bairroDesc}\n`;
      message += `🏠 *Endereço de Entrega:* ${addressOrNotes.trim()}\n`;
    }

    message += `\n📦 *ITENS DO PEDIDO (COM FOTOS):*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;

    items.forEach((item, index) => {
      const sub = (item.product.price * item.quantity).toFixed(2).replace('.', ',');
      const imageUrl = getProductFullImageUrl(item.product);
      message += `\n${index + 1}️⃣ *${item.quantity}x ${item.product.name}*\n`;
      message += `   • Subtotal: R$ ${sub}\n`;
      if (imageUrl) {
        message += `   • 📸 Imagem do item: ${imageUrl}\n`;
      }
    });

    message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💰 *Subtotal dos Produtos:* R$ ${total.toFixed(2).replace('.', ',')}`;
    if (finalMethod === 'entrega') {
      if (neighborhoodType === 'boa_vista') {
        message += `\n🛵 *Taxa de Entrega (Bairro Boa Vista):* GRÁTIS (R$ 0,00)`;
      } else {
        message += `\n🛵 *Taxa de Entrega (Outros Bairros):* R$ 7,00`;
      }
    }
    message += `\n🏷️ *TOTAL GERAL DO PEDIDO:* R$ ${finalGrandTotal.toFixed(2).replace('.', ',')}\n\n`;

    const orderPayload = buildOrderPayload({
      customerName: finalName,
      customerPhone: customerPhone.trim(),
      deliveryMethod: finalMethod,
      neighborhoodType,
      customNeighborhood,
      addressOrNotes,
      items,
      total,
      deliveryFee: finalFee,
      grandTotal: finalGrandTotal,
    });
    const printPdfUrl = getOrderPrintUrl(orderPayload, true);

    message += `📄 *IMPRIMIR PEDIDO / ORDEM DE SEPARAÇÃO EM PDF (COM FOTOS):*\n`;
    message += `👉 ${printPdfUrl}\n\n`;
    message += `📸 _As imagens dos produtos e a ordem em PDF foram anexadas para impressão e conferência imediata da equipe da loja._\n\n`;
    message += `_Enviado pelo catálogo online da Papelaria Boa Vista._`;

    return message;
  };

  const handleSendWhatsAppOrder = (overrideDeliveryMethod?: 'retirada', fallbackCustomerName?: string) => {
    if (items.length === 0) return;

    const activeMethod = overrideDeliveryMethod || deliveryMethod;
    const errors: {
      customerName?: string;
      customerPhone?: string;
      customNeighborhood?: string;
      address?: string;
      minimumDelivery?: string;
    } = {};

    if (activeMethod === 'entrega' && total < MINIMUM_DELIVERY_ORDER) {
      errors.minimumDelivery = `O pedido mínimo para entrega é de R$ ${MINIMUM_DELIVERY_ORDER.toFixed(2).replace('.', ',')}. Faltam R$ ${deliveryShortfall.toFixed(2).replace('.', ',')} em produtos. Você pode optar por Retirar na Loja sem valor mínimo.`;
    }

    const effectiveCustomerName = (fallbackCustomerName ?? customerName).trim();
    if (!effectiveCustomerName) {
      errors.customerName = 'Por favor, informe o seu nome para o pedido.';
    }

    const phoneDigits = customerPhone.replace(/\D/g, '');
    if (!phoneDigits) {
      errors.customerPhone = 'Por favor, informe o seu número de WhatsApp / telefone (obrigatório).';
    } else if (phoneDigits.length < 10) {
      errors.customerPhone = 'Informe o DDD e o número completo (mínimo 10 dígitos, ex: (34) 99999-9999).';
    }

    if (activeMethod === 'entrega') {
      if (neighborhoodType === 'outros' && !customNeighborhood.trim()) {
        errors.customNeighborhood = 'Por favor, informe o nome do seu bairro.';
      }

      if (!addressOrNotes.trim()) {
        errors.address = 'Por favor, informe seu endereço completo de entrega (rua, número, etc.).';
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      if (errors.customerName && nameInputRef.current) {
        nameInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        nameInputRef.current.focus();
      } else if (errors.customerPhone && phoneInputRef.current) {
        phoneInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        phoneInputRef.current.focus();
      } else if (errors.customNeighborhood && customNeighborhoodInputRef.current) {
        customNeighborhoodInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        customNeighborhoodInputRef.current.focus();
      } else if (errors.address && addressInputRef.current) {
        addressInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        addressInputRef.current.focus();
      }
      return;
    }

    setValidationErrors({});

    const message = generateOrderMessage(effectiveCustomerName, activeMethod);
    const whatsappUrl = buildWhatsAppUrl(message);
    setLastWhatsAppUrl(whatsappUrl);
    setWhatsAppSent(true);

    // Reliably open WhatsApp without popup blocker issues
    openWhatsAppSafely(whatsappUrl);
  };

  const handleQuickSendAsPickup = () => {
    setDeliveryMethod('retirada');
    setValidationErrors((prev) => ({ ...prev, minimumDelivery: undefined }));
    handleSendWhatsAppOrder('retirada');
  };

  const handleQuickSendWithDefaultName = () => {
    const defaultName = 'Cliente do Catálogo Online';
    setCustomerName(defaultName);
    setValidationErrors((prev) => ({ ...prev, customerName: undefined }));
    handleSendWhatsAppOrder(undefined, defaultName);
  };

  const handleCopyOrderText = async () => {
    if (items.length === 0) return;

    const message = generateOrderMessage();
    try {
      await navigator.clipboard.writeText(message);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 3500);
    } catch {
      // Fallback
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 3500);
    }
  };

  const handleOpenPrintPreview = () => {
    if (items.length === 0) return;

    const orderPayload = buildOrderPayload({
      customerName: customerName.trim() || 'Cliente',
      deliveryMethod,
      neighborhoodType,
      customNeighborhood,
      addressOrNotes,
      items,
      total,
      deliveryFee,
      grandTotal,
    });
    const printPdfUrl = getOrderPrintUrl(orderPayload, true);
    openWhatsAppSafely(printPdfUrl);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      {/* Backdrop tap to close */}
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      {/* Drawer panel with h-[100dvh] and full mobile width */}
      <div className="relative w-full sm:max-w-md h-[100dvh] max-h-[100dvh] bg-[#FAF7F2] sm:border-l border-[#E8E3DC] shadow-2xl flex flex-col z-10">
        {/* Header - Fixed & shrink-0 */}
        <div className="p-4 sm:p-6 border-b border-[#E8E3DC] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#241E19] text-white flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-serif text-[#241E19]">
                Seu Carrinho
              </h3>
              <span className="text-xs text-[#8C827A]">
                {items.length === 0
                  ? 'Nenhum item adicionado'
                  : `${items.reduce((c, i) => c + i.quantity, 0)} itens selecionados`}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#E8E3DC] flex items-center justify-center text-[#6E645D] hover:text-[#241E19] active:scale-95 transition-transform"
            aria-label="Fechar carrinho"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body - min-h-0 flex-1 */}
        <div ref={scrollableBodyRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-serif font-bold text-[#241E19] text-lg">
                  Seu carrinho está vazio
                </h4>
                <p className="text-xs text-[#6E645D] mt-1 max-w-xs mx-auto">
                  Explore os cadernos e mochilas no catálogo e adicione os itens desejados.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="bg-white border border-[#E8E3DC] rounded-2xl p-3 flex gap-3 items-center shadow-xs"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-xl object-contain bg-[#FAF7F2] p-1 border border-[#E8E3DC] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#DF8035] block">
                          {item.product.tag}
                        </span>
                        <h5 className="text-xs font-bold text-[#241E19] truncate">
                          {item.product.name}
                        </h5>
                        <div className="text-xs font-bold text-[#DF8035] mt-0.5">
                          R$ {item.product.price.toFixed(2).replace('.', ',')}
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold mt-1">
                          <Camera className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>Foto inclusa no pedido</span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center border border-[#E8E3DC] rounded-lg bg-[#FAF7F2] p-0.5">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center text-xs font-bold text-[#6E645D] hover:text-[#241E19]"
                              aria-label="Diminuir quantidade"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-[#241E19]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center text-xs font-bold text-[#6E645D] hover:text-[#241E19]"
                              aria-label="Aumentar quantidade"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-[#8C827A] hover:text-red-600 transition-colors p-1"
                            title="Remover produto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Photos & PDF notice card */}
                <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-emerald-950">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold block text-emerald-900">Fotos e PDF anexados ao pedido</span>
                    <p className="text-[11px] text-emerald-800 leading-snug mt-0.5">
                      A mensagem do WhatsApp já inclui as fotos dos produtos e o link para <strong>imprimir o pedido em PDF com fotos e quantidades</strong> para separação rápida na bancada.
                    </p>
                  </div>
                </div>

                {/* Delivery Option */}
                <div className="mt-6 pt-4 border-t border-[#E8E3DC] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#241E19] uppercase tracking-wider block">
                      Como deseja receber?
                    </span>
                    <span className="text-[10px] text-[#8C827A] font-semibold bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                      Entrega: Mín. R$ 50,00
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryMethod('entrega');
                        setValidationErrors((prev) => ({ ...prev, minimumDelivery: undefined }));
                      }}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all relative ${
                        deliveryMethod === 'entrega'
                          ? 'border-[#DF8035] bg-[#FFF5EB] text-[#241E19]'
                          : 'border-[#E8E3DC] bg-white text-[#6E645D] hover:bg-stone-50'
                      }`}
                    >
                      <Truck className={`w-4 h-4 mt-0.5 shrink-0 ${deliveryMethod === 'entrega' ? 'text-[#DF8035]' : 'text-stone-400'}`} />
                      <div className="min-w-0">
                        <div className="text-xs font-bold flex items-center gap-1">
                          <span>Entrega</span>
                        </div>
                        <div className="text-[10px] text-[#DF8035] font-bold">Mín. R$ 50,00</div>
                        <div className="text-[9px] text-[#8C827A]">Grátis no Boa Vista</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryMethod('retirada');
                        setValidationErrors((prev) => ({ ...prev, minimumDelivery: undefined }));
                      }}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                        deliveryMethod === 'retirada'
                          ? 'border-[#DF8035] bg-[#FFF5EB] text-[#241E19]'
                          : 'border-[#E8E3DC] bg-white text-[#6E645D] hover:bg-stone-50'
                      }`}
                    >
                      <Store className={`w-4 h-4 mt-0.5 shrink-0 ${deliveryMethod === 'retirada' ? 'text-[#DF8035]' : 'text-stone-400'}`} />
                      <div className="min-w-0">
                        <div className="text-xs font-bold">Retirada</div>
                        <div className="text-[10px] text-emerald-700 font-bold">Sem valor mín.</div>
                        <div className="text-[9px] text-[#8C827A]">Loja física (Grátis)</div>
                      </div>
                    </button>
                  </div>

                  {/* Delivery Minimum Warning / Progress Banner */}
                  {deliveryMethod === 'entrega' && (
                    <div className={`p-3 rounded-2xl border text-xs transition-all ${
                      isDeliveryUnderMinimum
                        ? 'bg-amber-50/90 border-amber-200 text-amber-900'
                        : 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                    }`}>
                      <div className="flex items-start gap-2">
                        <AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${isDeliveryUnderMinimum ? 'text-amber-600' : 'text-emerald-600'}`} />
                        <div className="flex-1 min-w-0">
                          {isDeliveryUnderMinimum ? (
                            <>
                              <div className="font-bold flex items-center justify-between">
                                <span>Pedido mínimo para entrega: R$ 50,00</span>
                                <span className="font-mono text-[11px] text-amber-700 font-bold">
                                  Faltam R$ {deliveryShortfall.toFixed(2).replace('.', ',')}
                                </span>
                              </div>
                              <p className="text-[11px] text-amber-800 mt-0.5">
                                Adicione mais itens ao carrinho ou selecione <strong>Retirada na Loja</strong> (sem valor mínimo).
                              </p>
                              {/* Progress bar */}
                              <div className="w-full bg-amber-200/70 rounded-full h-1.5 mt-2 overflow-hidden">
                                <div
                                  className="bg-[#DF8035] h-full rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, (total / MINIMUM_DELIVERY_ORDER) * 100)}%` }}
                                />
                              </div>
                            </>
                          ) : (
                            <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                              <span>✓ Valor mínimo para entrega atingido (R$ 50,00)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Neighborhood Selection Section for Delivery */}
                  {deliveryMethod === 'entrega' && (
                    <div className="bg-white p-3.5 rounded-2xl border border-[#F5C7A1] shadow-2xs space-y-2.5 mt-2 animate-in fade-in duration-200">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#241E19]">
                        <MapPin className="w-3.5 h-3.5 text-[#DF8035]" />
                        <span>Selecione o Bairro da Entrega (Uberaba-MG):</span>
                      </div>

                      {/* Neighborhood Tabs / Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setNeighborhoodType('boa_vista')}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            neighborhoodType === 'boa_vista'
                              ? 'border-[#DF8035] bg-[#FFF5EB] ring-1 ring-[#DF8035] text-[#241E19]'
                              : 'border-[#E8E3DC] bg-stone-50 text-[#6E645D] hover:bg-white'
                          }`}
                        >
                          <span className="block text-xs font-bold">Bairro Boa Vista</span>
                          <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-extrabold rounded-full">
                            Entrega Grátis
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setNeighborhoodType('outros')}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            neighborhoodType === 'outros'
                              ? 'border-[#DF8035] bg-[#FFF5EB] ring-1 ring-[#DF8035] text-[#241E19]'
                              : 'border-[#E8E3DC] bg-stone-50 text-[#6E645D] hover:bg-white'
                          }`}
                        >
                          <span className="block text-xs font-bold">Outros Bairros</span>
                          <span className="inline-block mt-0.5 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded-full">
                            R$ 7,00
                          </span>
                        </button>
                      </div>

                      {/* If "Outros Bairros" is selected, ask for the neighborhood name (MANDATORY) */}
                      {neighborhoodType === 'outros' && (
                        <div className="pt-1">
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-semibold text-[#6E645D]">
                              Qual é o seu bairro em Uberaba? <span className="text-red-500 font-bold">*</span>
                            </label>
                            <span className="text-[10px] text-red-500 font-medium">Obrigatório</span>
                          </div>
                          <input
                            ref={customNeighborhoodInputRef}
                            type="text"
                            value={customNeighborhood}
                            onChange={(e) => {
                              setCustomNeighborhood(e.target.value);
                              if (validationErrors.customNeighborhood) {
                                setValidationErrors((prev) => ({ ...prev, customNeighborhood: undefined }));
                              }
                            }}
                            placeholder="Ex: Mercês, Estados Unidos, Abadia, Fabrício..."
                            className={`w-full text-xs px-3 py-2 bg-[#FAF7F2] border rounded-xl focus:outline-hidden transition-colors text-[#241E19] ${
                              validationErrors.customNeighborhood
                                ? 'border-red-500 ring-1 ring-red-500 bg-red-50/40'
                                : 'border-[#E8E3DC] focus:border-[#DF8035]'
                            }`}
                          />
                          {validationErrors.customNeighborhood && (
                            <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                              ⚠ {validationErrors.customNeighborhood}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Customer Details Form */}
                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-[#6E645D]">
                        Seu Nome: <span className="text-red-500 font-bold">*</span>
                      </label>
                      <span className="text-[10px] text-red-500 font-medium">Obrigatório</span>
                    </div>
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (validationErrors.customerName) {
                          setValidationErrors((prev) => ({ ...prev, customerName: undefined }));
                        }
                      }}
                      placeholder="Ex: Gabriel Silva"
                      className={`w-full text-xs px-3 py-2 bg-white border rounded-xl focus:outline-hidden transition-colors text-[#241E19] ${
                        validationErrors.customerName
                          ? 'border-red-500 ring-1 ring-red-500 bg-red-50/30'
                          : 'border-[#E8E3DC] focus:border-[#DF8035]'
                      }`}
                    />
                    {validationErrors.customerName && (
                      <div className="mt-1 flex items-center justify-between text-[11px] text-red-600">
                        <span className="font-medium flex items-center gap-1">⚠ {validationErrors.customerName}</span>
                        <button
                          type="button"
                          onClick={handleQuickSendWithDefaultName}
                          className="text-[#DF8035] hover:underline font-bold text-[10px] cursor-pointer"
                        >
                          Usar "Cliente do Catálogo"
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Customer Phone / WhatsApp (MANDATORY) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-[#6E645D] flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#DF8035]" />
                        <span>Seu WhatsApp / Telefone: <span className="text-red-500 font-bold">*</span></span>
                      </label>
                      <span className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                        Obrigatório
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        ref={phoneInputRef}
                        type="tel"
                        inputMode="tel"
                        value={customerPhone}
                        onChange={handlePhoneChange}
                        placeholder="Ex: (34) 99999-9999"
                        className={`w-full text-xs px-3 py-2.5 bg-white border rounded-xl focus:outline-hidden transition-colors text-[#241E19] placeholder:text-[#A89F91] ${
                          validationErrors.customerPhone
                            ? 'border-red-500 ring-1 ring-red-500 bg-red-50/30'
                            : 'border-[#E8E3DC] focus:border-[#DF8035]'
                        }`}
                      />
                    </div>
                    {validationErrors.customerPhone ? (
                      <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                        ⚠ {validationErrors.customerPhone}
                      </p>
                    ) : (
                      <p className="text-[10px] text-[#8C827A] mt-1">
                        Para confirmarmos seu pedido e avisar assim que estiver na bancada.
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-[#6E645D]">
                        {deliveryMethod === 'entrega' ? (
                          <>
                            Endereço Completo (Rua, Número, Referência): <span className="text-red-500 font-bold">*</span>
                          </>
                        ) : (
                          'Observações adicionais (opcional):'
                        )}
                      </label>
                      {deliveryMethod === 'entrega' && (
                        <span className="text-[10px] text-red-500 font-medium">Obrigatório</span>
                      )}
                    </div>
                    <input
                      ref={addressInputRef}
                      type="text"
                      value={addressOrNotes}
                      onChange={(e) => {
                        setAddressOrNotes(e.target.value);
                        if (validationErrors.address) {
                          setValidationErrors((prev) => ({ ...prev, address: undefined }));
                        }
                      }}
                      placeholder={deliveryMethod === 'entrega' ? 'Ex: Rua Major Eustáquio, 120, Apto 302' : 'Ex: embrulhar para presente'}
                      className={`w-full text-xs px-3 py-2 bg-white border rounded-xl focus:outline-hidden transition-colors text-[#241E19] ${
                        validationErrors.address && deliveryMethod === 'entrega'
                          ? 'border-red-500 ring-1 ring-red-500 bg-red-50/30'
                          : 'border-[#E8E3DC] focus:border-[#DF8035]'
                      }`}
                    />
                    {validationErrors.address && deliveryMethod === 'entrega' && (
                      <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                        ⚠ {validationErrors.address}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer & WhatsApp Checkout - shrink-0 to prevent cutoff on mobile */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 bg-white border-t border-[#E8E3DC] space-y-3 shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
              <div className="space-y-1.5 text-xs text-[#6E645D]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-[#241E19]">R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
                {deliveryMethod === 'entrega' && (
                  <div className="flex justify-between items-center">
                    <span>Taxa de Entrega ({neighborhoodType === 'boa_vista' ? 'Bairro Boa Vista' : 'Outros Bairros'}):</span>
                    {deliveryFee === 0 ? (
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Grátis
                      </span>
                    ) : (
                      <span className="font-semibold text-[#241E19]">R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
                    )}
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-[#241E19] pt-2 border-t border-[#F0ECE6]">
                  <span>Total Estimado:</span>
                  <span className="text-[#DF8035]">R$ {grandTotal.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              {/* Minimum delivery error message banner */}
              {validationErrors.minimumDelivery && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-2 animate-in fade-in">
                  <div className="flex items-start gap-1.5 font-bold text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{validationErrors.minimumDelivery}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickSendAsPickup}
                    className="w-full py-2 px-3 rounded-xl bg-[#241E19] hover:bg-[#DF8035] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.99]"
                  >
                    <Store className="w-4 h-4 text-emerald-400" />
                    <span>Mudar para Retirada na Loja (Grátis) e Enviar Agora</span>
                  </button>
                </div>
              )}

              {/* Customer name missing warning banner */}
              {validationErrors.customerName && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2 animate-in fade-in">
                  <span className="font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    Informe seu nome acima para enviar
                  </span>
                  <button
                    type="button"
                    onClick={handleQuickSendWithDefaultName}
                    className="text-[11px] font-bold text-[#DF8035] hover:underline shrink-0 cursor-pointer"
                  >
                    Enviar direto →
                  </button>
                </div>
              )}

              {/* WhatsApp direct opened / fallback card */}
              {whatsAppSent && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Pedido preparado com fotos dos itens!</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Se o WhatsApp não abriu automaticamente no seu navegador:
                  </p>
                  <a
                    href={lastWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <MessageSquareShare className="w-4 h-4" />
                    <span>Abrir Conversa no WhatsApp (Clique Aqui)</span>
                  </a>
                </div>
              )}

              <button
                type="button"
                onClick={() => handleSendWhatsAppOrder()}
                className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer ${
                  isDeliveryUnderMinimum
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-[#25D366] hover:bg-[#20ba59]'
                }`}
              >
                <MessageSquareShare className="w-5 h-5" />
                <span>
                  {isDeliveryUnderMinimum
                    ? `Faltam R$ ${deliveryShortfall.toFixed(2).replace('.', ',')} (ou Retirar na Loja)`
                    : 'Pedir no WhatsApp com Fotos dos Itens'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleOpenPrintPreview}
                className="w-full py-2.5 px-3 rounded-xl border border-[#241E19] bg-white hover:bg-[#FAF7F2] text-[#241E19] text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs hover:border-[#DF8035] active:scale-[0.99] cursor-pointer"
                title="Abre a ordem de separação com fotos de cada produto pronta para impressão ou salvar em PDF"
              >
                <Printer className="w-4 h-4 text-[#DF8035]" />
                <span>Imprimir Pedido com Fotos em PDF</span>
              </button>

              <button
                type="button"
                onClick={handleCopyOrderText}
                className="w-full py-2 px-3 rounded-lg border border-[#E8E3DC] bg-[#FAF7F2] hover:bg-stone-100 text-[#6E645D] hover:text-[#241E19] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {hasCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Mensagem e fotos copiadas para a área de transferência!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar texto do pedido com fotos</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-[11px] text-[#8C827A] pt-0.5">
                <span>WhatsApp: {STORE_WHATSAPP_FORMATTED}</span>
                <button
                  onClick={onClearCart}
                  className="text-red-500 hover:underline cursor-pointer"
                >
                  Limpar carrinho
                </button>
              </div>
            </div>
          )}
        </div>
    </div>
  );
};
