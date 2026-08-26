// ============================================================================
// FASOR, zona interna. Piezas comunes a las funciones Edge.
//
// Regla que gobierna todo este módulo: nada de lo que llega en el cuerpo de la
// petición decide permisos. El rango, la unidad y el id de quien llama se
// recalculan siempre desde su JWT contra la base de datos.
//
// Cada función monta dos clientes:
//   - clienteDelLlamante(), con el JWT de quien llama, para todo lo que toque
//     la tabla `perfiles`. Así RLS evalúa la jerarquía con la identidad real.
//   - clienteDeServicio(), con la clave de servicio, solo para las dos cosas
//     que la exigen: crear la cuenta y cambiar una contraseña.
// ============================================================================

import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

export type Rango = 'comandante' | 'capitan' | 'teniente' | 'operador' | 'cadete';

export type Unidad =
  'buceadores' | 'drones' | 'forestal' | 'terrestres' | 'sanitario' | 'comunicaciones';

export const RANGOS: Rango[] = ['comandante', 'capitan', 'teniente', 'operador', 'cadete'];

export const UNIDADES: Unidad[] = [
  'buceadores',
  'drones',
  'forestal',
  'terrestres',
  'sanitario',
  'comunicaciones',
];

export interface Perfil {
  id: string;
  nombre: string;
  rango: Rango;
  unidad: Unidad | null;
  activo: boolean;
}

// Dominio que se añade a los identificadores internos. No recibe correo.
export const DOMINIO_INTERNO = '@fasor.local';

const CABECERAS_CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/** Respuesta JSON con CORS. El navegador hace preflight, así que hacen falta. */
export function responder(cuerpo: unknown, estado = 200): Response {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { ...CABECERAS_CORS, 'Content-Type': 'application/json' },
  });
}

/** Respuesta al preflight OPTIONS. */
export function responderPreflight(): Response {
  return new Response('ok', { headers: CABECERAS_CORS });
}

/** Error con mensaje ya redactado en español, listo para enseñar. */
export function fallo(mensaje: string, estado = 400): Response {
  return responder({ error: mensaje }, estado);
}

// Error de programación, no de uso: si falta una variable, la función no puede
// trabajar y conviene que se note en el despliegue, no a mitad de una petición.
function variable(...nombres: string[]): string {
  for (const nombre of nombres) {
    const valor = Deno.env.get(nombre);
    if (valor) return valor;
  }
  throw new Error(`Falta la variable de entorno ${nombres.join(' o ')} en la función Edge.`);
}

/**
 * Cliente que actúa como quien llama. Todas las lecturas y escrituras sobre
 * `perfiles` pasan por aquí, para que RLS aplique la jerarquía con la identidad
 * real en lugar de fiarse de lo que diga el cuerpo de la petición.
 */
export function clienteDelLlamante(req: Request): SupabaseClient {
  const autorizacion = req.headers.get('Authorization') ?? '';
  return createClient(
    variable('SUPABASE_URL'),
    variable('SUPABASE_ANON_KEY', 'SUPABASE_PUBLISHABLE_KEY'),
    {
      global: { headers: { Authorization: autorizacion } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}

/**
 * Cliente con la clave de servicio. Se salta RLS, así que se usa solo para
 * crear cuentas y cambiar contraseñas, nunca para decidir permisos.
 * La clave la inyecta Supabase; el respaldo cubre los proyectos con el sistema
 * nuevo de claves, donde el secreto se define a mano.
 */
export function clienteDeServicio(): SupabaseClient {
  return createClient(
    variable('SUPABASE_URL'),
    variable('SUPABASE_SERVICE_ROLE_KEY', 'FASOR_SERVICE_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

/**
 * Perfil de quien llama, recalculado desde su JWT. Devuelve null si el token no
 * vale, si no tiene perfil o si está de baja. Cualquiera de los tres casos
 * significa lo mismo de cara al permiso: no puede gestionar nada.
 */
export async function perfilDelLlamante(cliente: SupabaseClient): Promise<Perfil | null> {
  const { data: sesion, error: errorSesion } = await cliente.auth.getUser();
  if (errorSesion || !sesion?.user) return null;

  const { data, error } = await cliente
    .from('perfiles')
    .select('id, nombre, rango, unidad, activo')
    .eq('id', sesion.user.id)
    .maybeSingle();

  if (error || !data || !data.activo) return null;
  return data as Perfil;
}

/**
 * La jerarquía, en los mismos términos que la función SQL `puede_gestionar`.
 * Se repite aquí a propósito: la base de datos es la que autoriza de verdad,
 * y esta copia sirve para rechazar antes y con un mensaje claro en lugar de
 * dejar que la operación reviente contra una política.
 */
export function puedeGestionar(
  gestor: Perfil,
  objetivo: { rango: Rango; unidad: Unidad | null }
): boolean {
  if (gestor.rango === 'comandante') return true;
  if (gestor.rango === 'capitan') {
    return (
      ['teniente', 'operador', 'cadete'].includes(objetivo.rango) &&
      objetivo.unidad !== null &&
      objetivo.unidad === gestor.unidad
    );
  }
  return false;
}

/**
 * Normaliza el identificador de acceso. Los miembros no usan correos reales:
 * si el valor no lleva arroba se le añade el dominio interno.
 */
export function normalizarUsuario(usuario: string): string {
  const limpio = usuario.trim().toLowerCase();
  return limpio.includes('@') ? limpio : `${limpio}${DOMINIO_INTERNO}`;
}

/** Comprobación de forma del identificador ya normalizado. */
export function usuarioValido(usuario: string): boolean {
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(usuario);
}
