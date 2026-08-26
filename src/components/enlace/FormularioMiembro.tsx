import { useState, type FormEvent } from 'react';
import { Check, X } from 'lucide-react';
import { unidades } from '../../data/unidades';
import { ETIQUETA_RANGO, type Perfil, type Rango, type Unidad } from '../../lib/enlace-types';
import {
  rangosAsignables,
  unidadesAsignables,
  unidadObligatoria,
  usuarioFinal,
} from '../../lib/enlace-gestion';

/*
 * Formulario de alta y de edición de un miembro. El mismo sirve para las dos
 * cosas: si llega `miembro` es una edición (sin usuario ni contraseña, que no
 * se cambian aquí) y si no, un alta.
 *
 * Se despliega dentro de la tarjeta, sin diálogo modal: a 360px se maneja mejor
 * que una ventana flotante, y evita duplicar el atrapado de foco de
 * UnidadAmpliada.tsx para un formulario que no lo necesita.
 *
 * Los rangos y unidades que ofrece salen de la jerarquía, pero eso solo oculta:
 * quien autoriza es la política de la base de datos.
 */

export interface DatosMiembro {
  nombre: string;
  usuario: string;
  contrasena: string;
  rango: Rango;
  unidad: Unidad | null;
}

interface Props {
  gestor: Perfil;
  /** Si viene, se está editando; si no, se está dando de alta */
  miembro?: Perfil;
  enviando: boolean;
  onGuardar: (datos: DatosMiembro) => void;
  onCancelar: () => void;
}

export default function FormularioMiembro({
  gestor,
  miembro,
  enviando,
  onGuardar,
  onCancelar,
}: Props) {
  const esAlta = !miembro;
  const rangos = rangosAsignables(gestor);
  const permitidas = unidadesAsignables(gestor);
  const unidadesOfrecidas =
    permitidas === 'todas' ? unidades : unidades.filter((u) => permitidas.includes(u.id));
  const obligatoria = unidadObligatoria(gestor);

  /*
   * Editarse a uno mismo. El rango propio no se toca nunca, ni hacia arriba ni
   * hacia abajo, y un capitán tampoco su unidad, porque perdería el mando sobre
   * la suya. Lo impide el trigger de la base de datos; aquí solo se deshabilita
   * para no ofrecer una acción que va a rebotar. El nombre sí se puede cambiar.
   */
  const esUnoMismo = !!miembro && miembro.id === gestor.id;
  const rangoBloqueado = esUnoMismo;
  const unidadBloqueada = esUnoMismo && gestor.rango === 'capitan';

  const [nombre, setNombre] = useState(miembro?.nombre ?? '');
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rango, setRango] = useState<Rango>(miembro?.rango ?? rangos[rangos.length - 1]);
  const [unidad, setUnidad] = useState<Unidad | ''>(
    miembro?.unidad ?? (obligatoria ? (unidadesOfrecidas[0]?.id ?? '') : '')
  );
  // Paso de revisión antes del alta, para que el usuario final se vea claro
  const [revisando, setRevisando] = useState(false);

  const identificador = usuarioFinal(usuario);
  const idFormulario = miembro ? `editar-${miembro.id}` : 'alta';

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (esAlta && !revisando) {
      setRevisando(true);
      return;
    }
    onGuardar({
      nombre: nombre.trim(),
      usuario: identificador,
      contrasena,
      rango,
      unidad: unidad === '' ? null : unidad,
    });
  };

  // Revisión del alta. Se enseña el identificador final ya con el dominio.
  if (revisando) {
    const nombreUnidad = unidades.find((u) => u.id === unidad)?.nombre ?? 'Sin unidad';
    return (
      <form className="mt-4 border-t border-fasor-line pt-4" onSubmit={handleSubmit}>
        <p className="etiqueta mb-3">Revisa el alta</p>
        <dl className="space-y-2 text-sm">
          <Dato rotulo="Nombre" valor={nombre.trim()} />
          <Dato rotulo="Usuario" valor={identificador} destacado />
          <Dato rotulo="Rango" valor={ETIQUETA_RANGO[rango]} />
          <Dato rotulo="Unidad" valor={nombreUnidad} />
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
      <p className="etiqueta">{esAlta ? 'Nuevo miembro' : 'Editar miembro'}</p>

      <div>
        <label htmlFor={`nombre-${idFormulario}`}>Nombre</label>
        <input
          id={`nombre-${idFormulario}`}
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
            <label htmlFor="usuario-alta">Usuario</label>
            <input
              id="usuario-alta"
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
            <label htmlFor="contrasena-alta">Contraseña inicial</label>
            <input
              id="contrasena-alta"
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
              Mínimo 8 caracteres. Se la tendrás que comunicar al miembro.
            </p>
          </div>
        </>
      )}

      <div>
        <label htmlFor={`rango-${idFormulario}`}>Rango</label>
        <select
          id={`rango-${idFormulario}`}
          value={rango}
          onChange={(e) => setRango(e.target.value as Rango)}
          disabled={enviando || rangoBloqueado}
          className="!text-base disabled:cursor-not-allowed disabled:opacity-60"
        >
          {rangos.map((r) => (
            <option key={r} value={r}>
              {ETIQUETA_RANGO[r]}
            </option>
          ))}
        </select>
        {rangoBloqueado && (
          <p className="mt-2 text-xs leading-relaxed text-fasor-sage">
            Tu propio rango no se puede cambiar, ni subirlo ni bajarlo. Te lo tiene que cambiar otro
            mando.
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`unidad-${idFormulario}`}>Unidad</label>
        <select
          id={`unidad-${idFormulario}`}
          value={unidad}
          onChange={(e) => setUnidad(e.target.value as Unidad | '')}
          disabled={enviando || unidadBloqueada || (obligatoria && unidadesOfrecidas.length === 1)}
          className="!text-base disabled:cursor-not-allowed disabled:opacity-60"
        >
          {!obligatoria && <option value="">Sin unidad</option>}
          {unidadesOfrecidas.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre}
            </option>
          ))}
        </select>
        {unidadBloqueada && (
          <p className="mt-2 text-xs leading-relaxed text-fasor-sage">
            Tu propia unidad no se puede cambiar, perderías el mando sobre la tuya.
          </p>
        )}
      </div>

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

// Fila de la revisión: rótulo encima del dato, sin dos puntos
function Dato({
  rotulo,
  valor,
  destacado = false,
}: {
  rotulo: string;
  valor: string;
  destacado?: boolean;
}) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-widest text-fasor-sage">{rotulo}</dt>
      <dd className={destacado ? 'text-fasor-gold' : 'text-fasor-bone'}>{valor}</dd>
    </div>
  );
}
