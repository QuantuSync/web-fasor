import { useEffect, useRef, useState, type ReactNode } from 'react';
import OfficialSeal from './OfficialSeal';

interface AccreditationSealProps {
  /** Antetítulo en versalitas (utilidad eyebrow) */
  eyebrow: string;
  /** Título de la acreditación */
  title: string;
  /** Cuerpo del bloque (uno o varios párrafos) */
  children: ReactNode;
}

// Panel de acreditación oficial: panel oscuro con borde dorado + sello en relieve,
// aura dorada muy sutil y constante, revelado al entrar en viewport (funde y sube) y
// un shimmer dorado que recorre el panel UNA sola vez al aparecer. Sobrio, en gama
// verde/oro. Respeta prefers-reduced-motion: si está activo, aparece sin movimiento.
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
    <div ref={ref} className={`accred-panel card-elegant ${revealed ? 'is-revealed' : ''}`}>
      {/* Barrido de luz (shimmer) que cruza el panel; se recorta en su propio
          contenedor para no obligar al panel a usar overflow:hidden. */}
      <span className="accred-shine-clip" aria-hidden="true">
        <span className="accred-shine" />
      </span>

      <div className="relative">
        <div className="mb-6 flex items-start space-x-6">
          <div className="flex-shrink-0">
            <OfficialSeal />
          </div>
          <div className="flex-1">
            <p className="eyebrow mb-1 text-alanizGold-600/70">{eyebrow}</p>
            <h3 className="font-display text-2xl font-semibold text-alanizGold-600">{title}</h3>
            <div className="rule-gold mt-4" aria-hidden="true"></div>
          </div>
        </div>

        <div className="space-y-4 leading-relaxed text-parchment-200">{children}</div>
      </div>
    </div>
  );
}
