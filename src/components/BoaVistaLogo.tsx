import React from 'react';

interface BoaVistaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

export const BoaVistaLogo: React.FC<BoaVistaLogoProps> = ({ size = 'md', showBadge = false }) => {
  return (
    <div className="flex items-center gap-3">
      {/* Visual Badge Inspired by the logo in zczxczc.jfif */}
      <div className="bg-[#FFF8F0] border-2 border-[#DF8035] rounded-xl px-2.5 py-1.5 shadow-xs flex flex-col items-center justify-center select-none">
        {/* Top Letters: PAPELARIA (colorful block letters) */}
        <div className="flex items-center font-black tracking-wider text-[11px] leading-tight space-x-0.5">
          <span className="text-[#E02424]">P</span>
          <span className="text-[#0284C7]">A</span>
          <span className="text-[#EAB308]">P</span>
          <span className="text-[#16A34A]">E</span>
          <span className="text-[#0284C7]">L</span>
          <span className="text-[#EA580C]">A</span>
          <span className="text-[#2563EB]">R</span>
          <span className="text-[#DC2626]">I</span>
          <span className="text-[#16A34A]">A</span>
        </div>

        {/* Dividing Subtle Line */}
        <div className="w-full h-px bg-[#DF8035]/40 my-0.5" />

        {/* Bottom Word: BOA VISTA with Pencil I and Ruler */}
        <div className="flex items-center font-black text-[13px] tracking-tight text-[#1C1917] leading-none">
          <span className="mr-1">BOA</span>
          <span>V</span>
          {/* Pencil Icon for the 'I' */}
          <span className="inline-flex items-center justify-center px-0.5">
            <svg className="w-2.5 h-4" viewBox="0 0 10 20" fill="none">
              {/* Eraser */}
              <rect x="2" y="0" width="6" height="3" rx="1" fill="#F472B6" />
              {/* Metal Ring */}
              <rect x="2" y="3" width="6" height="1.5" fill="#9CA3AF" />
              {/* Pencil Body */}
              <rect x="2" y="4.5" width="6" height="10" fill="#FACC15" />
              {/* Wood Tip */}
              <polygon points="2,14.5 8,14.5 5,18.5" fill="#FDE68A" />
              {/* Lead Tip */}
              <polygon points="4,17 6,17 5,18.5" fill="#1E293B" />
            </svg>
          </span>
          <span className="relative">
            STA
            {/* Small ruler above */}
            <span className="absolute -top-1 left-0 right-0 h-1 bg-[#38BDF8] rounded-xs flex items-center justify-around px-0.5">
              <span className="w-px h-0.5 bg-white" />
              <span className="w-px h-0.5 bg-white" />
              <span className="w-px h-0.5 bg-white" />
            </span>
          </span>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5">
          <span className="font-serif font-bold text-xl sm:text-2xl text-[#241E19] tracking-tight block leading-tight">
            Papelaria Boa Vista
          </span>
        </div>
        <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.18em] text-[#DF8035] uppercase block">
          UBERABA-MG PAPELARIA, ESCRITÓRIO & BRINQUEDOS
        </span>
      </div>
    </div>
  );
};
