import React from 'react';

// Distintivos de rango (SVG a medida, en oro): estrella heráldica de 5 puntas rectas
// para mando, galón en V plano apilable para tropa.
// Extraídos de la página Fasor.tsx del repo de Casa Alaniz.
const Star = () => (
  <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="currentColor">
    <path d="M12 1 L14.53 8.52 L22.46 8.6 L16.09 13.33 L18.47 20.9 L12 16.3 L5.53 20.9 L7.91 13.33 L1.54 8.6 L9.47 8.52 Z" />
  </svg>
);

export const RankStars = ({ count }: { count: number }) => {
  // 3 estrellas en triángulo invertido: 2 arriba y 1 abajo centrada.
  if (count === 3) {
    return (
      <span
        className="inline-flex flex-col items-center gap-0.5 text-alanizGold-600"
        aria-hidden="true"
      >
        <span className="inline-flex gap-0.5">
          <Star />
          <Star />
        </span>
        <Star />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-0.5 text-alanizGold-600" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <Star key={i} />
      ))}
    </span>
  );
};

export const RankChevrons = ({ count }: { count: number }) => (
  <span
    className="inline-flex flex-col items-center gap-0.5 text-alanizGold-600"
    aria-hidden="true"
  >
    {Array.from({ length: count }, (_, i) => (
      <svg
        key={i}
        viewBox="0 0 36 11"
        className="h-[11px] w-9"
        fill="none"
        stroke="currentColor"
        strokeWidth={3.5}
        strokeLinejoin="miter"
        strokeLinecap="butt"
      >
        <path d="M2 9 L18 2.5 L34 9" />
      </svg>
    ))}
  </span>
);

// Círculo-insignia: encierra las divisas de un rango (estilo badge del sitio).
// Doble filete dorado (un círculo dentro de otro) para realzar la divisa.
export const RankBadge = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-alanizGold-600 bg-transparent">
    <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-alanizGold-600/70">
      {children}
    </div>
  </div>
);
