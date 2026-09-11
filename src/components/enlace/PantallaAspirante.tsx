import { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ShieldAlert } from 'lucide-react';
import { unidades, type UnidadId } from '../../data/unidades';
import { preguntasExamen } from '../../data/examen';
import {
  cargarMiExamen,
  cargarMiUltimaAutorizacion,
  enviarExamen,
  marcarAutorizacionVista,
  marcarExamenVisto,
  mensajeDeErrorExamen,
  type AutorizacionExamen,
  type Examen,
} from '../../lib/enlace-examen';
import {
  borrarProgresoExamen,
  cargarProgresoExamen,
  guardarProgresoExamen,
} from '../../lib/enlace-examen-progreso';
import { type Perfil } from '../../lib/enlace-types';
import CambiarContrasena from './CambiarContrasena';
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
 * El examen en sí (orden de preferencia y las 50 respuestas) vive en el
 * estado de este componente mientras se responde, no se guarda nada en la
 * base de datos hasta pulsar «Enviar examen». Ese estado, sin embargo, SÍ
 * tiene una copia de seguridad en `localStorage` (`enlace-examen-progreso.ts`),
 * así que una recarga de página, un cambio de pestaña o una navegación a otra
 * ruta y vuelta no lo pierden; se restaura solo, con un aviso, la primera vez
 * que se comprueba el examen (`recargar`, más abajo). Se borra al enviar el
 * examen y al cerrar sesión, nunca antes.
 */

type Paso = 'orden' | 'preguntas';

export default function PantallaAspirante({ perfil }: { perfil: Perfil }) {
  const [cargando, setCargando] = useState(true);
  const [examen, setExamen] = useState<Examen | null>(null);
  const [autorizacion, setAutorizacion] = useState<AutorizacionExamen | null>(null);
  const [error, setError] = useState('');

  const [tomando, setTomando] = useState(false);
  const [paso, setPaso] = useState<Paso>('orden');
  const [orden, setOrden] = useState<UnidadId[]>(unidades.map((u) => u.id));
  const [respuestas, setRespuestas] = useState<Array<number | null>>(
    Array(preguntasExamen.length).fill(null)
  );
  const [enviando, setEnviando] = useState(false);
  const [confirmandoEnvio, setConfirmandoEnvio] = useState(false);
  // Se ha restaurado un progreso guardado en este navegador. Solo informa,
  // no cambia nada del envío ni de la corrección.
  const [recuperado, setRecuperado] = useState(false);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const actual = await cargarMiExamen(perfil.id);
      setExamen(actual);
      setAutorizacion(await cargarMiUltimaAutorizacion(perfil.id));

      /*
       * Restaura el progreso guardado, pero solo si no hay un examen de
       * verdad con prioridad sobre él, uno ya enviado y pendiente de
       * corrección, o un resultado que todavía no se ha visto. En esos dos
       * casos la pantalla de reposo tiene que mandar, y un progreso viejo
       * (por ejemplo, de un intento anterior que se abandonó sin enviar) se
       * queda donde está, en `localStorage`, hasta que vuelva a tocar, sin
       * mostrarse por encima.
       */
      const hayAlgoConPrioridad =
        actual?.estado === 'enviado' ||
        (actual?.estado === 'corregido' && !actual.visto_por_aspirante_en);

      if (!hayAlgoConPrioridad) {
        const progreso = cargarProgresoExamen(perfil.id);
        if (progreso) {
          setOrden(progreso.orden);
          setRespuestas(progreso.respuestas);
          setPaso(progreso.paso);
          setRecuperado(true);
          setTomando(true);
        }
      }
    } catch (e) {
      setError(mensajeDeErrorExamen(e, 'No se ha podido comprobar tu examen.'));
    } finally {
      setCargando(false);
    }
  }, [perfil.id]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  // Guarda el progreso en cuanto cambia algo, mientras se está tomando el
  // examen. Así sobrevive a una recarga, un cambio de pestaña o una
  // navegación a otra ruta y vuelta, sin depender de que React no se
  // desmonte por el camino.
  useEffect(() => {
    if (!tomando) return;
    guardarProgresoExamen(perfil.id, { paso, orden, respuestas });
  }, [tomando, paso, orden, respuestas, perfil.id]);

  const iniciarExamen = () => {
    setError('');
    setOrden(unidades.map((u) => u.id));
    setRespuestas(Array(preguntasExamen.length).fill(null));
    setPaso('orden');
    setConfirmandoEnvio(false);
    setRecuperado(false);
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

  const handleVistoAutorizacion = async () => {
    if (!autorizacion) return;
    try {
      setAutorizacion(await marcarAutorizacionVista(autorizacion.id));
    } catch (e) {
      setError(mensajeDeErrorExamen(e, 'No se ha podido actualizar la autorización.'));
    }
  };

  const handleEnviar = async () => {
    setEnviando(true);
    setError('');
    try {
      const nuevo = await enviarExamen({
        aspiranteId: perfil.id,
        ordenPreferencia: orden,
        respuestas,
      });
      setExamen(nuevo);
      setTomando(false);
      setConfirmandoEnvio(false);
      // El examen ya existe de verdad en el servidor; el progreso local ya
      // no representa nada, se borra.
      borrarProgresoExamen(perfil.id);
    } catch (e) {
      setError(mensajeDeErrorExamen(e, 'No se ha podido enviar el examen.'));
    } finally {
      setEnviando(false);
    }
  };

  // Con las 50 respondidas se envía directo; si quedan huecos, pide
  // confirmación primero (cuántas quedan, y que no se podrá modificar después).
  const intentarEnviar = () => {
    if (respuestas.every((r) => r !== null)) {
      void handleEnviar();
    } else {
      setConfirmandoEnvio(true);
    }
  };

  // Salta a la primera pregunta sin responder, para quien se haya dejado
  // alguna sin querer. Toca `document`, así que solo se llama desde un
  // manejador de evento, nunca durante el render.
  const irALaPrimeraSinResponder = () => {
    const indice = respuestas.findIndex((r) => r === null);
    if (indice === -1) return;
    const numero = preguntasExamen[indice].numero;
    const elemento = document.getElementById(`pregunta-${numero}`);
    elemento?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    elemento?.querySelector('input')?.focus();
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
    const sinResponder = respuestas.filter((r) => r === null).length;
    const todasRespondidas = sinResponder === 0;

    return (
      <Columna ancho="max-w-2xl">
        <Panel>
          <Rotulo titulo="Examen de ingreso" />

          {recuperado && (
            <p className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-fasor-gold/25 bg-fasor-surface2 p-3 text-sm leading-relaxed text-fasor-bone">
              <span>Se ha recuperado tu progreso guardado en este navegador.</span>
              <button
                type="button"
                className="btn-contorno shrink-0"
                onClick={() => setRecuperado(false)}
              >
                Entendido
              </button>
            </p>
          )}

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

              {confirmandoEnvio ? (
                <div className="border-t border-fasor-line pt-4">
                  <p className="text-sm leading-relaxed text-fasor-bone">
                    Vas a enviar el examen con {sinResponder}{' '}
                    {sinResponder === 1 ? 'pregunta sin responder' : 'preguntas sin responder'}.
                    Cuentan como fallo y no podrás modificar el examen después de enviarlo.
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      className="btn-solido w-full sm:w-auto"
                      onClick={() => void handleEnviar()}
                      disabled={enviando}
                    >
                      {enviando ? 'Enviando' : 'Confirmar envío'}
                    </button>
                    <button
                      type="button"
                      className="btn-contorno w-full sm:w-auto"
                      onClick={() => setConfirmandoEnvio(false)}
                      disabled={enviando}
                    >
                      Volver a revisar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 border-t border-fasor-line pt-4 sm:flex-row">
                  <button
                    type="button"
                    className="btn-solido w-full sm:w-auto"
                    onClick={intentarEnviar}
                    disabled={enviando}
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
              )}
              {!todasRespondidas && !confirmandoEnvio && (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs text-fasor-sage">
                    Te quedan {sinResponder} preguntas por responder.
                  </p>
                  <button type="button" className="btn-contorno" onClick={irALaPrimeraSinResponder}>
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    Ir a la primera sin responder
                  </button>
                </div>
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
  /*
   * La autorización solo cuenta si es para el examen actual (el comandante la
   * concede sobre el último examen corregido de ese momento; si desde
   * entonces se hubiera enviado otro, esa autorización vieja ya no cubre
   * nada, el trigger de la base de datos lo exige así).
   */
  const autorizacionVigente =
    autorizacion && examen && autorizacion.examen_id === examen.id ? autorizacion : null;
  const autorizacionSinVer = !!autorizacionVigente && !autorizacionVigente.visto_por_aspirante_en;
  const puedeIniciar =
    !examenPendiente &&
    !bannerPendiente &&
    (!examen || examen.resultado_final === 'no_apto_provisional' || !!autorizacionVigente);

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

        {!examenPendiente && !bannerPendiente && autorizacionSinVer && (
          <p className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-fasor-gold/25 bg-fasor-surface2 p-3 text-sm leading-relaxed text-fasor-bone">
            <span>Se te ha autorizado a presentarte a una nueva convocatoria.</span>
            <button
              type="button"
              className="btn-contorno shrink-0"
              onClick={() => void handleVistoAutorizacion()}
            >
              Entendido
            </button>
          </p>
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

        <CambiarContrasena />
        <BotonSalir />
      </Panel>
    </Columna>
  );
}
