import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { unidades, type UnidadId } from '../../data/unidades';
import { preguntaPorNumero } from '../../data/examen';
import {
  cargarCorreccion,
  mensajeDeErrorExamen,
  ratificarExamen,
  type CorreccionPregunta,
  type Examen,
  type ExamenConAspirante,
  type RatificacionExamen,
  type ResultadoExamen,
} from '../../lib/enlace-examen';
import { type Perfil } from '../../lib/enlace-types';

/*
 * Detalle de un examen pendiente de revisar. Dos botones rápidos (APTO / NO
 * APTO) que ratifican el resultado automático tal cual, y un desplegable
 * «Corregir» para cualquier otra combinación, con motivo obligatorio.
 *
 * El bloqueo de unidad para teniente y capitán se acompaña aquí (opciones que
 * no se ofrecen, nota que explica por qué), pero la garantía real es el
 * trigger `examenes_protecciones` en `07_examen_ingreso.sql`: si este
 * componente se equivocara, la base de datos rechaza igual el intento.
 */

const ETIQUETA_RESULTADO: Record<ResultadoExamen, string> = {
  apto: 'Apto',
  no_apto_provisional: 'No apto, provisional',
  no_apto_definitivo: 'No apto, hasta nueva convocatoria',
};

interface Props {
  examen: ExamenConAspirante;
  gestor: Perfil;
  onResuelto: (resultado: 'corregido' | 'ya_corregido') => void;
  onCancelar: () => void;
}

export default function RevisionExamen({ examen, gestor, onResuelto, onCancelar }: Props) {
  const [correccion, setCorreccion] = useState<CorreccionPregunta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const [corrigiendo, setCorrigiendo] = useState(false);
  const [resultadoCorregido, setResultadoCorregido] = useState<ResultadoExamen>(
    examen.resultado_automatico ?? 'no_apto_provisional'
  );
  const [unidadCorregida, setUnidadCorregida] = useState<UnidadId | ''>(
    examen.unidad_automatica ?? ''
  );
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    cargarCorreccion(examen.id)
      .then((filas) => {
        if (vigente) setCorreccion(filas);
      })
      .catch((e) => {
        if (vigente) setError(mensajeDeErrorExamen(e, 'No se ha podido cargar la corrección.'));
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [examen.id]);

  const automaticoEsApto = examen.resultado_automatico === 'apto';
  const esComandante = gestor.rango === 'comandante';
  // Sin ser el comandante, solo se puede optar a apto si el automático ya lo era.
  const puedeElegirApto = automaticoEsApto || esComandante;

  const enviar = async (datos: RatificacionExamen) => {
    setEnviando(true);
    setError('');
    try {
      const resultado: Examen | null = await ratificarExamen(examen.id, datos);
      onResuelto(resultado ? 'corregido' : 'ya_corregido');
    } catch (e) {
      setError(mensajeDeErrorExamen(e, 'No se ha podido ratificar el examen.'));
      setEnviando(false);
    }
  };

  const handleRatificarAutomatico = () => {
    if (!examen.resultado_automatico) return;
    void enviar({
      resultadoFinal: examen.resultado_automatico,
      unidadFinal: examen.unidad_automatica,
      corregidoManualmente: false,
    });
  };

  const handleGuardarCorreccion = () => {
    if (!motivo.trim()) {
      setError('Explica el motivo de la corrección.');
      return;
    }
    const unidadFinal: UnidadId | null =
      resultadoCorregido !== 'apto'
        ? null
        : esComandante
          ? unidadCorregida || null
          : (examen.unidad_automatica ?? null);

    void enviar({
      resultadoFinal: resultadoCorregido,
      unidadFinal,
      corregidoManualmente: true,
      motivoCorreccion: motivo.trim(),
    });
  };

  return (
    <div className="rounded-sm border border-fasor-gold/40 bg-fasor-surface p-6 sm:p-8">
      <p className="etiqueta mb-2">Examen de ingreso</p>
      <h3 className="font-display text-xl font-bold uppercase tracking-tight text-fasor-bone">
        {examen.aspirante?.nombre ?? 'Aspirante'}
      </h3>
      <div className="linea-fade mt-4" aria-hidden="true"></div>

      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <Dato rotulo="Puntuación" valor={`${examen.puntuacion_automatica ?? '—'} / 50`} />
        <Dato
          rotulo="Banda automática"
          valor={
            examen.resultado_automatico ? ETIQUETA_RESULTADO[examen.resultado_automatico] : '—'
          }
        />
        <Dato
          rotulo="Unidad propuesta"
          valor={
            examen.unidad_automatica
              ? (unidades.find((u) => u.id === examen.unidad_automatica)?.nombre ??
                examen.unidad_automatica)
              : 'Ninguna'
          }
        />
        <Dato
          rotulo="Enviado"
          valor={new Intl.DateTimeFormat('es-ES', {
            dateStyle: 'short',
            timeStyle: 'short',
          }).format(new Date(examen.creado_en))}
        />
      </dl>

      <div className="mt-6">
        <p className="etiqueta mb-3">Orden de preferencia del aspirante</p>
        <ol className="space-y-1 text-sm text-fasor-bone">
          {examen.orden_preferencia.map((id, indice) => (
            <li key={id}>
              <span className="mr-2 font-mono text-xs text-fasor-gold">{indice + 1}.</span>
              {unidades.find((u) => u.id === id)?.nombre ?? id}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6">
        <p className="etiqueta mb-3">Respuestas</p>
        {cargando && (
          <p className="font-mono text-xs tracking-widest text-fasor-gold" role="status">
            CARGANDO RESPUESTAS
          </p>
        )}
        {!cargando && (
          <ol className="max-h-96 space-y-2 overflow-y-auto pr-1 text-sm">
            {correccion.map((fila) => {
              const pregunta = preguntaPorNumero(fila.numero);
              return (
                <li
                  key={fila.numero}
                  className={`rounded-sm border p-3 ${
                    fila.acierto ? 'border-fasor-gold/25' : 'border-fasor-line'
                  }`}
                >
                  <p className="text-fasor-bone">
                    <span className="mr-2 font-mono text-xs text-fasor-gold">{fila.numero}.</span>
                    {pregunta.enunciado}
                  </p>
                  <p className="mt-1 text-xs text-fasor-sage">
                    {fila.respuesta === null
                      ? 'No respondió a esta pregunta.'
                      : `Respondió, ${pregunta.opciones[fila.respuesta]}${fila.acierto ? ' (correcta)' : ' (incorrecta)'}`}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div aria-live="polite" className="mt-5">
        {error && (
          <p className="flex items-start gap-2 text-sm text-fasor-bone">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-fasor-gold" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>

      {!corrigiendo && (
        <div className="mt-6 flex flex-wrap gap-2 border-t border-fasor-line pt-6">
          <button
            type="button"
            className="btn-solido"
            onClick={handleRatificarAutomatico}
            disabled={enviando || !automaticoEsApto}
            title={
              !automaticoEsApto ? 'El resultado automático no fue apto, usa Corregir.' : undefined
            }
          >
            Ratificar APTO
          </button>
          <button
            type="button"
            className="btn-solido"
            onClick={handleRatificarAutomatico}
            disabled={enviando || automaticoEsApto}
            title={automaticoEsApto ? 'El resultado automático fue apto, usa Corregir.' : undefined}
          >
            Ratificar NO APTO
          </button>
          <button
            type="button"
            className="btn-contorno"
            onClick={() => setCorrigiendo(true)}
            disabled={enviando}
          >
            Corregir
          </button>
          <button type="button" className="btn-contorno" onClick={onCancelar} disabled={enviando}>
            Volver a la lista
          </button>
        </div>
      )}

      {corrigiendo && (
        <div className="form-tactico mt-6 border-t border-fasor-line pt-6">
          <p className="etiqueta">Corregir resultado</p>

          <div>
            <label htmlFor="resultado-corregido">Resultado</label>
            <select
              id="resultado-corregido"
              value={resultadoCorregido}
              onChange={(e) => setResultadoCorregido(e.target.value as ResultadoExamen)}
              disabled={enviando}
              className="!text-base"
            >
              {(puedeElegirApto
                ? (['apto', 'no_apto_provisional', 'no_apto_definitivo'] as ResultadoExamen[])
                : (['no_apto_provisional', 'no_apto_definitivo'] as ResultadoExamen[])
              ).map((r) => (
                <option key={r} value={r}>
                  {ETIQUETA_RESULTADO[r]}
                </option>
              ))}
            </select>
            {!puedeElegirApto && (
              <p className="mt-2 text-xs leading-relaxed text-fasor-sage">
                Convertir un no apto en apto exige asignar unidad, y eso corresponde al comandante.
              </p>
            )}
          </div>

          {resultadoCorregido === 'apto' && (
            <div>
              <label htmlFor="unidad-corregida">Unidad</label>
              {esComandante ? (
                <select
                  id="unidad-corregida"
                  value={unidadCorregida}
                  onChange={(e) => setUnidadCorregida(e.target.value as UnidadId)}
                  disabled={enviando}
                  className="!text-base"
                >
                  {unidades.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-fasor-bone">
                  {unidades.find((u) => u.id === examen.unidad_automatica)?.nombre ?? 'Sin unidad'}
                  <span className="ml-2 text-xs text-fasor-sage">
                    (la propuesta, solo el comandante puede cambiarla)
                  </span>
                </p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="motivo-correccion">Motivo de la corrección</label>
            <textarea
              id="motivo-correccion"
              required
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              disabled={enviando}
              className="!text-base"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              className="btn-solido w-full sm:w-auto"
              onClick={handleGuardarCorreccion}
              disabled={enviando}
            >
              {enviando ? 'Guardando' : 'Confirmar corrección'}
            </button>
            <button
              type="button"
              className="btn-contorno w-full sm:w-auto"
              onClick={() => setCorrigiendo(false)}
              disabled={enviando}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Dato({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-widest text-fasor-sage">{rotulo}</dt>
      <dd className="text-fasor-bone">{valor}</dd>
    </div>
  );
}
