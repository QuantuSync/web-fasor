import { getSupabase } from './supabase';
import { DOMINIO_INTERNO, type Perfil, type Rango, type Unidad } from './enlace-types';

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

const TODOS_LOS_RANGOS: Rango[] = ['comandante', 'capitan', 'teniente', 'operador', 'cadete'];

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
  return false;
}

/** Si no puede gestionar a nadie, la sección de gestión ni se monta. */
export function puedeGestionarMiembros(perfil: Perfil): boolean {
  return perfil.rango === 'comandante' || perfil.rango === 'capitan';
}

/** Rangos que este gestor puede poner en el formulario. */
export function rangosAsignables(gestor: Perfil): Rango[] {
  if (gestor.rango === 'comandante') return TODOS_LOS_RANGOS;
  if (gestor.rango === 'capitan') return RANGOS_DE_CAPITAN;
  return [];
}

/**
 * Unidades que este gestor puede poner. El capitán solo la suya, y encima le
 * es obligatoria, porque un miembro sin unidad no sería gestionable por él.
 */
export function unidadesAsignables(gestor: Perfil): Unidad[] | 'todas' {
  if (gestor.rango === 'comandante') return 'todas';
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
 * Mensaje en español para lo que devuelva Supabase. Los errores del trigger
 * llegan como texto ya redactado («No puedes cambiar tu propio rango»), así que
 * esos se dejan pasar tal cual.
 */
export function mensajeDeError(error: unknown, porDefecto: string): string {
  if (!error) return porDefecto;

  const e = error as { code?: string; message?: string };
  if (e.code && CODIGOS[e.code]) return CODIGOS[e.code];

  const mensaje = e.message ?? '';
  if (/No puedes cambiar tu propi/i.test(mensaje)) return mensaje;
  if (/identificador de un perfil/i.test(mensaje)) return mensaje;
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
 */
export async function listarMiembros(): Promise<Perfil[]> {
  const { data, error } = await getSupabase()
    .from('perfiles')
    .select(CAMPOS)
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

/** Baja y reactivación. Nunca se borra la cuenta, solo cambia `activo`. */
export async function cambiarAlta(id: string, activo: boolean): Promise<Perfil> {
  const { data, error } = await getSupabase()
    .from('perfiles')
    .update({ activo })
    .eq('id', id)
    .select(CAMPOS)
    .single();

  if (error) throw error;
  return data as Perfil;
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
