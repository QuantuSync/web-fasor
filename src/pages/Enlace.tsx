import { useEffect, useState, type FormEvent } from 'react';
import { ClientOnly } from 'vite-react-ssg';
import { LogIn, ShieldAlert } from 'lucide-react';
import { RankDivisa } from '../components/RankInsignia';
import SesionProvider from '../context/SesionContext';
import { useSesion } from '../context/useSesion';
import Buzon from '../components/enlace/Buzon';
import CambiarContrasena from '../components/enlace/CambiarContrasena';
import GestionMiembros from '../components/enlace/GestionMiembros';
import GestionAspirantes from '../components/enlace/GestionAspirantes';
import PantallaAspirante from '../components/enlace/PantallaAspirante';
import ComunicadoExamen from '../components/enlace/ComunicadoExamen';
import ExamenesPendientes from '../components/enlace/ExamenesPendientes';
import { ALTO_CABECERA, Columna, Panel, Rotulo, BotonSalir } from '../components/enlace/Marco';
import { escalafon } from '../data/escalafon';
import { getSupabase } from '../lib/supabase';
import { ETIQUETA_RANGO, emblemaUnidad, etiquetaUnidad, type Perfil } from '../lib/enlace-types';
import {
  puedeGestionarMiembros,
  puedeGestionarAspirantes,
  puedeRevisarExamenes,
} from '../lib/enlace-gestion';
import { cargarMiExamen, marcarExamenVisto, type Examen } from '../lib/enlace-examen';

/*
 * Zona interna de FASOR (/enlace). Acceso, buzón y gestión de miembros.
 *
 * Es la única ruta del sitio que se renderiza en cliente. Todo lo que depende
 * de la sesión vive dentro de <ClientOnly>, así que el HTML pre-renderizado de
 * esta ruta contiene la maqueta y el panel de espera, nada más. El resto del
 * sitio sigue siendo SSG intacto.
 *
 * Dentro conviven el buzón interno de mensajes y, para comandante y capitán,
 * la gestión de miembros.
 */

// Un único mensaje para cualquier fallo de credenciales. No se distingue si la
// cuenta existe, para no filtrar quién es miembro de la entidad.
const ERROR_CREDENCIALES = 'Usuario o contraseña incorrectos.';
// El fallo de red sí se separa, porque no dice nada sobre la cuenta.
const ERROR_RED = 'No se ha podido conectar. Inténtalo de nuevo en unos minutos.';

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

// Pantalla interior. Saluda al miembro con su rango y su unidad, y debajo monta
// el buzón (todos) y la gestión de miembros (solo comandante y capitán).
function Interior({ perfil }: { perfil: Perfil }) {
  /*
   * Comunicado del examen de ingreso pendiente de ver, para quien acaba de
   * ascender a Cadete al ser declarado apto. Se comprueba para cualquier
   * rango que no sea aspirante (que tiene su propio banner en
   * `PantallaAspirante`), aunque en la práctica solo va a haber algo que
   * mostrar justo después de una promoción. Los hooks van antes que el
   * `return` condicional de más abajo, nunca después, para no romper las
   * reglas de los hooks si algún día `perfil.rango` cambiara entre renders.
   */
  const [examenReciente, setExamenReciente] = useState<Examen | null>(null);

  useEffect(() => {
    if (perfil.rango === 'aspirante') return;
    let vigente = true;
    void cargarMiExamen(perfil.id).then((examen) => {
      if (vigente) setExamenReciente(examen);
    });
    return () => {
      vigente = false;
    };
  }, [perfil.id, perfil.rango]);

  /*
   * Un aspirante está fuera de todo lo operativo, así que su pantalla no es
   * una variación de la de un miembro, es otra cosa por completo, sin rango,
   * sin unidad, sin Buzón y sin Gestión. `PantallaAspirante` la sustituye
   * entera.
   */
  if (perfil.rango === 'aspirante') {
    return <PantallaAspirante perfil={perfil} />;
  }

  const bannerExamen =
    examenReciente?.estado === 'corregido' && !examenReciente.visto_por_aspirante_en
      ? examenReciente
      : null;

  const rango = ETIQUETA_RANGO[perfil.rango] ?? perfil.rango;
  const unidad = perfil.unidad ? etiquetaUnidad(perfil.unidad) : null;
  const emblema = perfil.unidad ? emblemaUnidad(perfil.unidad) : null;
  /*
   * Búsqueda tolerante en lugar de `rangoPorId`, que lanza: el rango llega de
   * la base de datos, y si un día no cuadrara con el escalafón la pantalla se
   * queda sin distintivo, no rota. El rango sigue leyéndose en texto.
   *
   * Y hay un caso en que la ausencia es DELIBERADA y no un accidente: los
   * cargos de Junta Directiva (secretario y tesorero) no están en el escalafón
   * y NO llevan distintivo, porque no son un rango militar. Donde los demás
   * muestran su divisa, ellos no muestran nada, y tampoco se les reserva hueco
   * (el `distintivo` del Panel queda sin pasar y la fila se queda con el sello
   * solo). No se les invente una insignia ni se les dé un sitio en
   * `escalafon.ts`, que es el escalafón operativo.
   */
  const divisa = escalafon.find((r) => r.id === perfil.rango)?.insignia ?? null;
  // La sección de gestión solo se monta para el comandante, el capitán y los
  // cargos de Junta: los demás ni la ven ni piden la lista de miembros.
  const gestiona = puedeGestionarMiembros(perfil);
  // La de aspirantes es más estrecha, solo comandante, secretario y tesorero.
  const gestionaAspirantes = puedeGestionarAspirantes(perfil);
  // La revisión de exámenes es la cadena operativa, no la Junta Directiva.
  const revisaExamenes = puedeRevisarExamenes(perfil);

  return (
    // Siempre ancha: el buzón lo tienen todos los miembros, no solo los mandos.
    <Columna ancho="max-w-2xl">
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
        <Rotulo
          titulo={perfil.nombre}
          derecha={
            <p className="ml-auto shrink-0 text-right font-mono text-xs uppercase tracking-widest text-fasor-gold">
              {rango}
            </p>
          }
        >
          {/* La unidad va centrada en el ancho del panel y en negrita, con su
              emblema al lado. Si el miembro no tiene unidad no se pinta nada,
              ni emblema, ni hueco, ni texto alternativo. */}
          {unidad && (
            <p className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center text-sm font-semibold text-fasor-bone">
              {emblema && (
                <img
                  src={emblema}
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                  className="h-6 w-6 shrink-0 rounded-full border border-fasor-gold/40 object-cover"
                />
              )}
              <span className="break-words">{unidad}</span>
            </p>
          )}
        </Rotulo>

        <p className="mt-6 text-sm leading-relaxed text-fasor-sage">
          Esta es la vía oficial de comunicación de la entidad. Debajo tienes tu buzón interno.
        </p>

        {bannerExamen && (
          <ComunicadoExamen
            examen={bannerExamen}
            onVisto={() => void marcarExamenVisto(bannerExamen.id).then(setExamenReciente)}
          />
        )}

        <CambiarContrasena />
        <BotonSalir />
      </Panel>
      <Buzon perfil={perfil} />
      {gestiona && <GestionMiembros gestor={perfil} />}
      {gestionaAspirantes && <GestionAspirantes gestor={perfil} />}
      {revisaExamenes && <ExamenesPendientes gestor={perfil} />}
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
