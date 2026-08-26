import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { ETIQUETA_RANGO, emblemaUnidad, etiquetaUnidad } from '../../lib/enlace-types';
import type { MiembroDirectorio } from '../../lib/enlace-types';

/*
 * Buscador de destinatario. Filtra el directorio según se escribe, sin
 * acentos ni mayúsculas de por medio, y enseña rango, unidad y emblema para
 * distinguir a dos miembros de nombre parecido.
 *
 * La lista que recibe ya viene recortada a miembros de alta y sin uno mismo. Si
 * alguien forzara otro destinatario, la base de datos lo rechazaría igual.
 */

const MAXIMO_RESULTADOS = 8;

// Búsqueda sin acentos ni mayúsculas. `NFD` separa la letra de su tilde y la
// expresión se lleva por delante los signos diacríticos que quedan sueltos.
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

interface Props {
  miembros: MiembroDirectorio[];
  seleccionado: MiembroDirectorio | null;
  /** En una respuesta el destinatario no se cambia, es el de la conversación */
  bloqueado?: boolean;
  disabled?: boolean;
  onSeleccionar: (miembro: MiembroDirectorio | null) => void;
}

export default function SelectorDestinatario({
  miembros,
  seleccionado,
  bloqueado = false,
  disabled = false,
  onSeleccionar,
}: Props) {
  const [busqueda, setBusqueda] = useState('');

  if (seleccionado) {
    const emblema = seleccionado.unidad ? emblemaUnidad(seleccionado.unidad) : null;
    const unidad = seleccionado.unidad ? etiquetaUnidad(seleccionado.unidad) : null;

    return (
      <div>
        <p className="mb-2 block font-display text-xs font-semibold uppercase tracking-[0.15em] text-fasor-gold">
          Destinatario
        </p>
        <div className="flex items-start justify-between gap-3 rounded-sm border border-fasor-gold/40 p-4">
          <div className="min-w-0">
            <p className="break-words font-display text-base font-bold uppercase tracking-tight text-fasor-bone">
              {seleccionado.nombre}
            </p>
            <p className="mt-1 flex items-start gap-2 font-mono text-xs uppercase tracking-widest text-fasor-gold">
              <span>{ETIQUETA_RANGO[seleccionado.rango] ?? seleccionado.rango}</span>
              {emblema && (
                <img
                  src={emblema}
                  alt=""
                  aria-hidden="true"
                  title={unidad ?? undefined}
                  width={24}
                  height={24}
                  className="h-6 w-6 shrink-0 rounded-full border border-fasor-gold/40 object-cover"
                />
              )}
            </p>
            {unidad && <p className="mt-1 text-sm text-fasor-sage">{unidad}</p>}
          </div>

          {!bloqueado && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                onSeleccionar(null);
                setBusqueda('');
              }}
              className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-sm border
                         border-fasor-gold/40 px-3 py-2 font-display text-xs font-semibold uppercase
                         tracking-[0.15em] text-fasor-gold transition-colors duration-200
                         hover:bg-fasor-surface2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Cambiar
            </button>
          )}
        </div>
        {bloqueado && (
          <p className="mt-2 text-xs leading-relaxed text-fasor-sage">
            Es una respuesta, así que va a quien mantiene contigo esta conversación.
          </p>
        )}
      </div>
    );
  }

  const filtro = normalizar(busqueda.trim());
  const resultados = filtro
    ? miembros.filter((miembro) => normalizar(miembro.nombre).includes(filtro))
    : miembros;
  const visibles = resultados.slice(0, MAXIMO_RESULTADOS);

  return (
    <div>
      <label htmlFor="buscar-destinatario">Destinatario</label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fasor-gold"
          aria-hidden="true"
        />
        <input
          id="buscar-destinatario"
          type="search"
          autoComplete="off"
          placeholder="Escribe un nombre"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          disabled={disabled}
          className="!pl-10 !text-base"
        />
      </div>

      {miembros.length === 0 ? (
        <p className="mt-3 text-sm text-fasor-sage">
          No hay ningún otro miembro de alta al que escribir.
        </p>
      ) : (
        <>
          <ul className="mt-3 space-y-2">
            {visibles.map((miembro) => {
              const emblema = miembro.unidad ? emblemaUnidad(miembro.unidad) : null;
              const unidad = miembro.unidad ? etiquetaUnidad(miembro.unidad) : null;

              return (
                <li key={miembro.id}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onSeleccionar(miembro)}
                    className="flex w-full min-h-[44px] items-center gap-3 rounded-sm border
                               border-fasor-line px-3 py-2 text-left transition-colors duration-200
                               hover:bg-fasor-surface2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {emblema && (
                      <img
                        src={emblema}
                        alt=""
                        aria-hidden="true"
                        width={24}
                        height={24}
                        className="h-6 w-6 shrink-0 rounded-full border border-fasor-gold/40 object-cover"
                      />
                    )}
                    <span className="min-w-0">
                      <span className="block break-words text-sm text-fasor-bone">
                        {miembro.nombre}
                      </span>
                      <span className="block font-mono text-xs uppercase tracking-widest text-fasor-sage">
                        {ETIQUETA_RANGO[miembro.rango] ?? miembro.rango}
                        {unidad && <span className="ml-2">{unidad}</span>}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="mt-2 text-xs leading-relaxed text-fasor-sage" aria-live="polite">
            {resultados.length === 0
              ? 'Ningún miembro con ese nombre.'
              : resultados.length > visibles.length
                ? `Se muestran ${visibles.length} de ${resultados.length}. Afina el nombre para ver el resto.`
                : `${resultados.length} ${resultados.length === 1 ? 'miembro' : 'miembros'}.`}
          </p>
        </>
      )}
    </div>
  );
}
