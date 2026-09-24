import React, { useEffect } from 'react';
import { Printer, ArrowLeft, Download, CheckCircle2, MessageSquareShare, MapPin, Truck, Store, Calendar, User, FileText } from 'lucide-react';
import { OrderPayload } from '../utils/orderEncoder';
import { BoaVistaLogo } from './BoaVistaLogo';
import { buildWhatsAppUrl, openWhatsAppSafely } from '../utils/whatsapp';

interface OrderPrintViewProps {
  order: OrderPayload;
  onBack?: () => void;
  autoPrint?: boolean;
}

export const OrderPrintView: React.FC<OrderPrintViewProps> = ({ order, onBack, autoPrint = false }) => {
  useEffect(() => {
    // If autoPrint parameter is provided, trigger print dialog after initial render
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsAppConfirmation = () => {
    const text = `Olá ${order.customerName}! Recebemos seu pedido *${order.orderId}* na Papelaria Boa Vista e já estamos com a ordem de separação em mãos na bancada! Total: R$ ${order.grandTotal.toFixed(2).replace('.', ',')}. Logo avisaremos quando estiver pronto!`;
    const url = buildWhatsAppUrl(text);
    openWhatsAppSafely(url);
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#241E19] font-sans print:bg-white print:p-0">
      {/* Top Action Header - Hidden when printing */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-[#E8E3DC] px-4 py-3 shadow-xs print:hidden">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onBack ? (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E3DC] text-xs font-semibold text-[#6E645D] hover:text-[#241E19] hover:bg-stone-50 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar ao Catálogo</span>
              </button>
            ) : (
              <a
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E3DC] text-xs font-semibold text-[#6E645D] hover:text-[#241E19] hover:bg-stone-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Ir para a Loja</span>
              </a>
            )}
            <span className="text-xs font-bold text-[#8C827A] hidden sm:inline">|</span>
            <span className="text-xs font-bold text-[#241E19] bg-[#FFF5EB] text-[#DF8035] px-2 py-0.5 rounded-md border border-[#F5D8BF]">
              Ordem de Separação {order.orderId}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSendWhatsAppConfirmation}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-white transition-all shadow-xs cursor-pointer"
              title="Confirmar recebimento com o cliente no WhatsApp"
            >
              <MessageSquareShare className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#241E19] hover:bg-[#DF8035] text-white transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar em PDF</span>
            </button>
          </div>
        </div>

        {/* Browser Print Hint */}
        <div className="max-w-4xl mx-auto mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-[#8C827A]">
          <span>💡 <strong>Dica para PDF:</strong> Ao clicar em imprimir, escolha <em>"Salvar como PDF"</em> no destino da impressora para guardar o arquivo digitalmente.</span>
          <span className="hidden md:inline font-mono">Papelaria Boa Vista • Uberaba-MG</span>
        </div>
      </header>

      {/* Main Printable Document Sheet */}
      <main className="max-w-4xl mx-auto p-4 sm:p-8 print:p-0 print:max-w-none">
        <div className="bg-white rounded-3xl sm:border border-[#E8E3DC] shadow-sm p-6 sm:p-10 print:rounded-none print:border-none print:shadow-none print:p-4">
          
          {/* Document Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b-2 border-[#241E19]">
            <div className="flex-1">
              <BoaVistaLogo size="md" />
              <div className="mt-3 text-xs text-[#6E645D] space-y-0.5">
                <p className="font-semibold text-[#241E19]">Papelaria, Escritório e Brinquedos Boa Vista</p>
                <p>Av. Elias Cruvinel, 970 – Bairro Boa Vista – Uberaba - MG</p>
                <p>WhatsApp / Pedidos: <strong>(34) 98871-0753</strong></p>
              </div>
            </div>

            <div className="sm:text-right shrink-0 bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8E3DC] print:bg-white print:border print:p-2.5">
              <div className="inline-block px-3 py-1 bg-[#241E19] text-white text-xs font-bold uppercase tracking-wider rounded-lg mb-2 print:bg-black">
                ORDEM DE SEPARAÇÃO & PEDIDO
              </div>
              <div className="text-xl font-black font-mono text-[#DF8035] leading-none mb-1">
                {order.orderId}
              </div>
              <div className="text-xs text-[#6E645D] flex sm:justify-end items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#DF8035]" />
                <span>{order.createdAt}</span>
              </div>
              <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5 mt-2 inline-block">
                ● Pronto para Separação
              </div>
            </div>
          </div>

          {/* Customer & Delivery Information Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
            {/* Customer Box */}
            <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#E8E3DC] print:bg-white print:border">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#DF8035] uppercase tracking-wider">
                <User className="w-4 h-4" />
                <span>Dados do Cliente</span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-sm font-bold text-[#241E19]">{order.customerName}</p>
                <p className="text-[#6E645D]">Canal: Pedido via Catálogo Online / WhatsApp</p>
                {order.addressOrNotes && order.deliveryMethod === 'retirada' && (
                  <p className="text-[#6E645D] pt-1">
                    <strong className="text-[#241E19]">Observação:</strong> {order.addressOrNotes}
                  </p>
                )}
              </div>
            </div>

            {/* Delivery/Pickup Box */}
            <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#E8E3DC] print:bg-white print:border">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#DF8035] uppercase tracking-wider">
                {order.deliveryMethod === 'retirada' ? (
                  <Store className="w-4 h-4" />
                ) : (
                  <Truck className="w-4 h-4" />
                )}
                <span>
                  {order.deliveryMethod === 'retirada'
                    ? 'Modalidade: Retirada na Loja'
                    : 'Modalidade: Entrega a Domicílio'}
                </span>
              </div>
              <div className="space-y-1 text-xs text-[#241E19]">
                {order.deliveryMethod === 'retirada' ? (
                  <>
                    <p className="font-semibold text-emerald-800">Retirada no Balcão (Grátis)</p>
                    <p className="text-[#6E645D]">Endereço: Av. Elias Cruvinel, 970 – Bairro Boa Vista</p>
                    <p className="text-[11px] text-[#8C827A]">Separar e aguardar chegada do cliente na loja.</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">
                      Bairro: <span className="text-[#DF8035] font-bold">
                        {order.neighborhoodType === 'boa_vista'
                          ? 'Bairro Boa Vista (Taxa Grátis)'
                          : `${order.customNeighborhood || 'Outro Bairro'} (Taxa R$ 7,00)`}
                      </span>
                    </p>
                    <p className="text-[#241E19] flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#DF8035] shrink-0 mt-0.5" />
                      <span><strong>Endereço:</strong> {order.addressOrNotes || 'A combinar'}</span>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Items Table with Crisp Photos & Quantities */}
          <div className="my-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#241E19] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#DF8035]" />
                <span>Itens a Separar ({order.items.reduce((s, i) => s + i.quantity, 0)} unidades)</span>
              </h2>
              <span className="text-[11px] text-[#8C827A] italic print:hidden">
                Confira o checkbox [ ✓ ] ao retirar o produto da prateleira
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#E8E3DC] print:border">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#E8E3DC] text-[#6E645D] font-bold print:bg-stone-100">
                    <th className="py-2.5 px-3 w-12 text-center">Sep.</th>
                    <th className="py-2.5 px-3 w-20 text-center">Foto</th>
                    <th className="py-2.5 px-4">Descrição do Produto</th>
                    <th className="py-2.5 px-3 w-20 text-center">Qtd.</th>
                    <th className="py-2.5 px-3 w-24 text-right">Unitário</th>
                    <th className="py-2.5 px-4 w-28 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E3DC]">
                  {order.items.map((item, index) => {
                    const lineTotal = item.price * item.quantity;
                    return (
                      <tr key={`${item.id}-${index}`} className="hover:bg-stone-50/50 print:hover:bg-transparent">
                        {/* Checkbox for separation */}
                        <td className="py-3 px-3 text-center align-middle">
                          <div className="w-5 h-5 mx-auto border-2 border-[#241E19] rounded-md flex items-center justify-center print:border-black">
                            <span className="text-[10px] text-transparent select-none">✓</span>
                          </div>
                        </td>

                        {/* Product Photo */}
                        <td className="py-2 px-3 text-center align-middle">
                          <div className="w-16 h-16 rounded-xl bg-white border border-[#E8E3DC] p-1 flex items-center justify-center mx-auto shadow-2xs overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-contain"
                              crossOrigin="anonymous"
                            />
                          </div>
                        </td>

                        {/* Description */}
                        <td className="py-3 px-4 align-middle">
                          {item.tag && (
                            <span className="text-[10px] uppercase font-bold text-[#DF8035] tracking-wider block mb-0.5">
                              {item.tag}
                            </span>
                          )}
                          <p className="font-bold text-[#241E19] text-xs leading-snug">
                            {item.name}
                          </p>
                          <span className="text-[10px] text-[#8C827A] font-mono block mt-0.5">
                            Cód: {item.id}
                          </span>
                        </td>

                        {/* Quantity */}
                        <td className="py-3 px-3 text-center align-middle">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-[#241E19] text-white font-black text-xs print:bg-black">
                            {item.quantity}x
                          </span>
                        </td>

                        {/* Unit Price */}
                        <td className="py-3 px-3 text-right align-middle font-mono text-[#6E645D]">
                          R$ {item.price.toFixed(2).replace('.', ',')}
                        </td>

                        {/* Subtotal */}
                        <td className="py-3 px-4 text-right align-middle font-bold font-mono text-[#241E19]">
                          R$ {lineTotal.toFixed(2).replace('.', ',')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals & Quality Checklist Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 pt-4 border-t border-[#E8E3DC]">
            {/* Operational Quality Checklist for Attendants */}
            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8E3DC] text-xs space-y-2 print:bg-white print:border">
              <h3 className="font-bold text-[#241E19] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Controle de Separação & Qualidade</span>
              </h3>
              <div className="space-y-1.5 text-[#6E645D] pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded-sm border-[#E8E3DC] text-[#DF8035] focus:ring-0" />
                  <span>Itens conferidos quanto a cor, estampa e avarias</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded-sm border-[#E8E3DC] text-[#DF8035] focus:ring-0" />
                  <span>Acessórios inclusos (pompom, cadarços extras se aplicável)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded-sm border-[#E8E3DC] text-[#DF8035] focus:ring-0" />
                  <span>Produtos embalados e etiquetados com nome do cliente</span>
                </label>
              </div>

              <div className="pt-3 border-t border-stone-200 grid grid-cols-2 gap-2 text-[10px] text-[#6E645D]">
                <div>
                  <p>Visto Separação:</p>
                  <div className="border-b border-[#241E19] mt-4 print:border-black" />
                </div>
                <div>
                  <p>Conferido por:</p>
                  <div className="border-b border-[#241E19] mt-4 print:border-black" />
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="flex flex-col justify-end space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#E8E3DC]">
                <span className="text-[#6E645D]">Subtotal dos Produtos:</span>
                <span className="font-semibold text-[#241E19] font-mono">
                  R$ {order.subtotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8E3DC]">
                <span className="text-[#6E645D]">
                  Taxa de Entrega ({order.deliveryMethod === 'retirada' ? 'Retirada na Loja' : order.neighborhoodType === 'boa_vista' ? 'Bairro Boa Vista' : 'Outros Bairros'}):
                </span>
                <span className="font-semibold font-mono text-[#241E19]">
                  {order.deliveryFee === 0 ? (
                    <span className="text-emerald-700 font-bold">Grátis (R$ 0,00)</span>
                  ) : (
                    `R$ ${order.deliveryFee.toFixed(2).replace('.', ',')}`
                  )}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b-2 border-[#241E19] text-base font-bold text-[#241E19]">
                <span>VALOR TOTAL:</span>
                <span className="text-[#DF8035] font-mono text-lg">
                  R$ {order.grandTotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <p className="text-[10px] text-[#8C827A] text-right italic">
                Forma de pagamento: Na entrega ou retirada (PIX, Cartão ou Dinheiro).
              </p>
            </div>
          </div>

          {/* Footer note */}
          <footer className="pt-4 border-t border-[#E8E3DC] text-center text-[11px] text-[#8C827A] space-y-1">
            <p className="font-semibold text-[#241E19]">
              Papelaria Boa Vista — Material bom, pedido em três toques.
            </p>
            <p>
              Av. Elias Cruvinel, 970 – Boa Vista – Uberaba-MG • WhatsApp: (34) 98871-0753
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};
