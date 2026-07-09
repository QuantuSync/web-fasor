import { ShieldCheck } from 'lucide-react';

// Emblema de acreditación: sello notarial en oro (doble aro + dentado fino del borde)
// con un escudo verificado al centro. Sobrio —solo la gama verde/oro del sitio, sin
// colores nuevos ni glow estridente— y coherente entre los bloques oficiales.
//
// Relieve: el cuerpo del medallón lleva un gradiente radial (luz desde arriba-izquierda)
// y una sombra estampada, para que parezca un sello lacrado en relieve, no plano.
//
// El dentado se calcula de forma determinista (mismas coordenadas en el pre-render SSG
// y en la hidratación), así que no provoca desajustes de hidratación.
const TICKS = Array.from({ length: 36 }, (_, i) => {
  const angle = (i / 36) * Math.PI * 2;
  const inner = 27;
  const outer = 30;
  return {
    x1: +(32 + inner * Math.cos(angle)).toFixed(2),
    y1: +(32 + inner * Math.sin(angle)).toFixed(2),
    x2: +(32 + outer * Math.cos(angle)).toFixed(2),
    y2: +(32 + outer * Math.sin(angle)).toFixed(2),
  };
});

export default function OfficialSeal({ className = '' }: { className?: string }) {
  return (
    <span
      className={`official-seal relative inline-flex h-16 w-16 items-center justify-center text-alanizGold-600 ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 64 64"
        className="absolute inset-0 h-full w-full"
        fill="none"
        stroke="currentColor"
      >
        <defs>
          <radialGradient id="sealFace" cx="38%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#f8d498" stopOpacity="0.32" />
            <stop offset="55%" stopColor="#d4af37" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0d1e12" stopOpacity="0.22" />
          </radialGradient>
        </defs>
        {/* Cuerpo del medallón: da volumen/relieve al sello */}
        <circle cx="32" cy="32" r="30" fill="url(#sealFace)" stroke="none" />
        {/* Doble aro */}
        <circle cx="32" cy="32" r="31" strokeWidth="1.25" />
        <circle cx="32" cy="32" r="24" strokeWidth="1" className="opacity-70" />
        {/* Dentado fino del borde (estilo sello notarial) */}
        <g strokeWidth="1" strokeLinecap="round" className="opacity-60">
          {TICKS.map((t, i) => (
            <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
          ))}
        </g>
      </svg>
      <ShieldCheck className="official-seal-icon relative h-6 w-6" strokeWidth={1.75} />
    </span>
  );
}
