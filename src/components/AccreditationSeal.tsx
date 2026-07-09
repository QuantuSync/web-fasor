import { useEffect, useRef, useState, type ReactNode } from 'react';
import OfficialSeal from './OfficialSeal';

interface AccreditationSealProps {
  /** Antetítulo técnico (estilo .etiqueta) */
  eyebrow: string;
  /** Título de la acreditación */
  title: string;
  /** Cuerpo del bloque (uno o varios párrafos) */
  children: ReactNode;
}

// Panel de acreditación oficial, plano: borde dorado de 1px, radio 4px y
// revelado por fundido al entrar en viewport. Sin shimmer, sin aura, sin
// latidos (el dorado del sistema es tinta). Respeta prefers-reduced-motion.
export default function AccreditationSeal({ eyebrow, title, children }: AccreditationSealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      // Sin movimiento: mostrar de inmediato.
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect(); // una sola vez
          }
        });
      },
      { threshold: 0.25, rootMargin: '0px 0px -10% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`rounded border border-fasor-gold/25 bg-fasor-surface p-6 transition-all duration-700 md:p-10 ${
        revealed ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
    >
      <div className="mb-6 flex items-start gap-6">
        <div className="flex-shrink-0">
          <OfficialSeal />
        </div>
        <div className="flex-1">
          <p className="etiqueta mb-2">{eyebrow}</p>
          {/* h2: cuelga directamente del h1 de la página (jerarquía propia del sitio) */}
          <h2 className="m-0 font-display text-2xl font-bold uppercase tracking-tight text-fasor-bone md:text-3xl">
            {title}
          </h2>
          <div className="linea-fade mt-4" aria-hidden="true"></div>
        </div>
      </div>

      <div className="space-y-4 leading-relaxed text-fasor-sage [&_strong]:text-fasor-bone">
        {children}
      </div>
    </div>
  );
}
