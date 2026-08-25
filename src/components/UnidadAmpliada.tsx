import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import Galon from './Galon';
import { type Unidad } from '../data/unidades';
import { cursosPorUnidad } from '../data/academy';

// Vista ampliada de una unidad, sobre la retícula de /unidades. Diálogo modal
// hecho a mano (sin librerías): foco atrapado mientras está abierto, cierre con
// Escape, con clic fuera y con botón visible, y devolución del foco al elemento
// que lo abrió. Estética del sistema: superficie 1, filete dorado de 1px, radio
// de 4px, sin sombras ni brillos; el emblema conserva su recorte circular.
// Regla SSG respetada: nada toca `document` fuera de useEffect o de handlers.

// Selector de los elementos que pueden recibir foco dentro del panel.
const ENFOCABLES = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

// Bloque de lista del panel: rótulo en etiqueta dorada y entradas con galón,
// sin cajas ni filetes propios (la doctrina de la página).
function Bloque({ titulo, entradas }: { titulo: string; entradas: string[] }) {
  return (
    <section className="mt-8">
      <h3 className="etiqueta mb-4">{titulo}</h3>
      <ul className="m-0 list-none space-y-2.5 p-0">
        {entradas.map((entrada) => (
          <li key={entrada} className="flex items-start gap-3">
            <Galon className="mt-1 h-3 w-2" />
            <span className="text-sm leading-relaxed text-fasor-sage sm:text-base">{entrada}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

interface UnidadAmpliadaProps {
  unidad: Unidad;
  onCerrar: () => void;
}

export default function UnidadAmpliada({ unidad, onCerrar }: UnidadAmpliadaProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const cierreRef = useRef<HTMLButtonElement>(null);
  const tituloId = useId();
  // Los cursos no se escriben aquí: se derivan del catálogo de la Academy.
  const formacion = cursosPorUnidad(unidad.id);

  // Al abrir, el foco va al botón de cierre y el fondo deja de desplazarse.
  // Al cerrar, el foco vuelve al elemento que abrió el diálogo (la tarjeta).
  useEffect(() => {
    const origen = document.activeElement as HTMLElement | null;
    const overflowPrevio = document.body.style.overflow;

    cierreRef.current?.focus();
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = overflowPrevio;
      origen?.focus();
    };
  }, []);

  // Escape cierra; Tab queda atrapado en el panel (en los dos sentidos).
  useEffect(() => {
    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        evento.preventDefault();
        onCerrar();
        return;
      }
      if (evento.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const enfocables = Array.from(panel.querySelectorAll<HTMLElement>(ENFOCABLES));
      if (enfocables.length === 0) return;

      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      const activo = document.activeElement;

      // Si el foco se ha escapado del panel (p. ej. tras pulsar el fondo),
      // el siguiente Tab lo devuelve al primer elemento.
      if (!panel.contains(activo)) {
        evento.preventDefault();
        primero.focus();
      } else if (evento.shiftKey && activo === primero) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && activo === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [onCerrar]);

  return (
    <div
      className="animate-aparecer-fondo fixed inset-0 z-[100000] flex items-center justify-center
                 overflow-y-auto bg-fasor-bg/90 p-4 backdrop-blur-sm sm:p-6"
      onMouseDown={(evento) => {
        // Solo el fondo cierra; una pulsación iniciada dentro del panel, no.
        if (evento.target === evento.currentTarget) onCerrar();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        className="animate-aparecer-panel relative my-auto flex w-full max-w-lg
                   max-h-[calc(100vh_-_2rem)] flex-col border border-fasor-gold/40
                   bg-fasor-surface sm:max-h-[calc(100vh_-_3rem)]"
      >
        {/* Fuera del contenedor con scroll: queda fijo mientras el cuerpo se
            desplaza. Fondo de superficie para que el texto pase por detrás. */}
        <button
          ref={cierreRef}
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar la vista ampliada"
          className="absolute right-3 top-3 z-10 inline-flex items-center justify-center rounded-sm
                     border border-fasor-line bg-fasor-surface p-2 text-fasor-sage
                     transition-colors duration-200 hover:border-fasor-gold hover:text-fasor-gold"
        >
          <X size={18} aria-hidden="true" />
        </button>

        {/* Cuerpo con scroll interno. El atrapado de foco no se ve afectado:
            se calcula sobre el DOM del panel, no sobre lo que está visible. */}
        <div className="overflow-y-auto overscroll-contain p-6 sm:p-8">
          <p className="etiqueta mb-5 pr-12">Unidad especializada</p>

          <img
            src={unidad.logo}
            alt={`Emblema de ${unidad.nombre} de FASOR`}
            width={160}
            height={160}
            className="mb-6 h-32 w-32 rounded-full border border-fasor-gold/40 object-cover sm:h-40 sm:w-40"
          />

          <div className="mb-3 flex items-center gap-3">
            <Galon />
            <h2
              id={tituloId}
              className="m-0 font-display text-2xl font-bold uppercase tracking-tight text-fasor-bone sm:text-3xl"
            >
              {unidad.nombre}
            </h2>
          </div>

          <div className="linea-fade mb-5" aria-hidden="true"></div>

          <p className="m-0 text-base leading-relaxed text-fasor-bone sm:text-lg">
            {unidad.descripcion}
          </p>

          <Bloque titulo="Capacidades" entradas={unidad.capacidades} />
          <Bloque titulo="Cuándo se activa" entradas={unidad.escenarios} />

          {formacion.length > 0 && (
            <section className="mt-8">
              <h3 className="etiqueta mb-4">Formación en la Academy</h3>
              <ul className="m-0 list-none space-y-4 p-0">
                {formacion.map((curso) => (
                  <li key={curso.titulo} className="flex items-start gap-3">
                    <Galon className="mt-1.5 h-3 w-2" />
                    <div>
                      <p className="m-0 font-display text-base font-bold uppercase tracking-tight text-fasor-bone">
                        {curso.titulo}
                      </p>
                      <p className="m-0 mt-1 text-sm leading-relaxed text-fasor-sage">
                        {curso.descripcion}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
