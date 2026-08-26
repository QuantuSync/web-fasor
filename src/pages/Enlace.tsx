import { useState, type FormEvent, type ReactNode } from 'react';
import { ClientOnly } from 'vite-react-ssg';
import { LogIn, LogOut, ShieldAlert } from 'lucide-react';
import fasorLogo from '../assets/fasor.jpg';
import Galon from '../components/Galon';
import SesionProvider from '../context/SesionContext';
import { useSesion } from '../context/useSesion';
import { getSupabase } from '../lib/supabase';
import { ETIQUETA_RANGO, etiquetaUnidad } from '../lib/enlace-types';

/*
 * Zona interna de FASOR (/enlace). Fase 1, solo el acceso.
 *
 * Es la única ruta del sitio que se renderiza en cliente. Todo lo que depende
 * de la sesión vive dentro de <ClientOnly>, así que el HTML pre-renderizado de
 * esta ruta contiene la maqueta y el panel de espera, nada más. El resto del
 * sitio sigue siendo SSG intacto.
 *
 * Los mensajes son la fase 2 y aquí no se implementan ni se maquetan.
 */

// Un único mensaje para cualquier fallo de credenciales. No se distingue si la
// cuenta existe, para no filtrar quién es miembro de la entidad.
const ERROR_CREDENCIALES = 'Usuario o contraseña incorrectos.';
// El fallo de red sí se separa, porque no dice nada sobre la cuenta.
const ERROR_RED = 'No se ha podido conectar. Inténtalo de nuevo en unos minutos.';

// Panel común a todos los estados. Superficie con filete dorado de 1px, radio
// de 4px, sin sombras ni brillos. A 360px ocupa el ancho disponible.
function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-md rounded-sm border border-fasor-gold/40 bg-fasor-surface p-6 sm:p-8">
      <img
        src={fasorLogo}
        alt=""
        width={48}
        height={48}
        className="mb-5 h-12 w-12 rounded-full border border-fasor-gold/40 object-cover"
      />
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
    <Panel>
      <Rotulo titulo="Enlace" />
      <p className="mt-6 font-mono text-xs tracking-widest text-fasor-gold" role="status">
        COMPROBANDO ACCESO
      </p>
    </Panel>
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
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-fasor-gold" aria-hidden="true" />
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
    <Panel>
      <Rotulo titulo="Enlace" />
      <p className="mt-6 flex items-start gap-2 text-sm leading-relaxed text-fasor-bone">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-fasor-gold" aria-hidden="true" />
        {mensaje}
      </p>
      <BotonSalir />
    </Panel>
  );
}

// Pantalla interior, provisional en esta fase. Saluda al miembro con su rango y
// su unidad, y avisa de que el buzón todavía no está en servicio.
function Interior({
  nombre,
  rango,
  unidad,
}: {
  nombre: string;
  rango: string;
  unidad: string | null;
}) {
  return (
    <Panel>
      <Rotulo titulo={nombre}>
        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-fasor-gold">{rango}</p>
        {unidad && <p className="mt-1 text-sm text-fasor-sage">{unidad}</p>}
      </Rotulo>

      <p className="mt-6 text-sm leading-relaxed text-fasor-sage">
        El buzón interno está en preparación. Cuando entre en servicio verás aquí las comunicaciones
        oficiales de la entidad.
      </p>

      <BotonSalir />
    </Panel>
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

  return (
    <Interior
      nombre={perfil.nombre}
      rango={ETIQUETA_RANGO[perfil.rango] ?? perfil.rango}
      unidad={perfil.unidad ? etiquetaUnidad(perfil.unidad) : null}
    />
  );
}

export default function Enlace() {
  return (
    <div className="content-container flex min-h-[70vh] items-center justify-center py-14 md:py-20">
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
