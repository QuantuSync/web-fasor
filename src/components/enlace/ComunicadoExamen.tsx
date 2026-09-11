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

const TEXTOS: Record<ResultadoExamen, (examen: Examen) => string> = {
  apto: (examen) =>
    `Has superado el examen de ingreso de FASOR. Pasas a formar parte de la entidad como Cadete en Formación, incorporado a la unidad ${
      examen.unidad_final ? unidadPorId(examen.unidad_final).nombre : ''
    }. Bienvenido, esperamos verte pronto en tu primera actividad de instrucción.`,
  no_apto_provisional: () =>
    'El resultado de tu examen de ingreso no alcanza, por ahora, el nivel que exige el ingreso en FASOR. No es un cierre, puedes volver a presentarte a una nueva convocatoria cuando lo consideres oportuno. Tómate el tiempo que necesites para prepararte, y vuelve cuando estés listo.',
  no_apto_definitivo: () =>
    'El resultado de tu examen de ingreso no permite tu incorporación a FASOR en esta convocatoria. Te agradecemos el interés y el tiempo que has dedicado, y quedas a la espera de que se abra una nueva convocatoria.',
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
      <p className="text-sm leading-relaxed text-fasor-bone">{TEXTOS[resultado](examen)}</p>
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
