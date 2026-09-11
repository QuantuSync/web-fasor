import type { PreguntaExamen as DatosPregunta } from '../../data/examen';

/*
 * Una pregunta del examen de ingreso, con sus cuatro opciones. No lleva
 * ninguna marca de correcta o incorrecta, el aspirante nunca recibe esa
 * información, ni siquiera después de corregirse (ver `07_examen_ingreso.sql`).
 */

interface Props {
  pregunta: DatosPregunta;
  respuesta: number | null;
  onResponder: (opcion: number) => void;
  disabled?: boolean;
}

export default function PreguntaExamen({
  pregunta,
  respuesta,
  onResponder,
  disabled = false,
}: Props) {
  const nombreGrupo = `pregunta-${pregunta.numero}`;

  return (
    <fieldset
      id={nombreGrupo}
      className="rounded-sm border border-fasor-gold/25 bg-fasor-surface p-4 sm:p-5"
    >
      <legend className="px-1 text-sm leading-relaxed text-fasor-bone">
        <span className="mr-2 font-mono text-xs text-fasor-gold">{pregunta.numero}.</span>
        {pregunta.enunciado}
      </legend>
      <div className="mt-3 space-y-2">
        {pregunta.opciones.map((opcion, indice) => (
          <label
            key={indice}
            className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-sm border border-fasor-line px-3 py-2 text-sm text-fasor-bone transition-colors duration-200 has-[:checked]:border-fasor-gold/60 has-[:checked]:bg-fasor-surface2"
          >
            <input
              type="radio"
              name={nombreGrupo}
              value={indice}
              checked={respuesta === indice}
              onChange={() => onResponder(indice)}
              disabled={disabled}
              className="h-4 w-4 shrink-0 accent-fasor-gold"
            />
            {opcion}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
