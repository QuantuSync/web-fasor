import { useState } from 'react';
import { KeyRound, Lock, Pencil, UserCheck, UserMinus } from 'lucide-react';
import { type Perfil } from '../../lib/enlace-types';
import { puedeGestionar } from '../../lib/enlace-gestion';
import FormularioAspirante from './FormularioAspirante';

/*
 * Un aspirante, en tarjeta. Mismo patrón que `TarjetaMiembro` (tarjetas, no
 * tabla, confirmación en dos pasos dentro de la propia tarjeta), pero sin
 * rango ni unidad que mostrar o cambiar, porque un aspirante no tiene ninguna
 * de las dos cosas.
 */

type Panel = 'ninguno' | 'editar' | 'baja' | 'contrasena';

interface Props {
  aspirante: Perfil;
  gestor: Perfil;
  onRenombrar: (id: string, nombre: string) => Promise<void>;
  onCambiarAlta: (id: string, activo: boolean) => Promise<void>;
  onRestablecer: (id: string, contrasena: string) => Promise<void>;
}

export default function TarjetaAspirante({
  aspirante,
  gestor,
  onRenombrar,
  onCambiarAlta,
  onRestablecer,
}: Props) {
  const [panel, setPanel] = useState<Panel>('ninguno');
  const [enviando, setEnviando] = useState(false);
  const [contrasena, setContrasena] = useState('');

  // Lo que este gestor puede hacer con este aspirante. Solo oculta botones; la
  // autorización de verdad está en la política de la base de datos.
  const gestionable = puedeGestionar(gestor, aspirante);

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
