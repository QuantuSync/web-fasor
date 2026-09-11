import { getSupabase } from './supabase';
import {
  DOMINIO_INTERNO,
  esCargoJunta,
  type Perfil,
  type Rango,
  type Unidad,
} from './enlace-types';

/*
 * Gestión de miembros de la zona interna.
 *
 * AVISO IMPORTANTE sobre `puedeGestionar` y compañía: lo que hay aquí sirve
 * para OCULTAR lo que no procede, nunca para autorizar. La autorización real
 * vive en la base de datos (políticas RLS y trigger sobre `perfiles`) y en las
 * funciones Edge, que recalculan el perfil de quien llama desde su JWT. Si
 * alguien salta este archivo desde la consola del navegador, se topa igual con
 * la política. Esta copia solo evita enseñar botones que van a fallar.
 */

/** Rangos que un capitán puede asignar. Nunca capitán ni comandante. */
const RANGOS_DE_CAPITAN: Rango[] = ['teniente', 'operador', 'cadete'];

/*
 * Los tres cargos que SOLO otorga el comandante. Un secretario o un tesorero no
 * pueden crear ni ascender a ninguno de ellos, y de ahí se sigue que tampoco se
 * nombran entre ellos ni a sí mismos. Sin esta lista tendrían una vía indirecta
 * para saltarse la otra excepción, que es no poder tocar a un comandante.
 */
const SOLO_LOS_DA_EL_COMANDANTE: Rango[] = ['comandante', 'secretario', 'tesorero'];

/** Rangos que un cargo de Junta puede asignar, o sea todos menos esos tres. */
const RANGOS_DE_JUNTA: Rango[] = ['capitan', 'teniente', 'operador', 'cadete'];

/*
 * El escalafón primero y los cargos de Junta después, porque están fuera de él.
 * El orden es solo de presentación en el desplegable, no una jerarquía.
 */
const TODOS_LOS_RANGOS: Rango[] = [
  'comandante',
  'capitan',
  'teniente',
  'operador',
  'cadete',
  'secretario',
  'tesorero',
];

/**
 * Rango con el que arranca el formulario de alta. Explícito y no «el último de
 * la lista»: con los cargos de Junta al final, esa cuenta daría «Tesorero» por
 * defecto, y lo prudente al dar de alta a alguien es empezar por abajo.
 */
const RANGO_POR_DEFECTO: Rango = 'cadete';

/** Misma regla que `puede_gestionar()` en SQL y en las funciones Edge. */
export function puedeGestionar(
  gestor: Perfil,
  objetivo: { rango: Rango; unidad: Unidad | null }
): boolean {
  if (gestor.rango === 'comandante') return true;
  if (gestor.rango === 'capitan') {
    return (
      RANGOS_DE_CAPITAN.includes(objetivo.rango) &&
      objetivo.unidad !== null &&
      objetivo.unidad === gestor.unidad
    );
  }
  // Secretario y tesorero, cualquier miembro de cualquier unidad salvo los tres
  // cargos de arriba. Al comandante no lo tocan de ninguna forma.
  if (esCargoJunta(gestor.rango)) {
    return !SOLO_LOS_DA_EL_COMANDANTE.includes(objetivo.rango);
  }
  return false;
}

/** Si no puede gestionar a nadie, la sección de gestión ni se monta. */
export function puedeGestionarMiembros(perfil: Perfil): boolean {
  return perfil.rango === 'comandante' || perfil.rango === 'capitan' || esCargoJunta(perfil.rango);
}

/**
 * Quién puede eliminar de verdad a quién. Más estrecho que `puedeGestionar`,
 * misma copia exacta que `puedeEliminar` del módulo Edge compartido (ver
 * `supabase/functions/_compartido/autorizacion.ts`): solo comandante,
 * secretario y tesorero, nunca capitán, y nadie se elimina a sí mismo. Solo
 * oculta el botón; la autorización de verdad la aplica la función Edge.
 */
export function puedeEliminar(
  gestor: Perfil,
  objetivo: { id: string; rango: Rango; unidad: Unidad | null }
): boolean {
  if (objetivo.id === gestor.id) return false;
  if (gestor.rango !== 'comandante' && !esCargoJunta(gestor.rango)) return false;
  return puedeGestionar(gestor, objetivo);
}

/*
 * Gestión de aspirantes, apartado propio y separado del listado general de
 * miembros. Solo comandante, secretario y tesorero lo ven: son los únicos que
 * pueden dar de alta a un aspirante (ver `puede_gestionar()` en
 * `06_aspirante.sql`, que ya lo permite sin cambios porque `aspirante` no es
 * uno de los rangos reservados al comandante). Teniente y capitán sí pueden
 * LEER la ficha de un aspirante (para revisar su examen), pero no gestionarla,
 * así que no ven esta sección aunque la fila les sea visible.
 */
export function puedeGestionarAspirantes(perfil: Perfil): boolean {
  return perfil.rango === 'comandante' || esCargoJunta(perfil.rango);
}

/*
 * Revisión de exámenes de ingreso. Teniente, capitán y comandante, nunca
 * secretario ni tesorero: la normativa interna reserva la corrección a la
 * cadena operativa, no al órgano de gobierno. La política de lectura de
 * `examenes` en `07_examen_ingreso.sql` es la que autoriza de verdad; esto
 * solo decide si se monta la sección.
 */
export function puedeRevisarExamenes(perfil: Perfil): boolean {
  return perfil.rango === 'teniente' || perfil.rango === 'capitan' || perfil.rango === 'comandante';
}

/** ¿Este gestor ve a toda la entidad o solo a su unidad? */
export function veTodaLaEntidad(gestor: Perfil): boolean {
  return gestor.rango !== 'capitan';
}

/** Rangos que este gestor puede poner en el formulario. */
export function rangosAsignables(gestor: Perfil): Rango[] {
  if (gestor.rango === 'comandante') return TODOS_LOS_RANGOS;
  if (gestor.rango === 'capitan') return RANGOS_DE_CAPITAN;
  if (esCargoJunta(gestor.rango)) return RANGOS_DE_JUNTA;
  return [];
}

/** Rango con el que se abre el formulario de alta, siempre dentro de lo asignable. */
export function rangoInicial(gestor: Perfil): Rango {
  const rangos = rangosAsignables(gestor);
  return rangos.includes(RANGO_POR_DEFECTO) ? RANGO_POR_DEFECTO : rangos[rangos.length - 1];
}

/**
 * Unidades que este gestor puede poner. El capitán solo la suya, y encima le
 * es obligatoria, porque un miembro sin unidad no sería gestionable por él.
 * Los cargos de Junta gestionan a toda la entidad, así que las ponen todas.
 */
export function unidadesAsignables(gestor: Perfil): Unidad[] | 'todas' {
  if (gestor.rango === 'comandante') return 'todas';
  if (esCargoJunta(gestor.rango)) return 'todas';
  if (gestor.rango === 'capitan' && gestor.unidad) return [gestor.unidad];
  return [];
}

/** Un capitán no puede dejar la unidad en blanco; el comandante sí. */
export function unidadObligatoria(gestor: Perfil): boolean {
  return gestor.rango === 'capitan';
}

/**
 * Identificador de acceso tal y como se va a guardar. Los miembros no usan
 * correos reales, así que sin arroba se le añade el dominio interno. Se enseña
 * al gestor antes de confirmar el alta.
 */
export function usuarioFinal(usuario: string): string {
  const limpio = usuario.trim().toLowerCase();
  if (!limpio) return '';
  return limpio.includes('@') ? limpio : `${limpio}${DOMINIO_INTERNO}`;
}

// ---------------------------------------------------------------------------
// Traducción de errores
// ---------------------------------------------------------------------------

const CODIGOS: Record<string, string> = {
  '42501': 'No tienes permiso para hacer eso.',
  '23505': 'Ese miembro ya existe.',
  '23503': 'Ese miembro no existe.',
  '23514': 'Alguno de los datos no es válido.',
};

/**
 * Mensaje en español para lo que devuelva Supabase.
 *
 * Los `raise exception` del trigger llegan con código P0001 y con el texto ya
 * redactado en español («No puedes cambiar tu propio rango», «No puedes dejar a
 * la entidad sin ningún comandante activo»). Se dejan pasar tal cual, porque
 * son exactamente lo que hay que enseñar, y así una regla nueva en el trigger
 * no necesita tocar este archivo para que se lea bien.
 */
export function mensajeDeError(error: unknown, porDefecto: string): string {
  if (!error) return porDefecto;

  const e = error as { code?: string; message?: string };
  const mensaje = e.message ?? '';

  // La restricción de la base de datos que impide dar unidad a un cargo de
  // Junta llega como un 23514 genérico, así que se reconoce por su nombre para
  // poder decir qué ha pasado en lugar de «alguno de los datos no es válido».
  if (/perfiles_cargo_junta_sin_unidad/.test(mensaje)) {
    return 'Los cargos de Junta Directiva no llevan unidad.';
  }

  if (e.code && CODIGOS[e.code]) return CODIGOS[e.code];

  if (e.code === 'P0001' && mensaje) return mensaje;
  if (/Failed to fetch|NetworkError|network/i.test(mensaje)) {
    return 'No se ha podido conectar. Inténtalo de nuevo en unos minutos.';
  }
  if (/row-level security|violates/i.test(mensaje)) return 'No tienes permiso para hacer eso.';

  return porDefecto;
}

// ---------------------------------------------------------------------------
// Operaciones
// ---------------------------------------------------------------------------

const CAMPOS = 'id, nombre, rango, unidad, activo';

/**
 * Lista de miembros. No lleva filtro de unidad a propósito: el recorte lo hace
 * la política de lectura, así que el comandante recibe a todos y el capitán
 * solo su unidad sin que el cliente tenga que pedirlo (ni pueda evitarlo).
 *
 * Excluye a los aspirantes, que tienen su propio apartado (`listarAspirantes`)
 * separado de este listado general, aunque para comandante, secretario o
 * tesorero la política de lectura también los alcanzaría.
 */
export async function listarMiembros(): Promise<Perfil[]> {
  const { data, error } = await getSupabase()
    .from('perfiles')
    .select(CAMPOS)
    .neq('rango', 'aspirante')
    .order('nombre', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Perfil[];
}

/**
 * Lista de aspirantes, para el apartado propio de Gestión de Aspirantes. La
 * política de lectura ya deja verlos a comandante, secretario y tesorero (y
 * también a teniente y capitán, para la revisión de exámenes), pero esta
 * función la usa solo la sección que de verdad los gestiona; `puede_gestionar`
 * en base de datos rechaza igual cualquier intento de un teniente o un
 * capitán de editarlos.
 */
export async function listarAspirantes(): Promise<Perfil[]> {
  const { data, error } = await getSupabase()
    .from('perfiles')
    .select(CAMPOS)
    .eq('rango', 'aspirante')
    .order('nombre', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Perfil[];
}

/** Edición de nombre, rango y unidad. RLS valida la fila vieja y la nueva. */
export async function editarMiembro(
  id: string,
  cambios: { nombre: string; rango: Rango; unidad: Unidad | null }
): Promise<Perfil> {
  const { data, error } = await getSupabase()
    .from('perfiles')
    .update(cambios)
    .eq('id', id)
    .select(CAMPOS)
    .single();

  if (error) throw error;
  return data as Perfil;
}

/**
 * Elimina de verdad la cuenta (cuenta, perfil, mensajes, avisos de cadena y
 * exámenes). Pasa por función Edge porque borrar exige la clave de servicio;
 * quién puede eliminar a quién se recalcula siempre en servidor a partir del
 * JWT (`puedeEliminar` en el módulo compartido), esto solo oculta el botón.
 */
export async function eliminarMiembro(id: string): Promise<void> {
  const { data, error } = await getSupabase().functions.invoke('eliminar-miembro', {
    body: { id },
  });

  const fallo = await mensajeDeFuncion(error, data, 'No se ha podido eliminar la cuenta.');
  if (fallo) throw new Error(fallo);
}

/** Alta completa (cuenta y perfil). Pasa por función Edge, ver supabase/. */
export async function crearMiembro(datos: {
  nombre: string;
  usuario: string;
  contrasena: string;
  rango: Rango;
  unidad: Unidad | null;
}): Promise<Perfil> {
  const { data, error } = await getSupabase().functions.invoke('crear-miembro', { body: datos });

  const fallo = await mensajeDeFuncion(error, data, 'No se ha podido dar de alta al miembro.');
  if (fallo) throw new Error(fallo);

  return (data as { perfil: Perfil }).perfil;
}

/** Restablecer la contraseña de un miembro. Pasa por función Edge. */
export async function restablecerContrasena(id: string, contrasena: string): Promise<void> {
  const { data, error } = await getSupabase().functions.invoke('restablecer-contrasena', {
    body: { id, contrasena },
  });

  const fallo = await mensajeDeFuncion(error, data, 'No se ha podido cambiar la contraseña.');
  if (fallo) throw new Error(fallo);
}

/*
 * Las funciones Edge devuelven su mensaje en el cuerpo, pero `functions.invoke`
 * solo entrega un FunctionsHttpError con la respuesta cruda cuando el estado no
 * es 2xx. Esto rescata el mensaje redactado en español en lugar de enseñar el
 * «Edge Function returned a non-2xx status code» de la librería.
 */
async function mensajeDeFuncion(
  error: unknown,
  data: unknown,
  porDefecto: string
): Promise<string | null> {
  if (error) {
    const respuesta = (error as { context?: Response }).context;
    if (respuesta && typeof respuesta.json === 'function') {
      try {
        const cuerpo = await respuesta.json();
        if (cuerpo?.error) return String(cuerpo.error);
      } catch {
        // El cuerpo no era JSON; se cae al mensaje genérico.
      }
    }
    return mensajeDeError(error, porDefecto);
  }

  const cuerpo = data as { error?: string } | null;
  if (cuerpo?.error) return cuerpo.error;

  return null;
}
