import { ChevronDown, ChevronUp } from 'lucide-react';
import { unidades, type UnidadId } from '../../data/unidades';

/*
 * Orden de preferencia de las seis unidades, antes de las preguntas del
 * examen. Botones subir/bajar en vez de arrastrar y soltar, sin librerías y
 * más accesible: 44px de área táctil y un `aria-live` que anuncia el orden
 * completo cada vez que cambia.
 */

interface Props {
  orden: UnidadId[];
  onCambiar: (nuevoOrden: UnidadId[]) => void;
  disabled?: boolean;
}

export default function OrdenUnidades({ orden, onCambiar, disabled = false }: Props) {
  const mover = (indice: number, direccion: -1 | 1) => {
    const destino = indice + direccion;
    if (destino < 0 || destino >= orden.length) return;
    const nuevo = [...orden];
    [nuevo[indice], nuevo[destino]] = [nuevo[destino], nuevo[indice]];
    onCambiar(nuevo);
  };

  const nombreDe = (id: UnidadId) => unidades.find((u) => u.id === id)?.nombre ?? id;

  return (
    <div>
      <p className="etiqueta mb-3">Orden de preferencia</p>
      <p className="mb-4 text-sm leading-relaxed text-fasor-sage">
        Ordena las seis unidades de FASOR según tu preferencia, la primera es tu favorita. La nota
        del examen marca el techo al que puedes optar; dentro de lo que alcances, se te asignará la
        que hayas puesto más arriba.
      </p>

      <p aria-live="polite" className="sr-only">
        Orden actual, {orden.map((id, i) => `${i + 1}. ${nombreDe(id)}`).join(', ')}.
      </p>

      <ol className="space-y-2">
        {orden.map((id, indice) => (
          <li
            key={id}
            className="flex items-center justify-between gap-3 rounded-sm border border-fasor-gold/25 bg-fasor-surface p-3"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="w-5 shrink-0 text-right font-mono text-xs text-fasor-gold">
                {indice + 1}
              </span>
              <span className="break-words text-sm text-fasor-bone">{nombreDe(id)}</span>
            </span>
            <span className="flex shrink-0 gap-1">
              <button
                type="button"
                aria-label={`Subir ${nombreDe(id)}`}
                onClick={() => mover(indice, -1)}
                disabled={disabled || indice === 0}
                className="flex h-11 w-11 items-center justify-center rounded-sm border border-fasor-gold/40 text-fasor-gold transition-colors duration-200 hover:bg-fasor-surface2 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronUp className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={`Bajar ${nombreDe(id)}`}
                onClick={() => mover(indice, 1)}
                disabled={disabled || indice === orden.length - 1}
                className="flex h-11 w-11 items-center justify-center rounded-sm border border-fasor-gold/40 text-fasor-gold transition-colors duration-200 hover:bg-fasor-surface2 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </button>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
