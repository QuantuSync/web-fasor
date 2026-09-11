import { useState, type FormEvent } from 'react';
import { Check, X } from 'lucide-react';
import { usuarioFinal } from '../../lib/enlace-gestion';

/*
 * Formulario de alta y de renombrado de un aspirante. Mucho más simple que
 * `FormularioMiembro`, porque un aspirante no tiene rango que elegir (siempre
 * `aspirante`) ni unidad (siempre ninguna): no hay nada de eso que
 * seleccionar, así que no hay selects que puedan quedar desincronizados.
 *
 * El mismo componente sirve para las dos cosas: si llega `nombreActual` es un
 * renombrado (sin usuario ni contraseña, que no se tocan aquí) y si no, un
 * alta completa.
 */

export interface DatosAltaAspirante {
  nombre: string;
  usuario: string;
  contrasena: string;
}

interface Props {
  /** Si viene, se está renombrando; si no, se está dando de alta */
  nombreActual?: string;
  enviando: boolean;
  onGuardarAlta?: (datos: DatosAltaAspirante) => void;
  onGuardarNombre?: (nombre: string) => void;
  onCancelar: () => void;
}

export default function FormularioAspirante({
  nombreActual,
  enviando,
  onGuardarAlta,
  onGuardarNombre,
  onCancelar,
}: Props) {
  const esAlta = nombreActual === undefined;

  const [nombre, setNombre] = useState(nombreActual ?? '');
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  // Paso de revisión antes del alta, para que el usuario final se vea claro
  const [revisando, setRevisando] = useState(false);

  const identificador = usuarioFinal(usuario);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!esAlta) {
      onGuardarNombre?.(nombre.trim());
      return;
    }
    if (!revisando) {
      setRevisando(true);
      return;
    }
    onGuardarAlta?.({ nombre: nombre.trim(), usuario: identificador, contrasena });
  };

  if (esAlta && revisando) {
    return (
      <form className="mt-4 border-t border-fasor-line pt-4" onSubmit={handleSubmit}>
        <p className="etiqueta mb-3">Revisa el alta</p>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-widest text-fasor-sage">
              Nombre
            </dt>
            <dd className="text-fasor-bone">{nombre.trim()}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-widest text-fasor-sage">
              Usuario
            </dt>
            <dd className="text-fasor-gold">{identificador}</dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button type="submit" className="btn-solido w-full sm:w-auto" disabled={enviando}>
            <Check className="h-4 w-4" aria-hidden="true" />
            {enviando ? 'Dando de alta' : 'Confirmar alta'}
          </button>
          <button
            type="button"
            className="btn-contorno w-full sm:w-auto"
            onClick={() => setRevisando(false)}
            disabled={enviando}
          >
            Volver
          </button>
        </div>
      </form>
    );
  }

  return (
    <form className="form-tactico mt-4 border-t border-fasor-line pt-4" onSubmit={handleSubmit}>
      <p className="etiqueta">{esAlta ? 'Nuevo aspirante' : 'Renombrar aspirante'}</p>

      <div>
        <label htmlFor="nombre-aspirante">Nombre</label>
        <input
          id="nombre-aspirante"
          type="text"
          required
          autoComplete="off"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          disabled={enviando}
          className="!text-base"
        />
      </div>

      {esAlta && (
        <>
          <div>
            <label htmlFor="usuario-aspirante">Usuario</label>
            <input
              id="usuario-aspirante"
              type="text"
              required
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              disabled={enviando}
              className="!text-base"
            />
            <p className="mt-2 text-xs leading-relaxed text-fasor-sage">
              {identificador ? (
                <>
                  Se creará como <span className="text-fasor-bone">{identificador}</span>
                </>
              ) : (
                'Sin arroba se añade el dominio interno, que no recibe correo.'
              )}
            </p>
          </div>

          <div>
            <label htmlFor="contrasena-aspirante">Contraseña inicial</label>
            <input
              id="contrasena-aspirante"
              type="text"
              required
              minLength={8}
              autoComplete="off"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              disabled={enviando}
              className="!text-base"
            />
            <p className="mt-2 text-xs leading-relaxed text-fasor-sage">
              Mínimo 8 caracteres. Se la tendrás que comunicar al aspirante.
            </p>
          </div>
        </>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="submit" className="btn-solido w-full sm:w-auto" disabled={enviando}>
          <Check className="h-4 w-4" aria-hidden="true" />
          {esAlta ? 'Continuar' : enviando ? 'Guardando' : 'Guardar'}
        </button>
        <button
          type="button"
          className="btn-contorno w-full sm:w-auto"
          onClick={onCancelar}
          disabled={enviando}
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Cancelar
        </button>
      </div>
    </form>
  );
}
