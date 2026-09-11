import { useCallback, useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { unidades, type UnidadId } from '../../data/unidades';
import { preguntasExamen } from '../../data/examen';
import {
  cargarMiExamen,
  enviarExamen,
  marcarExamenVisto,
  mensajeDeErrorExamen,
  type Examen,
} from '../../lib/enlace-examen';
import { type Perfil } from '../../lib/enlace-types';
import { Columna, Panel, Rotulo, BotonSalir } from './Marco';
import OrdenUnidades from './OrdenUnidades';
import PreguntaExamen from './PreguntaExamen';
import ComunicadoExamen from './ComunicadoExamen';

/*
 * Pantalla completa de un aspirante en /enlace. Sustituye por entero al
 * `Interior` normal: un aspirante está fuera de todo lo operativo, así que no
 * hay rango, ni unidad, ni Buzón, ni Gestión que mostrar, solo su nombre y,
 * según el estado de su proceso, un botón para examinarse, un aviso de que
 * está pendiente de corrección, o el comunicado del resultado.
 *
 * El examen en sí (orden de preferencia y las 50 respuestas) vive solo en el
 * estado de este componente mientras se responde, no se guarda nada en la
 * base de datos hasta pulsar «Enviar examen»; si se recarga la página a
 * medias, se empieza de nuevo.
 */

type Paso = 'orden' | 'preguntas';

export default function PantallaAspirante({ perfil }: { perfil: Perfil }) {
  const [cargando, setCargando] = useState(true);
  const [examen, setExamen] = useState<Examen | null>(null);
  const [error, setError] = useState('');

  const [tomando, setTomando] = useState(false);
  const [paso, setPaso] = useState<Paso>('orden');
  const [orden, setOrden] = useState<UnidadId[]>(unidades.map((u) => u.id));
  const [respuestas, setRespuestas] = useState<Array<number | null>>(
    Array(preguntasExamen.length).fill(null)
  );
  const [enviando, setEnviando] = useState(false);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      setExamen(await cargarMiExamen(perfil.id));
    } catch (e) {
      setError(mensajeDeErrorExamen(e, 'No se ha podido comprobar tu examen.'));
    } finally {
      setCargando(false);
    }
  }, [perfil.id]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const iniciarExamen = () => {
    setError('');
    setOrden(unidades.map((u) => u.id));
    setRespuestas(Array(preguntasExamen.length).fill(null));
    setPaso('orden');
    setTomando(true);
  };

  const handleVisto = async () => {
    if (!examen) return;
    try {
      setExamen(await marcarExamenVisto(examen.id));
    } catch (e) {
      setError(mensajeDeErrorExamen(e, 'No se ha podido actualizar tu examen.'));
    }
  };

  const handleRepetir = async () => {
    if (examen && !examen.visto_por_aspirante_en) {
      await handleVisto();
    }
    iniciarExamen();
  };

  const handleEnviar = async () => {
    if (respuestas.some((r) => r === null)) return;
    setEnviando(true);
    setError('');
    try {
      const nuevo = await enviarExamen({
        aspiranteId: perfil.id,
        ordenPreferencia: orden,
        respuestas: respuestas as number[],
      });
      setExamen(nuevo);
      setTomando(false);
    } catch (e) {
      setError(mensajeDeErrorExamen(e, 'No se ha podido enviar el examen.'));
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <Columna>
        <Panel>
          <Rotulo titulo={perfil.nombre} />
          <p className="mt-6 font-mono text-xs tracking-widest text-fasor-gold" role="status">
            COMPROBANDO TU PROCESO DE INGRESO
          </p>
        </Panel>
      </Columna>
    );
  }

  // ---- Tomando el examen ---------------------------------------------------
  if (tomando) {
    const todasRespondidas = respuestas.every((r) => r !== null);

    return (
      <Columna ancho="max-w-2xl">
        <Panel>
          <Rotulo titulo="Examen de ingreso" />

          {paso === 'orden' && (
            <div className="mt-6">
              <OrdenUnidades orden={orden} onCambiar={setOrden} />
              <button
                type="button"
                className="btn-solido mt-6 w-full sm:w-auto"
                onClick={() => setPaso('preguntas')}
              >
                Continuar a las preguntas
              </button>
            </div>
          )}

          {paso === 'preguntas' && (
            <div className="mt-6 space-y-4">
              <p className="text-sm leading-relaxed text-fasor-sage">
                Responde a las 50 preguntas. Una vez enviado, el examen no se puede modificar.
              </p>
              {preguntasExamen.map((pregunta, indice) => (
                <PreguntaExamen
                  key={pregunta.numero}
                  pregunta={pregunta}
                  respuesta={respuestas[indice]}
                  onResponder={(opcion) =>
                    setRespuestas((previas) => {
                      const nuevas = [...previas];
                      nuevas[indice] = opcion;
                      return nuevas;
                    })
                  }
                  disabled={enviando}
                />
              ))}

              <div aria-live="polite">
                {error && (
                  <p className="flex items-start gap-2 text-sm text-fasor-bone">
                    <ShieldAlert
                      className="mt-0.5 h-4 w-4 shrink-0 text-fasor-gold"
                      aria-hidden="true"
                    />
                    {error}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 border-t border-fasor-line pt-4 sm:flex-row">
                <button
                  type="button"
                  className="btn-solido w-full sm:w-auto"
                  onClick={() => void handleEnviar()}
                  disabled={!todasRespondidas || enviando}
                >
                  {enviando ? 'Enviando' : 'Enviar examen'}
                </button>
                <button
                  type="button"
                  className="btn-contorno w-full sm:w-auto"
                  onClick={() => setPaso('orden')}
                  disabled={enviando}
                >
                  Volver al orden de unidades
                </button>
              </div>
              {!todasRespondidas && (
                <p className="text-xs text-fasor-sage">
                  Te quedan {respuestas.filter((r) => r === null).length} preguntas por responder.
                </p>
              )}
            </div>
          )}
        </Panel>
      </Columna>
    );
  }

  // ---- Estados de reposo, según el último examen ---------------------------
  const examenPendiente = examen?.estado === 'enviado';
  const bannerPendiente = examen?.estado === 'corregido' && !examen.visto_por_aspirante_en;
  const puedeIniciar =
    !examenPendiente &&
    !bannerPendiente &&
    (!examen || examen.resultado_final === 'no_apto_provisional');

  return (
    <Columna>
      <Panel>
        <Rotulo titulo={perfil.nombre} />

        {error && (
          <p className="mt-4 flex items-start gap-2 text-sm text-fasor-bone">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-fasor-gold" aria-hidden="true" />
            {error}
          </p>
        )}

        {examenPendiente && (
          <p className="mt-6 text-sm leading-relaxed text-fasor-sage">
            Tu examen está pendiente de corrección. Te avisaremos aquí en cuanto un mando lo revise.
          </p>
        )}

        {bannerPendiente && examen && (
          <ComunicadoExamen
            examen={examen}
            onVisto={() => void handleVisto()}
            onRepetir={() => void handleRepetir()}
          />
        )}

        {!examenPendiente && !bannerPendiente && (
          <div className="mt-6">
            {puedeIniciar ? (
              <button type="button" className="btn-solido w-full" onClick={iniciarExamen}>
                Realizar examen de ingreso
              </button>
            ) : (
              <p className="text-sm leading-relaxed text-fasor-sage">
                No hay una convocatoria abierta en este momento.
              </p>
            )}
          </div>
        )}

        <BotonSalir />
      </Panel>
    </Columna>
  );
}
