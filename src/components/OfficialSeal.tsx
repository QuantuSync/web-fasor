// Estampilla registral: sello rectangular de doble filete en dorado tinta con el
// número de inscripción en bone. Geometría aprobada y fija (proporción 120:104);
// los textos internos forman parte del gráfico y no varían con props. Sin sombras
// ni brillos (el dorado del sistema es tinta).
//
// El ancho mínimo de 96px garantiza la legibilidad de los rótulos pequeños.
const MONO = { fontFamily: 'ui-monospace, Consolas, monospace' };

export default function OfficialSeal({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 104"
      role="img"
      aria-label="Inscrita en el Registro de Asociaciones con el número 0006429, sección Primera"
      className={`h-auto w-24 min-w-[96px] md:w-[120px] ${className}`}
    >
      <rect
        x="3"
        y="10"
        width="114"
        height="84"
        fill="none"
        strokeWidth="1.8"
        className="stroke-fasor-gold"
      />
      <rect
        x="9"
        y="16"
        width="102"
        height="72"
        fill="none"
        strokeWidth="0.7"
        className="stroke-fasor-gold"
      />
      <text
        x="60"
        y="34"
        textAnchor="middle"
        style={{ ...MONO, fontSize: '8.5px', letterSpacing: '2.6px' }}
        className="fill-fasor-gold"
      >
        REGISTRO Nº
      </text>
      <text
        x="60"
        y="63"
        textAnchor="middle"
        style={{ ...MONO, fontSize: '21px', letterSpacing: '2px' }}
        className="fill-fasor-bone"
      >
        0006429
      </text>
      <line x1="22" y1="72" x2="98" y2="72" strokeWidth="0.8" className="stroke-fasor-gold" />
      <text
        x="60"
        y="82"
        textAnchor="middle"
        style={{ ...MONO, fontSize: '8px', letterSpacing: '2.4px' }}
        className="fill-fasor-gold"
      >
        SECCIÓN PRIMERA
      </text>
    </svg>
  );
}
