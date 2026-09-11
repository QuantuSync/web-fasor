import { useState } from 'react';
import { KeyRound, Lock, Pencil, RotateCcw, UserCheck, UserMinus } from 'lucide-react';
import { type Perfil } from '../../lib/enlace-types';
import { puedeGestionar } from '../../lib/enlace-gestion';
import { type ResumenExamenAspirante } from '../../lib/enlace-examen';
import FormularioAspirante from './FormularioAspirante';

/*
 * Un aspirante, en tarjeta. Mismo patrón que `TarjetaMiembro` (tarjetas, no
 * tabla, confirmación en dos pasos dentro de la propia tarjeta), pero sin
 * rango ni unidad que mostrar o cambiar, porque un aspirante no tiene ninguna
 * de las dos cosas.
 *
 * «Permitir un nuevo examen» es aparte, solo para el comandante
 * (`resumenExamen`/`onAutorizar` llegan `undefined` para cualquier otro, y
 * entonces ni se calcula ni se muestra), y solo tiene sentido sobre un
 * examen ya corregido. La autorización de verdad la exige la base de datos
 * (`11_autorizar_nuevo_examen.sql`); esto solo oculta el botón cuando no
 * procede o cuando ya hay una vigente para el último examen.
 */

type Panel = 'ninguno' | 'editar' | 'baja' | 'contrasena' | 'autorizar';

interface Props {
  aspirante: Perfil;
  gestor: Perfil;
  onRenombrar: (id: string, nombre: string) => Promise<void>;
  onCambiarAlta: (id: string, activo: boolean) => Promise<void>;
  onRestablecer: (id: string, contrasena: string) => Promise<void>;
  /** Solo si `gestor` es comandante; para cualquier otro rango, `undefined`. */
  resumenExamen?: ResumenExamenAspirante;
  /** Si el último examen de `resumenExamen` ya tiene una autorización sin usar. */
  yaAutorizado?: boolean;
  /** Solo si `gestor` es comandante; para cualquier otro rango, `undefined`. */
  onAutorizar?: (id: string, motivo: string) => Promise<void>;
}

export default function TarjetaAspirante({
  aspirante,
  gestor,
  onRenombrar,
  onCambiarAlta,
  onRestablecer,
  resumenExamen,
  yaAutorizado = false,
  onAutorizar,
}: Props) {
  const [panel, setPanel] = useState<Panel>('ninguno');
  const [enviando, setEnviando] = useState(false);
  const [contrasena, setContrasena] = useState('');
  const [motivoAutorizacion, setMotivoAutorizacion] = useState('');

  // Lo que este gestor puede hacer con este aspirante. Solo oculta botones; la
  // autorización de verdad está en la política de la base de datos.
  const gestionable = puedeGestionar(gestor, aspirante);

  // Solo tiene sentido ofrecer «Permitir un nuevo examen» sobre un examen ya
  // corregido; uno sin examinar o con uno pendiente no procede, y uno con una
  // autorización sin consumir no necesita otra.
  const puedeAutorizar =
    !!onAutorizar && resumenExamen?.ultimoEstado === 'corregido' && !yaAutorizado;

  const ejecutar = async (accion: () => Promise<void>) => {
    setEnviando(true);
    try {
      await accion();
      setPanel('ninguno');
      setContrasena('');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <article className="rounded-sm border border-fasor-gold/25 bg-fasor-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 break-words font-display text-lg font-bold uppercase tracking-tight text-fasor-bone">
          {aspirante.nombre}
        </h3>

        <span
          className={`shrink-0 rounded-sm border px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${
            aspirante.activo
              ? 'border-fasor-gold/40 text-fasor-gold'
              : 'border-fasor-line text-fasor-sage'
          }`}
        >
          {aspirante.activo ? 'Activo' : 'De baja'}
        </span>
      </div>

      {resumenExamen && (
        <p className="mt-1 text-xs text-fasor-sage">
          {resumenExamen.total === 1
            ? 'Ha hecho 1 examen'
            : `Ha hecho ${resumenExamen.total} exámenes`}
          {yaAutorizado && ', con un nuevo examen ya autorizado'}
        </p>
      )}

      {!gestionable && (
        <p className="mt-4 flex items-start gap-2 border-t border-fasor-line pt-4 text-xs leading-relaxed text-fasor-sage">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-fasor-gold" aria-hidden="true" />
          Esta ficha no la puedes gestionar.
        </p>
      )}

      {gestionable && panel === 'ninguno' && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-fasor-line pt-4">
          <Accion icono={Pencil} rotulo="Renombrar" onClick={() => setPanel('editar')} />
          <Accion icono={KeyRound} rotulo="Contraseña" onClick={() => setPanel('contrasena')} />
          <Accion
            icono={aspirante.activo ? UserMinus : UserCheck}
            rotulo={aspirante.activo ? 'Dar de baja' : 'Reactivar'}
            onClick={() => setPanel('baja')}
          />
          {puedeAutorizar && (
            <Accion
              icono={RotateCcw}
              rotulo="Permitir un nuevo examen"
              onClick={() => setPanel('autorizar')}
            />
          )}
        </div>
      )}

      {panel === 'editar' && (
        <FormularioAspirante
          nombreActual={aspirante.nombre}
          enviando={enviando}
          onGuardarNombre={(nombre) => void ejecutar(() => onRenombrar(aspirante.id, nombre))}
          onCancelar={() => setPanel('ninguno')}
        />
      )}

      {panel === 'baja' && (
        <div className="mt-4 border-t border-fasor-line pt-4">
          <p className="text-sm leading-relaxed text-fasor-bone">
            {aspirante.activo
              ? `Vas a dar de baja a ${aspirante.nombre}. Perderá el acceso a la zona interna, pero su cuenta no se borra y puede reactivarse.`
              : `Vas a reactivar a ${aspirante.nombre}. Recuperará el acceso a la zona interna.`}
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              className="btn-solido w-full sm:w-auto"
              onClick={() => void ejecutar(() => onCambiarAlta(aspirante.id, !aspirante.activo))}
              disabled={enviando}
            >
              {enviando
                ? 'Aplicando'
                : aspirante.activo
                  ? 'Confirmar baja'
                  : 'Confirmar reactivación'}
            </button>
            <button
              type="button"
              className="btn-contorno w-full sm:w-auto"
              onClick={() => setPanel('ninguno')}
              disabled={enviando}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {panel === 'contrasena' && (
        <form
          className="form-tactico mt-4 border-t border-fasor-line pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            void ejecutar(() => onRestablecer(aspirante.id, contrasena));
          }}
        >
          <p className="etiqueta">Restablecer contraseña</p>
          <p className="text-sm leading-relaxed text-fasor-sage">
            Vas a cambiar la contraseña de {aspirante.nombre}. La anterior dejará de servir y
            tendrás que comunicarle la nueva.
          </p>
          <div>
            <label htmlFor={`contrasena-${aspirante.id}`}>Contraseña nueva</label>
            <input
              id={`contrasena-${aspirante.id}`}
              type="text"
              required
              minLength={8}
              autoComplete="off"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              disabled={enviando}
              className="!text-base"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="submit" className="btn-solido w-full sm:w-auto" disabled={enviando}>
              {enviando ? 'Cambiando' : 'Confirmar cambio'}
            </button>
            <button
              type="button"
              className="btn-contorno w-full sm:w-auto"
              onClick={() => {
                setPanel('ninguno');
                setContrasena('');
              }}
              disabled={enviando}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {panel === 'autorizar' && onAutorizar && (
        <form
          className="form-tactico mt-4 border-t border-fasor-line pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            void ejecutar(async () => {
              await onAutorizar(aspirante.id, motivoAutorizacion);
              setMotivoAutorizacion('');
            });
          }}
        >
          <p className="etiqueta">Permitir un nuevo examen</p>
          <p className="text-sm leading-relaxed text-fasor-bone">
            Vas a autorizar a {aspirante.nombre} a presentarse otra vez, pese al resultado de su
            último examen. Ese examen no se borra ni se modifica, queda tal cual; el nuevo será uno
            aparte. Quedará constancia de que lo autorizas tú, cuándo y por qué.
          </p>
          <div>
            <label htmlFor={`motivo-autorizacion-${aspirante.id}`}>Motivo</label>
            <textarea
              id={`motivo-autorizacion-${aspirante.id}`}
              required
              rows={3}
              value={motivoAutorizacion}
              onChange={(e) => setMotivoAutorizacion(e.target.value)}
              disabled={enviando}
              className="!text-base"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="submit" className="btn-solido w-full sm:w-auto" disabled={enviando}>
              {enviando ? 'Autorizando' : 'Confirmar autorización'}
            </button>
            <button
              type="button"
              className="btn-contorno w-full sm:w-auto"
              onClick={() => {
                setPanel('ninguno');
                setMotivoAutorizacion('');
              }}
              disabled={enviando}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </article>
  );
}

// Botón de acción de la tarjeta: contorno fino, cómodo de tocar
function Accion({
  icono: Icono,
  rotulo,
  onClick,
}: {
  icono: typeof Pencil;
  rotulo: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-[44px] items-center gap-2 rounded-sm border border-fasor-gold/40
                 px-3 py-2 font-display text-xs font-semibold uppercase tracking-[0.15em]
                 text-fasor-gold transition-colors duration-200 hover:bg-fasor-surface2"
    >
      <Icono className="h-4 w-4" aria-hidden="true" />
      {rotulo}
    </button>
  );
}
