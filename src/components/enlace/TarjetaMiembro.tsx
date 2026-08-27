import { useState } from 'react';
import { KeyRound, Lock, Pencil, UserCheck, UserMinus } from 'lucide-react';
import { ETIQUETA_RANGO, emblemaUnidad, etiquetaUnidad, type Perfil } from '../../lib/enlace-types';
import { puedeGestionar } from '../../lib/enlace-gestion';
import FormularioMiembro, { type DatosMiembro } from './FormularioMiembro';

/*
 * Un miembro, en tarjeta. Nunca en tabla: a 360px una tabla se rompe o exige
 * scroll lateral, y aquí hay que poder leer y actuar con el pulgar.
 *
 * Las acciones destructivas (baja y contraseña) no se ejecutan al primer toque:
 * abren su propia confirmación dentro de la tarjeta.
 */

type Panel = 'ninguno' | 'editar' | 'baja' | 'contrasena';

interface Props {
  miembro: Perfil;
  gestor: Perfil;
  onEditar: (id: string, datos: DatosMiembro) => Promise<void>;
  onCambiarAlta: (id: string, activo: boolean) => Promise<void>;
  onRestablecer: (id: string, contrasena: string) => Promise<void>;
}

export default function TarjetaMiembro({
  miembro,
  gestor,
  onEditar,
  onCambiarAlta,
  onRestablecer,
}: Props) {
  const [panel, setPanel] = useState<Panel>('ninguno');
  const [enviando, setEnviando] = useState(false);
  const [contrasena, setContrasena] = useState('');

  const emblema = miembro.unidad ? emblemaUnidad(miembro.unidad) : null;
  const nombreUnidad = miembro.unidad ? etiquetaUnidad(miembro.unidad) : null;

  // Lo que este gestor puede hacer con este miembro. Solo oculta botones; la
  // autorización de verdad está en la política de la base de datos.
  const gestionable = puedeGestionar(gestor, miembro);
  const esUnoMismo = miembro.id === gestor.id;
  /*
   * El nombre propio se puede cambiar siempre, aunque uno no se gestione a sí
   * mismo por jerarquía (un capitán, un secretario, un tesorero). Cambiarse el
   * nombre no da poder sobre nadie. El formulario deja lo demás deshabilitado,
   * y el trigger de la base de datos rechaza cualquier otra columna.
   */
  const editable = gestionable || esUnoMismo;
  // Nadie se da de baja a sí mismo. El servidor lo impide igual, con un trigger.
  const puedeCambiarAlta = gestionable && !esUnoMismo;

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
        <div className="min-w-0">
          <h3 className="break-words font-display text-lg font-bold uppercase tracking-tight text-fasor-bone">
            {miembro.nombre}
          </h3>
          <p className="mt-1 flex items-start gap-2 font-mono text-xs uppercase tracking-widest text-fasor-gold">
            <span>{ETIQUETA_RANGO[miembro.rango] ?? miembro.rango}</span>
            {emblema && (
              <img
                src={emblema}
                alt=""
                aria-hidden="true"
                title={nombreUnidad ?? undefined}
                width={24}
                height={24}
                className="h-6 w-6 shrink-0 rounded-full border border-fasor-gold/40 object-cover"
              />
            )}
          </p>
          <p className="mt-1 text-sm text-fasor-sage">{nombreUnidad ?? 'Sin unidad'}</p>
        </div>

        <span
          className={`shrink-0 rounded-sm border px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${
            miembro.activo
              ? 'border-fasor-gold/40 text-fasor-gold'
              : 'border-fasor-line text-fasor-sage'
          }`}
        >
          {miembro.activo ? 'Activo' : 'De baja'}
        </span>
      </div>

      {/* Ficha bloqueada. Un cargo de Junta ve al comandante y no lo toca, y un
          capitán ve a otro capitán de su unidad y tampoco. Se dice, en vez de
          dejar la tarjeta muda sin botones y sin explicación. */}
      {!editable && (
        <p className="mt-4 flex items-start gap-2 border-t border-fasor-line pt-4 text-xs leading-relaxed text-fasor-sage">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-fasor-gold" aria-hidden="true" />
          Esta ficha solo la gestiona el comandante.
        </p>
      )}

      {editable && panel === 'ninguno' && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-fasor-line pt-4">
          <Accion icono={Pencil} rotulo="Editar" onClick={() => setPanel('editar')} />
          {gestionable && (
            <Accion icono={KeyRound} rotulo="Contraseña" onClick={() => setPanel('contrasena')} />
          )}
          {puedeCambiarAlta && (
            <Accion
              icono={miembro.activo ? UserMinus : UserCheck}
              rotulo={miembro.activo ? 'Dar de baja' : 'Reactivar'}
              onClick={() => setPanel('baja')}
            />
          )}
        </div>
      )}

      {panel === 'editar' && (
        <FormularioMiembro
          gestor={gestor}
          miembro={miembro}
          enviando={enviando}
          onGuardar={(datos) => void ejecutar(() => onEditar(miembro.id, datos))}
          onCancelar={() => setPanel('ninguno')}
        />
      )}

      {panel === 'baja' && (
        <Confirmacion
          pregunta={
            miembro.activo
              ? `Vas a dar de baja a ${miembro.nombre}. Perderá el acceso a la zona interna, pero su cuenta no se borra y puede reactivarse.`
              : `Vas a reactivar a ${miembro.nombre}. Recuperará el acceso a la zona interna.`
          }
          rotulo={miembro.activo ? 'Confirmar baja' : 'Confirmar reactivación'}
          enviando={enviando}
          onConfirmar={() => void ejecutar(() => onCambiarAlta(miembro.id, !miembro.activo))}
          onCancelar={() => setPanel('ninguno')}
        />
      )}

      {panel === 'contrasena' && (
        <form
          className="form-tactico mt-4 border-t border-fasor-line pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            void ejecutar(() => onRestablecer(miembro.id, contrasena));
          }}
        >
          <p className="etiqueta">Restablecer contraseña</p>
          <p className="text-sm leading-relaxed text-fasor-sage">
            Vas a cambiar la contraseña de {miembro.nombre}. La anterior dejará de servir y tendrás
            que comunicarle la nueva.
          </p>
          <div>
            <label htmlFor={`contrasena-${miembro.id}`}>Contraseña nueva</label>
            <input
              id={`contrasena-${miembro.id}`}
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

// Confirmación explícita, dentro de la propia tarjeta
function Confirmacion({
  pregunta,
  rotulo,
  enviando,
  onConfirmar,
  onCancelar,
}: {
  pregunta: string;
  rotulo: string;
  enviando: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <div className="mt-4 border-t border-fasor-line pt-4">
      <p className="text-sm leading-relaxed text-fasor-bone">{pregunta}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className="btn-solido w-full sm:w-auto"
          onClick={onConfirmar}
          disabled={enviando}
        >
          {enviando ? 'Aplicando' : rotulo}
        </button>
        <button
          type="button"
          className="btn-contorno w-full sm:w-auto"
          onClick={onCancelar}
          disabled={enviando}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
