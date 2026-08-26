import { useState, type FormEvent, type ReactNode } from 'react';
import { ClientOnly } from 'vite-react-ssg';
import { LogIn, LogOut, ShieldAlert } from 'lucide-react';
import fasorLogo from '../assets/fasor.jpg';
import Galon from '../components/Galon';
import { RankDivisa } from '../components/RankInsignia';
import SesionProvider from '../context/SesionContext';
import { useSesion } from '../context/useSesion';
import GestionMiembros from '../components/enlace/GestionMiembros';
import { escalafon } from '../data/escalafon';
import { getSupabase } from '../lib/supabase';
import { ETIQUETA_RANGO, emblemaUnidad, etiquetaUnidad, type Perfil } from '../lib/enlace-types';
import { puedeGestionarMiembros } from '../lib/enlace-gestion';

/*
 * Zona interna de FASOR (/enlace). Acceso y gestión de miembros.
 *
 * Es la única ruta del sitio que se renderiza en cliente. Todo lo que depende
 * de la sesión vive dentro de <ClientOnly>, así que el HTML pre-renderizado de
 * esta ruta contiene la maqueta y el panel de espera, nada más. El resto del
 * sitio sigue siendo SSG intacto.
 *
 * El buzón de mensajes es la fase 2 y aquí no se implementa ni se maqueta.
 */

// Un único mensaje para cualquier fallo de credenciales. No se distingue si la
// cuenta existe, para no filtrar quién es miembro de la entidad.
const ERROR_CREDENCIALES = 'Usuario o contraseña incorrectos.';
// El fallo de red sí se separa, porque no dice nada sobre la cuenta.
const ERROR_RED = 'No se ha podido conectar. Inténtalo de nuevo en unos minutos.';

// Alto del sello y, por tanto, del distintivo de rango que lo acompaña
const ALTO_CABECERA = 48;

/*
 * Columna que centra el contenido. Usa `m-auto` en lugar de `items-center` en
 * el contenedor: con centrado por alineación, un contenido más alto que la
 * ventana se recorta por arriba y deja parte inalcanzable, y la lista de
 * miembros puede ser larga. Los márgenes automáticos no tienen ese problema.
 *
 * Se ensancha a max-w-2xl solo cuando hay gestión de miembros; el acceso y los
 * avisos siguen en max-w-md.
 */
function Columna({ children, ancho = 'max-w-md' }: { children: ReactNode; ancho?: string }) {
  return <div className={`m-auto w-full ${ancho}`}>{children}</div>;
}

// Panel común a todos los estados. Superficie con filete dorado de 1px, radio
// de 4px, sin sombras ni brillos. A 360px ocupa el ancho disponible.
//
// La fila superior lleva el sello a la izquierda y, cuando hay rango que
// mostrar, su distintivo a la derecha. Ambos con `shrink-0`, para que en
// pantallas estrechas repartan el hueco sin comprimirse.
function Panel({ children, distintivo }: { children: ReactNode; distintivo?: ReactNode }) {
  return (
    <div className="w-full rounded-sm border border-fasor-gold/40 bg-fasor-surface p-6 sm:p-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <img
          src={fasorLogo}
          alt=""
          width={ALTO_CABECERA}
          height={ALTO_CABECERA}
          className="h-12 w-12 shrink-0 rounded-full border border-fasor-gold/40 object-cover"
        />
        {distintivo}
      </div>
      {children}
    </div>
  );
}

// Rótulo de la zona, común al acceso y al interior
function Rotulo({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <>
      <p className="etiqueta mb-2">Zona interna</p>
      <h1 className="flex items-center gap-3 font-display text-3xl font-bold uppercase tracking-tight text-fasor-bone">
        <Galon count={2} className="h-4 w-3 shrink-0" />
        {titulo}
      </h1>
      <div className="linea-fade mt-4" aria-hidden="true"></div>
      {children}
    </>
  );
}

// Estado de espera, mientras se resuelve la sesión (y en el HTML pre-renderizado)
function Cargando() {
  return (
    <Columna>
      <Panel>
        <Rotulo titulo="Enlace" />
        <p className="mt-6 font-mono text-xs tracking-widest text-fasor-gold" role="status">
          COMPROBANDO ACCESO
        </p>
      </Panel>
    </Columna>
  );
}

// Pantalla de acceso. El campo dice «Usuario» aunque sea de tipo email, porque
// los miembros no usan correos reales sino identificadores internos.
function Acceso() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (enviando) return;

    setEnviando(true);
    setError('');

    try {
      const { error: fallo } = await getSupabase().auth.signInWithPassword({
        email: usuario.trim(),
        password: contrasena,
      });
      // Si acierta no hay nada que hacer aquí, onAuthStateChange cambia la
      // pantalla. Un status ausente o de servidor delata un problema de red.
      if (fallo) {
        const esRed = !fallo.status || fallo.status >= 500;
        setError(esRed ? ERROR_RED : ERROR_CREDENCIALES);
        setEnviando(false);
      }
    } catch {
      setError(ERROR_RED);
      setEnviando(false);
    }
  };

  return (
    <Columna>
      <Panel>
        <Rotulo titulo="Enlace">
          <p className="mt-4 text-sm leading-relaxed text-fasor-sage">
            Vía oficial de comunicación de FASOR. El acceso está reservado a los miembros de la
            entidad.
          </p>
        </Rotulo>

        <form className="form-tactico mt-8" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="usuario">Usuario</label>
            <input
              id="usuario"
              type="email"
              required
              autoComplete="username"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              disabled={enviando}
              className="!text-base"
            />
          </div>

          <div>
            <label htmlFor="contrasena">Contraseña</label>
            <input
              id="contrasena"
              type="password"
              required
              autoComplete="current-password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              disabled={enviando}
              className="!text-base"
            />
          </div>

          <button type="submit" className="btn-solido w-full" disabled={enviando}>
            <LogIn className="h-4 w-4" aria-hidden="true" />
            {enviando ? 'Accediendo' : 'Acceder'}
          </button>

          {/* El error va en bone con el icono dorado, no en estado-rojo: los
            colores estado-* están reservados al Protocolo de Activación, y
            además el rojo no llega a AA sobre esta superficie. */}
          <div aria-live="polite" role="status" className="min-h-[1.25rem]">
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
        </form>

        <p className="mt-6 border-t border-fasor-line pt-5 text-xs leading-relaxed text-fasor-sage">
          Las cuentas las crea la Junta Directiva. Desde aquí no hay registro ni recuperación de
          contraseña.
        </p>
      </Panel>
    </Columna>
  );
}

// Botón de salida, compartido por el interior y por los avisos de cuenta
function BotonSalir() {
  const { salir } = useSesion();
  return (
    <button type="button" className="btn-contorno mt-8 w-full" onClick={() => void salir()}>
      <LogOut className="h-4 w-4" aria-hidden="true" />
      Salir
    </button>
  );
}

// Aviso de cuenta sin perfil o desactivada. Ninguna de las dos situaciones es
// culpa del miembro, así que se explica y se ofrece la salida.
function AvisoCuenta({ mensaje }: { mensaje: string }) {
  return (
    <Columna>
      <Panel>
        <Rotulo titulo="Enlace" />
        <p className="mt-6 flex items-start gap-2 text-sm leading-relaxed text-fasor-bone">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-fasor-gold" aria-hidden="true" />
          {mensaje}
        </p>
        <BotonSalir />
      </Panel>
    </Columna>
  );
}

// Pantalla interior, provisional en esta fase. Saluda al miembro con su rango y
// su unidad, y avisa de que el buzón todavía no está en servicio.
function Interior({ perfil }: { perfil: Perfil }) {
  const rango = ETIQUETA_RANGO[perfil.rango] ?? perfil.rango;
  const unidad = perfil.unidad ? etiquetaUnidad(perfil.unidad) : null;
  const emblema = perfil.unidad ? emblemaUnidad(perfil.unidad) : null;
  // Búsqueda tolerante en lugar de `rangoPorId`, que lanza: el rango llega de
  // la base de datos, y si un día no cuadrara con el escalafón la pantalla se
  // queda sin distintivo, no rota. El rango sigue leyéndose en texto.
  const divisa = escalafon.find((r) => r.id === perfil.rango)?.insignia ?? null;
  // La sección de gestión solo se monta para comandante y capitán: los demás
  // ni la ven ni piden la lista de miembros.
  const gestiona = puedeGestionarMiembros(perfil);

  return (
    <Columna ancho={gestiona ? 'max-w-2xl' : 'max-w-md'}>
      <Panel
        distintivo={
          divisa && (
            // Decorativo: el rango va escrito justo debajo, así que se oculta
            // entero a los lectores de pantalla (incluido el aria-label propio
            // de la divisa).
            <span aria-hidden="true" className="shrink-0">
              <RankDivisa divisa={divisa} alto={ALTO_CABECERA} />
            </span>
          )
        }
      >
        <Rotulo titulo={perfil.nombre}>
          <p className="mt-4 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-fasor-gold">
            {rango}
            {emblema && (
              <img
                src={emblema}
                alt=""
                aria-hidden="true"
                title={unidad ?? undefined}
                width={24}
                height={24}
                className="h-6 w-6 shrink-0 rounded-full border border-fasor-gold/40 object-cover"
              />
            )}
          </p>
          {unidad && <p className="mt-1 text-sm text-fasor-sage">{unidad}</p>}
        </Rotulo>

        <p className="mt-6 text-sm leading-relaxed text-fasor-sage">
          El buzón interno está en preparación. Cuando entre en servicio verás aquí las
          comunicaciones oficiales de la entidad.
        </p>

        <BotonSalir />
      </Panel>
      {gestiona && <GestionMiembros gestor={perfil} />}
    </Columna>
  );
}

// Reparte entre los estados posibles, ya montado en el navegador
function Zona() {
  const { sesion, perfil, cargando } = useSesion();

  if (cargando) return <Cargando />;
  if (!sesion) return <Acceso />;

  if (!perfil) {
    return (
      <AvisoCuenta mensaje="Tu cuenta no tiene perfil asignado, contacta con la Junta Directiva." />
    );
  }

  if (!perfil.activo) {
    return <AvisoCuenta mensaje="Tu cuenta está desactivada, contacta con la Junta Directiva." />;
  }

  return <Interior perfil={perfil} />;
}

export default function Enlace() {
  return (
    <div className="content-container flex min-h-[70vh] py-14 md:py-20">
      <ClientOnly fallback={<Cargando />}>
        {() => (
          <SesionProvider>
            <Zona />
          </SesionProvider>
        )}
      </ClientOnly>
    </div>
  );
}
