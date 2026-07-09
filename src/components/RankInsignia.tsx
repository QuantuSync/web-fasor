import React from 'react';

// Distintivos de rango en formato «Estandarte»: banderín vertical con punta
// inferior, relleno superficie y trazo dorado de 1.6px (esquinas vivas, sin
// radios). Los tres rangos de mando (1-3) llevan una barra de mando horizontal
// en la parte baja del banderín y, sobre ella, sus estrellas: la de ocho
// puntas del Comandante o las de cinco puntas de Capitán y Teniente. La tropa
// (rangos 4-5) lleva galones ^ en columna. El dorado es tinta: sin sombras,
// sin brillos, sin degradados.

// Nombres de rango por divisa (doctrina del escalafón), para el aria-label
const RANGO_ESTRELLAS: Record<number, string> = {
  2: 'Distintivo de Capitán de Unidad: dos estrellas sobre barra de mando',
  1: 'Distintivo de Teniente de Cuadrilla: una estrella sobre barra de mando',
};

const RANGO_GALONES: Record<number, string> = {
  2: 'Distintivo de Operador Táctico: dos galones',
  1: 'Distintivo de Cadete en Formación: un galón',
};

// Las divisas de mando están aprobadas en un marco de diseño propio (banderín
// de 30 de ancho con el borde recto inferior en y=14, origen en el centro) y
// se llevan al banderín compartido de RankBadge (38 de ancho, borde recto en
// y=55) con una única transformación uniforme anclada a ese borde: misma
// geometría aprobada y mismo encaje de la barra sobre la punta en los tres
// rangos.
const ESCALA = 38 / 30;
const MARCO_MANDO = `translate(20 ${55 - 14 * ESCALA}) scale(${ESCALA})`;

// Barra de mando horizontal, común a los rangos 1-3 (geometría aprobada;
// se dibuja dentro de un grupo con MARCO_MANDO)
const BarraDeMando = () => <rect x="-9" y="9.5" width="18" height="2.6" />;

// Divisa del Comandante (rango 1): estrella de ocho puntas rellena en dorado
// como elemento dominante, sobre la barra de mando (geometría aprobada).
export const RankComandante = () => (
  <span
    className="absolute inset-0 text-fasor-gold"
    role="img"
    aria-label="Distintivo de Comandante: estrella de ocho puntas sobre barra de mando"
  >
    <svg viewBox="0 0 40 55" className="h-full w-full" fill="currentColor" aria-hidden="true">
      <g transform={MARCO_MANDO}>
        <polygon
          transform="translate(0,-7)"
          points="0,-8 1.75,-4.23 5.66,-5.66 4.23,-1.75 8,0 4.23,1.75 5.66,5.66 1.75,4.23 0,8 -1.75,4.23 -5.66,5.66 -4.23,1.75 -8,0 -4.23,-1.75 -5.66,-5.66 -1.75,-4.23"
        />
        <BarraDeMando />
      </g>
    </svg>
  </span>
);

// Estrella heráldica de cinco puntas (trazado original, en su marco de 24×24)
const ESTRELLA_CINCO =
  'M12 1 L14.53 8.52 L22.46 8.6 L16.09 13.33 L18.47 20.9 L12 16.3 L5.53 20.9 L7.91 13.33 L1.54 8.6 L9.47 8.52 Z';

// Capitán (dos estrellas) y Teniente (una estrella): sus estrellas de cinco
// puntas de siempre (15px, apiladas con hueco de 2px), centradas en el espacio
// que queda sobre la barra de mando para que ningún elemento toque otro.
export const RankStars = ({ count }: { count: number }) => {
  const alto = count * 15 + (count - 1) * 2;
  const inicio = 23.5 - alto / 2;
  return (
    <span
      className="absolute inset-0 text-fasor-gold"
      role="img"
      aria-label={RANGO_ESTRELLAS[count] ?? `Distintivo de rango: ${count} estrellas`}
    >
      <svg viewBox="0 0 40 55" className="h-full w-full" fill="currentColor" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <path
            key={i}
            d={ESTRELLA_CINCO}
            transform={`translate(12.5 ${inicio + i * 17}) scale(${15 / 24})`}
          />
        ))}
        <g transform={MARCO_MANDO}>
          <BarraDeMando />
        </g>
      </svg>
    </span>
  );
};

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
