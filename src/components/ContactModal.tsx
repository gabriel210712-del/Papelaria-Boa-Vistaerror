import React from 'react';
import { X, MapPin, Clock, Phone, MessageCircle, CreditCard, ShieldCheck } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[#FAF7F2] border border-[#E8E3DC] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white border border-[#E8E3DC] flex items-center justify-center text-[#6E645D] hover:text-[#241E19] hover:bg-stone-100 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF5EB] border border-[#F5D8BF] flex items-center justify-center text-[#DF8035]">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif text-[#241E19]">
              Contato e Endereço
            </h3>
            <p className="text-xs font-semibold text-[#DF8035] uppercase tracking-wider">
              Papelaria Boa Vista — Uberaba, MG
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          {/* Address */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8E3DC]">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#DF8035] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-[#241E19]">Endereço Físico</h4>
                <p className="text-[#6E645D] text-xs mt-0.5">
                  Avenida Elias Cruvinel, 970 - Bairro Boa Vista, Uberaba-MG
                </p>
                <p className="text-[11px] text-[#8C827A] mt-1">
                  Uberaba - MG · Fácil estacionamento e acesso no bairro.
                </p>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8E3DC]">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#DF8035] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-[#241E19]">Horário de Atendimento</h4>
                <p className="text-[#6E645D] text-xs mt-0.5">
                  Segunda a Sexta: <strong>08h30 às 18h30</strong>
                </p>
                <p className="text-[#6E645D] text-xs">
                  Sábados: <strong>09h00 às 14h00</strong>
                </p>
                <p className="text-[11px] text-[#8C827A] mt-1">
                  Domingos e feriados: Fechado
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp & Phone */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8E3DC]">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#DF8035] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-[#241E19]">WhatsApp</h4>
                <p className="text-[#6E645D] text-xs mt-0.5 font-medium">
                  +55 (34) 8871-0753
                </p>
                <a
                  href="https://wa.me/553488710753?text=Ol%C3%A1%2C%20gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20a%20Papelaria%20Boa%20Vista."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 mt-2 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Abrir conversa no WhatsApp (+55 34 8871-0753)
                </a>
              </div>
            </div>
          </div>

          {/* Payment & Delivery Policy info */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8E3DC] space-y-2 text-xs text-[#6E645D]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#DF8035]" />
                <span>PIX, Cartão de Crédito/Débito e Dinheiro</span>
              </div>
              <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Retirada Segura
              </span>
            </div>
            <div className="pt-2 border-t border-[#F0ECE6] flex items-center justify-between text-[11px]">
              <span className="text-[#8C827A]">Entrega em Uberaba:</span>
              <span className="font-semibold text-[#241E19]">Pedido mínimo de R$ 50,00</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-[#DF8035] hover:bg-[#c96f26] text-white py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm"
        >
          Entendido, fechar
        </button>
      </div>
    </div>
  );
};
