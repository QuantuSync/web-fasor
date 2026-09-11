import { useCallback, useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import Galon from '../Galon';
import { type Perfil } from '../../lib/enlace-types';
import {
  listarExamenesPendientes,
  mensajeDeErrorExamen,
  type ExamenConAspirante,
} from '../../lib/enlace-examen';
import RevisionExamen from './RevisionExamen';

/*
 * Lista de exámenes de ingreso pendientes de revisar. Solo se monta para
 * teniente, capitán y comandante (`puedeRevisarExamenes`); secretario y
 * tesorero no la ven, ellos gestionan las cuentas de aspirante, no sus
 * exámenes.
 *
 * En cuanto uno de los tres corrige un examen, desaparece de la lista de los
 * otros dos. Si dos entran a la vez, el segundo lo intenta igual, y
 * `RevisionExamen` distingue si fue el propio o si ya lo hizo otro mando; en
 * los dos casos se recarga la lista.
 */

export default function ExamenesPendientes({ gestor }: { gestor: Perfil }) {
  const [examenes, setExamenes] = useState<ExamenConAspirante[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [seleccionado, setSeleccionado] = useState<ExamenConAspirante | null>(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      setExamenes(await listarExamenesPendientes());
    } catch (e) {
      setError(mensajeDeErrorExamen(e, 'No se ha podido cargar la lista de exámenes.'));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const handleResuelto = (resultado: 'corregido' | 'ya_corregido') => {
    setSeleccionado(null);
    setAviso(
      resultado === 'corregido'
        ? 'Examen ratificado.'
        : 'Este examen ya lo había corregido otro mando.'
    );
    void recargar();
  };

  if (seleccionado) {
    return (
      <section className="mt-10">
        <RevisionExamen
          examen={seleccionado}
          gestor={gestor}
          onResuelto={handleResuelto}
          onCancelar={() => setSeleccionado(null)}
        />
      </section>
    );
  }

  return (
    <section className="mt-10 rounded-sm border border-fasor-gold/40 bg-fasor-surface p-6 sm:p-8">
      <p className="etiqueta mb-2">Ingreso</p>
      <h2 className="flex items-center gap-3 font-display text-2xl font-bold uppercase tracking-tight text-fasor-bone">
        <Galon count={2} className="h-4 w-3 shrink-0" />
        Exámenes pendientes
      </h2>
      <div className="linea-fade mt-4" aria-hidden="true"></div>

      <div aria-live="polite" className="mt-4 space-y-2">
        {error && (
          <p className="flex items-start gap-2 text-sm text-fasor-bone">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-fasor-gold" aria-hidden="true" />
            {error}
          </p>
        )}
        {aviso && <p className="text-sm text-fasor-sage">{aviso}</p>}
      </div>

      <div className="mt-4 space-y-3">
        {cargando && (
          <p className="font-mono text-xs tracking-widest text-fasor-gold" role="status">
            CARGANDO EXÁMENES
          </p>
        )}

        {!cargando && examenes.length === 0 && !error && (
          <p className="text-sm text-fasor-sage">No hay exámenes pendientes de revisar.</p>
        )}

        {examenes.map((examen) => (
          <article
            key={examen.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-fasor-gold/25 bg-fasor-surface p-4"
          >
            <div>
              <p className="font-display text-base font-bold uppercase tracking-tight text-fasor-bone">
                {examen.aspirante?.nombre ?? 'Aspirante'}
              </p>
              <p className="mt-1 font-mono text-xs text-fasor-sage">
                {examen.puntuacion_automatica ?? '—'} / 50
              </p>
            </div>
            <button
              type="button"
              className="btn-contorno min-h-[44px]"
              onClick={() => setSeleccionado(examen)}
            >
              Revisar
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
