import React from 'react';

// Distintivos de rango en formato «Estandarte»: banderín vertical con punta
// inferior, relleno superficie y trazo dorado de 1.6px (esquinas vivas, sin
// radios). Dentro, en columna vertical centrada: estrellas rellenas para el
// mando (rangos 1-3) y galones ^ para la tropa (rangos 4-5).
// El dorado es tinta: sin sombras, sin brillos, sin degradados.

// Nombres de rango por divisa (doctrina del escalafón), para el aria-label
const RANGO_ESTRELLAS: Record<number, string> = {
  3: 'Distintivo de Comandante: tres estrellas',
  2: 'Distintivo de Capitán de Unidad: dos estrellas',
  1: 'Distintivo de Teniente de Cuadrilla: una estrella',
};

const RANGO_GALONES: Record<number, string> = {
  2: 'Distintivo de Operador Táctico: dos galones',
  1: 'Distintivo de Cadete en Formación: un galón',
};

// Estrella heráldica de cinco puntas, rellena en dorado
const Star = () => (
  <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="currentColor" aria-hidden="true">
    <path d="M12 1 L14.53 8.52 L22.46 8.6 L16.09 13.33 L18.47 20.9 L12 16.3 L5.53 20.9 L7.91 13.33 L1.54 8.6 L9.47 8.52 Z" />
  </svg>
);

export const RankStars = ({ count }: { count: number }) => (
  <span
    className="flex flex-col items-center gap-0.5 text-fasor-gold"
    role="img"
    aria-label={RANGO_ESTRELLAS[count] ?? `Distintivo de rango: ${count} estrellas`}
  >
    {Array.from({ length: count }, (_, i) => (
      <Star key={i} />
    ))}
  </span>
);

export const RankChevrons = ({ count }: { count: number }) => (
  <span
    className="flex flex-col items-center gap-1 text-fasor-gold"
    role="img"
    aria-label={RANGO_GALONES[count] ?? `Distintivo de rango: ${count} galones`}
  >
    {Array.from({ length: count }, (_, i) => (
      <svg
        key={i}
        viewBox="0 0 24 12"
        className="h-[11px] w-[22px]"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinejoin="miter"
        strokeLinecap="square"
        aria-hidden="true"
      >
        <path d="M3 10 L12 3 L21 10" />
      </svg>
    ))}
  </span>
);

// Banderín contenedor: rectángulo con punta inferior centrada. Altura fija
// para que el listado del escalafón alinee todos los rangos; el espaciado
// interior de las divisas se adapta al número de elementos.
export const RankBadge = ({ children }: { children: React.ReactNode }) => (
  <div className="relative h-[72px] w-10 shrink-0">
    <svg
      viewBox="0 0 40 72"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M1 1 H39 V55 L20 71 L1 55 Z"
        className="fill-fasor-surface stroke-fasor-gold"
        strokeWidth={1.6}
        strokeLinejoin="miter"
      />
    </svg>
    <div className="relative flex h-[55px] w-full items-center justify-center">{children}</div>
  </div>
);
