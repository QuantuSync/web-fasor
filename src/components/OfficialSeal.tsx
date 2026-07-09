// Estampilla registral: sello rectangular de doble filete en dorado tinta con el
// número de inscripción en bone. Geometría aprobada y fija (proporción 120:84);
// los textos internos forman parte del gráfico y no varían con props. Sin sombras
// ni brillos (el dorado del sistema es tinta).
//
// El aria-label conserva «sección Primera» (el dato registral completo sigue
// siendo ese); solo se omite del gráfico visible para aligerarlo.
// El ancho mínimo de 96px garantiza la legibilidad de los rótulos pequeños.
const MONO = { fontFamily: 'ui-monospace, Consolas, monospace' };

export default function OfficialSeal({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 84"
      role="img"
      aria-label="Inscrita en el Registro de Asociaciones con el número 0006429, sección Primera"
      className={`h-auto w-24 min-w-[96px] md:w-[120px] ${className}`}
    >
      <rect
        x="3"
        y="6"
        width="114"
        height="72"
        fill="none"
        strokeWidth="1.8"
        className="stroke-fasor-gold"
      />
      <rect
        x="9"
        y="12"
        width="102"
        height="60"
        fill="none"
        strokeWidth="0.7"
        className="stroke-fasor-gold"
      />
      <text
        x="60"
        y="32"
        textAnchor="middle"
        style={{ ...MONO, fontSize: '8.5px', letterSpacing: '2.6px' }}
        className="fill-fasor-gold"
      >
        REGISTRO Nº
      </text>
      <text
        x="60"
        y="60"
        textAnchor="middle"
        style={{ ...MONO, fontSize: '21px', letterSpacing: '2px' }}
        className="fill-fasor-bone"
      >
        0006429
      </text>
    </svg>
  );
}
