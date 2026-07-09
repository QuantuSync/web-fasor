// Motivo gráfico de FASOR: el galón (chevrón ») de los distintivos de rango,
// como sistema — marcador de sección, separador y bullet. Siempre decorativo
// (aria-hidden); hereda el color vía currentColor (por defecto, dorado).
interface GalonProps {
  /** Número de galones consecutivos */
  count?: number;
  /** Tamaño de cada galón (clases de w/h) */
  className?: string;
  /** Color del trazo (clase de texto); por defecto dorado */
  color?: string;
}

export default function Galon({
  count = 1,
  className = 'h-3.5 w-2.5',
  color = 'text-fasor-gold',
}: GalonProps) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${color}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 8 12"
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="square"
        >
          <path d="M1.5 1 L6.5 6 L1.5 11" />
        </svg>
      ))}
    </span>
  );
}
