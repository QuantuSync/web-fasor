import { type ReactNode } from 'react';
import Galon from './Galon';

// Cabecera de sección del sistema FASOR: numeración técnica en mono + galón +
// titular condensado en mayúsculas + intro opcional en salvia, rematada por la
// línea dorada que se desvanece. La numeración se pasa a mano desde cada página.
interface TituloSeccionProps {
  /** Numeración técnica (p. ej. '01') */
  numero: string;
  titulo: string;
  intro?: string;
  /** Elemento opcional alineado a la derecha del titular (p. ej. emblemas) */
  extra?: ReactNode;
  className?: string;
}

export default function TituloSeccion({
  numero,
  titulo,
  intro,
  extra,
  className = '',
}: TituloSeccionProps) {
  return (
    <div className={`mb-10 md:mb-14 ${className}`}>
      <div className="mb-3 flex items-center gap-3">
        <span className="font-mono text-xs tracking-widest text-fasor-gold">{numero}</span>
        <Galon />
      </div>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <h2 className="m-0 font-display text-3xl font-bold uppercase tracking-tight text-fasor-bone md:text-4xl">
          {titulo}
        </h2>
        {extra}
      </div>
      <div className="linea-fade mt-4" aria-hidden="true"></div>
      {intro && <p className="mt-4 max-w-2xl text-base leading-relaxed text-fasor-sage">{intro}</p>}
    </div>
  );
}
