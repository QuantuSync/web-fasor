import React from 'react';

// Distintivos de rango en formato «Estandarte»: banderín vertical con punta
// inferior, relleno superficie y trazo dorado de 1.6px (esquinas vivas, sin
// radios). Dentro, en columna vertical centrada: divisa propia para el
// Comandante (estrella de ocho puntas sobre palas cruzadas), estrellas
// rellenas para el resto del mando (rangos 2-3) y galones ^ para la tropa
// (rangos 4-5). El dorado es tinta: sin sombras, sin brillos, sin degradados.

// Nombres de rango por divisa (doctrina del escalafón), para el aria-label
const RANGO_ESTRELLAS: Record<number, string> = {
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

// Pala esquemática (como la del sello): mango recto y hoja apuntada, en
// vertical con la hoja hacia abajo; se coloca girada ±45° para el aspa.
const Pala = () => (
  <g fill="currentColor">
    <rect x="18.9" y="3" width="2.2" height="20" />
    <path d="M15.8 22 H24.2 V27.5 L20 36 L15.8 27.5 Z" />
  </g>
);

// Divisa del Comandante (rango 1): estrella de ocho puntas (dos cuadrados
// superpuestos girados 45°) rellena en dorado como elemento dominante, sobre
// dos palas cruzadas en aspa que asoman por los lados. El contorno de la
// estrella va en color superficie (paintOrder stroke) para separarla de las
// palas: es un corte de tinta, no un brillo.
export const RankComandante = () => (
  <span
    className="flex items-center justify-center text-fasor-gold"
    role="img"
    aria-label="Distintivo de Comandante: estrella de ocho puntas sobre palas cruzadas"
  >
    <svg viewBox="0 0 40 40" className="h-[38px] w-[38px]" aria-hidden="true">
      <g transform="rotate(45 20 20)">
        <Pala />
      </g>
      <g transform="rotate(-45 20 20)">
        <Pala />
      </g>
      <path
        d="M20 7 L23.83 10.76 L29.19 10.81 L29.24 16.17 L33 20 L29.24 23.83 L29.19 29.19 L23.83 29.24 L20 33 L16.17 29.24 L10.81 29.19 L10.76 23.83 L7 20 L10.76 16.17 L10.81 10.81 L16.17 10.76 Z"
        fill="currentColor"
        className="stroke-fasor-surface"
        strokeWidth={1.4}
        strokeLinejoin="miter"
        paintOrder="stroke"
      />
    </svg>
  </span>
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
