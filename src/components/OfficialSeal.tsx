import { ShieldCheck } from 'lucide-react';

// Emblema de acreditación: sello de doble aro con dentado fino, plano, en
// dorado tinta (sin gradientes ni relieve — sistema «Verde Táctico»).
//
// El dentado se calcula de forma determinista (mismas coordenadas en el
// pre-render SSG y en la hidratación), así que no provoca desajustes.
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
      className={`relative inline-flex h-16 w-16 items-center justify-center text-fasor-gold ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 64 64"
        className="absolute inset-0 h-full w-full"
        fill="none"
        stroke="currentColor"
      >
        {/* Doble aro */}
        <circle cx="32" cy="32" r="31" strokeWidth="1" />
        <circle cx="32" cy="32" r="24" strokeWidth="1" className="opacity-60" />
        {/* Dentado fino del borde (estilo sello notarial) */}
        <g strokeWidth="1" strokeLinecap="round" className="opacity-50">
          {TICKS.map((t, i) => (
            <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
          ))}
        </g>
      </svg>
      <ShieldCheck className="relative h-6 w-6" strokeWidth={1.5} />
    </span>
  );
}
