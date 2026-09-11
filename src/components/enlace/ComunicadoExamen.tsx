import { unidadPorId } from '../../data/unidades';
import type { Examen, ResultadoExamen } from '../../lib/enlace-examen';

/*
 * El comunicado de resultado del examen de ingreso, en tres plantillas. Se
 * muestra una sola vez (la pantalla que lo monta decide cuándo, mirando
 * `visto_por_aspirante_en`) tanto en la pantalla de aspirante como, para un
 * apto, en el `Interior` normal de quien acaba de ascender a Cadete.
 *
 * Un no apto no es un rechazo personal, y el texto está redactado para que no
 * suene a formulario ni a despido.
 */

const TEXTO_APTO_BASE = (unidadAsignada: string) =>
  `Has superado el examen de ingreso de FASOR. Pasas a formar parte de la entidad como Cadete en Formación, incorporado a la unidad ${unidadAsignada}.`;
const TEXTO_BIENVENIDA =
  'Bienvenido, esperamos verte pronto en tu primera actividad de instrucción.';

/*
 * El apto tiene dos variantes según la unidad asignada coincida o no con la
 * primera preferencia del aspirante. Cuando no coincide, el texto explica por
 * qué solo si esa explicación es cierta, es decir, solo si la unidad final
 * coincide con la que calculó la corrección automática (`unidad_automatica`).
 * Si el comandante corrigió la unidad a mano a otra distinta, ya no se puede
 * afirmar que la asignación siga la lógica de puntuación y orden de
 * preferencia, así que se usa un tercer texto que constata el hecho sin
 * atribuirle una causa que no está garantizada.
 */
const TEXTOS: Record<ResultadoExamen, (examen: Examen) => string[]> = {
  apto: (examen) => {
    const unidadAsignada = examen.unidad_final ? unidadPorId(examen.unidad_final).nombre : '';
    const primeraPreferenciaId = examen.orden_preferencia[0];

    if (!primeraPreferenciaId || examen.unidad_final === primeraPreferenciaId) {
      return [`${TEXTO_APTO_BASE(unidadAsignada)} ${TEXTO_BIENVENIDA}`];
    }

    if (examen.unidad_final === examen.unidad_automatica) {
      const primeraPreferencia = unidadPorId(primeraPreferenciaId).nombre;
      return [
        TEXTO_APTO_BASE(unidadAsignada),
        `La puntuación obtenida no alcanza la exigida para ${primeraPreferencia}, que figuraba en primer lugar en tu orden de preferencias, por lo que se te asigna la siguiente unidad de tu orden que sí cumple el requisito de puntuación.`,
        TEXTO_BIENVENIDA,
      ];
    }

    return [
      `${TEXTO_APTO_BASE(unidadAsignada)} Es una unidad distinta de la que figuraba en primer lugar en tu orden de preferencias.`,
      TEXTO_BIENVENIDA,
    ];
  },
  no_apto_provisional: () => [
    'El resultado de tu examen de ingreso no alcanza, por ahora, el nivel que exige el ingreso en FASOR. No es un cierre, puedes volver a presentarte a una nueva convocatoria cuando lo consideres oportuno. Tómate el tiempo que necesites para prepararte, y vuelve cuando estés listo.',
  ],
  no_apto_definitivo: () => [
    'El resultado de tu examen de ingreso no permite tu incorporación a FASOR en esta convocatoria. Te agradecemos el interés y el tiempo que has dedicado, y quedas a la espera de que se abra una nueva convocatoria.',
  ],
};

interface Props {
  examen: Examen;
  onVisto: () => void;
  onRepetir?: () => void;
  enviando?: boolean;
}

export default function ComunicadoExamen({ examen, onVisto, onRepetir, enviando = false }: Props) {
  const resultado = examen.resultado_final;
  if (!resultado) return null;

  return (
    <div className="mt-6 border-t border-fasor-line pt-6">
      <p className="etiqueta mb-3">Resultado del examen de ingreso</p>
      <div className="space-y-2 text-sm leading-relaxed text-fasor-bone">
        {TEXTOS[resultado](examen).map((parrafo, indice) => (
          <p key={indice}>{parrafo}</p>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className="btn-solido w-full sm:w-auto"
          onClick={onVisto}
          disabled={enviando}
        >
          Entendido
        </button>
        {resultado === 'no_apto_provisional' && onRepetir && (
          <button
            type="button"
            className="btn-contorno w-full sm:w-auto"
            onClick={onRepetir}
            disabled={enviando}
          >
            Repetir examen
          </button>
        )}
      </div>
    </div>
  );
}
