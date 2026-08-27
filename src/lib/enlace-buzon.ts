import { getSupabase } from './supabase';
import type { AvisoCadena, Mensaje, MiembroDirectorio, Rango } from './enlace-types';

/*
 * Buzón interno de la zona interna (/enlace).
 *
 * MISMO AVISO QUE EN `enlace-gestion.ts`: nada de lo que hay aquí autoriza. Las
 * reglas de verdad viven en la base de datos (políticas RLS y triggers sobre
 * `mensajes` y `avisos_cadena`). Si alguien se salta este archivo desde la
 * consola del navegador, se topa igual con la política. Lo de aquí solo sirve
 * para pedir lo que corresponde y para no ofrecer acciones que van a rebotar.
 *
 * En particular, el aviso de salto de cadena de mando NO se genera aquí: lo
 * genera un trigger en la base de datos, precisamente para que un remitente no
 * pueda evitarlo tocando el cliente. La copia de la jerarquía que hay más abajo
 * solo sirve para avisar al remitente, antes de enviar, de que su mando quedará
 * informado.
 */

const CAMPOS_MENSAJE =
  'id, remitente, destinatario, asunto, cuerpo, creado_en, leido_en, archivado_remitente, archivado_destinatario, eliminado_remitente, eliminado_destinatario, responde_a, hilo';

const CAMPOS_AVISO = 'id, mando, remitente, destinatario, creado_en, leido_en, archivado';

const CAMPOS_DIRECTORIO = 'id, nombre, rango, unidad, activo';

// ---------------------------------------------------------------------------
// Cadena de mando (copia informativa de la que aplica el servidor)
// ---------------------------------------------------------------------------

/**
 * Posición en el escalafón. El comandante es el 1.
 *
 * Los cargos de Junta Directiva valen null, igual que en `nivel_rango()` de la
 * base de datos: están fuera del escalafón, no son superiores ni inferiores de
 * nadie, y darles un número los haría comparables, que es justo lo que no son.
 */
const NIVEL_RANGO: Record<Rango, number | null> = {
  comandante: 1,
  capitan: 2,
  teniente: 3,
  operador: 4,
  cadete: 5,
  secretario: null,
  tesorero: null,
};

/** Superior inmediato de cada rango. Ni el comandante ni los cargos de Junta tienen. */
const SUPERIOR_INMEDIATO: Record<Rango, Rango | null> = {
  comandante: null,
  capitan: 'comandante',
  teniente: 'capitan',
  operador: 'teniente',
  cadete: 'teniente',
  secretario: null,
  tesorero: null,
};

/**
 * ¿Escribir a ese rango se salta la cadena de mando?
 *
 * Hay salto cuando el destinatario está estrictamente por encima del superior
 * inmediato del remitente. Un cadete que escribe a su teniente no salta; si
 * escribe al capitán, sí. Sirve solo para avisar al remitente antes de enviar,
 * nunca para impedir el envío, que no se bloquea nunca por esto.
 *
 * Quien está fuera del escalafón queda fuera de la cadena por los dos lados, y
 * el null hay que comprobarlo A MANO, antes de comparar: en JavaScript
 * `null < 3` es true, así que escribir a un secretario habría salido como salto
 * de cadena. Es la misma trampa que en SQL, donde la comparación con NULL no
 * vale falso sino NULL, solo que aquí falla al revés, en abierto y en silencio.
 */
export function haySaltoDeCadena(rangoRemitente: Rango, rangoDestinatario: Rango): boolean {
  const nivelDestinatario = NIVEL_RANGO[rangoDestinatario];
  if (NIVEL_RANGO[rangoRemitente] === null || nivelDestinatario === null) return false;

  const superior = SUPERIOR_INMEDIATO[rangoRemitente];
  if (!superior) return false;

  const nivelSuperior = NIVEL_RANGO[superior];
  if (nivelSuperior === null) return false;

  return nivelDestinatario < nivelSuperior;
}

/** Rango que recibirá el aviso, para poder nombrarlo en el texto de cortesía. */
export function rangoQueRecibeElAviso(rangoRemitente: Rango): Rango | null {
  return SUPERIOR_INMEDIATO[rangoRemitente];
}

// ---------------------------------------------------------------------------
// Fechas
// ---------------------------------------------------------------------------

/*
 * Fecha y hora en una sola línea, con la hora separada por punto y no por dos
 * puntos, para no dejar dos puntos en un texto visible del sitio. La RAE admite
 * las dos formas.
 */
export function formatoFechaHora(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(fecha)
    .replace(':', '.');
}

// ---------------------------------------------------------------------------
// Lecturas
// ---------------------------------------------------------------------------

/**
 * Miembros de la entidad, para poner nombre a remitentes y destinatarios y para
 * el buscador de la redacción. Sale de la vista `directorio`, no de `perfiles`:
 * la política de esa tabla es estrecha a propósito y no se toca.
 */
export async function cargarDirectorio(): Promise<MiembroDirectorio[]> {
  const { data, error } = await getSupabase()
    .from('directorio')
    .select(CAMPOS_DIRECTORIO)
    .order('nombre', { ascending: true });

  if (error) throw error;
  return (data ?? []) as MiembroDirectorio[];
}

/**
 * Bandeja de entrada. El filtro por destinatario separa recibidos de enviados;
 * que sean solo los tuyos ya lo garantiza la política de lectura. Lo eliminado
 * por este lado no vuelve a aparecer, aunque el remitente lo conserve.
 */
export async function listarRecibidos(idPropio: string): Promise<Mensaje[]> {
  const { data, error } = await getSupabase()
    .from('mensajes')
    .select(CAMPOS_MENSAJE)
    .eq('destinatario', idPropio)
    .eq('eliminado_destinatario', false)
    .order('creado_en', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Mensaje[];
}

/** Enviados, sin lo que uno haya eliminado por su lado. */
export async function listarEnviados(idPropio: string): Promise<Mensaje[]> {
  const { data, error } = await getSupabase()
    .from('mensajes')
    .select(CAMPOS_MENSAJE)
    .eq('remitente', idPropio)
    .eq('eliminado_remitente', false)
    .order('creado_en', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Mensaje[];
}

/** Avisos de cadena de mando recibidos. Solo llegan a quien es el mando. */
export async function listarAvisos(idPropio: string): Promise<AvisoCadena[]> {
  const { data, error } = await getSupabase()
    .from('avisos_cadena')
    .select(CAMPOS_AVISO)
    .eq('mando', idPropio)
    .order('creado_en', { ascending: false });

  if (error) throw error;
  return (data ?? []) as AvisoCadena[];
}

/**
 * Conversación completa, de la más antigua a la más reciente. Devuelve solo los
 * mensajes del hilo en los que uno participa, porque el recorte lo hace la
 * política de lectura y no este filtro.
 *
 * El `or` sí hace falta aquí: lo que uno eliminó no debe reaparecer por la
 * puerta de atrás del hilo, y cada lado tiene su propia columna, así que hay
 * que mirar la que corresponde según se sea remitente o destinatario.
 */
export async function listarHilo(hilo: string, idPropio: string): Promise<Mensaje[]> {
  const { data, error } = await getSupabase()
    .from('mensajes')
    .select(CAMPOS_MENSAJE)
    .eq('hilo', hilo)
    .or(
      `and(remitente.eq.${idPropio},eliminado_remitente.is.false),` +
        `and(destinatario.eq.${idPropio},eliminado_destinatario.is.false)`
    )
    .order('creado_en', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Mensaje[];
}

// ---------------------------------------------------------------------------
// Escrituras
// ---------------------------------------------------------------------------

/**
 * Envía un mensaje. No se manda `hilo` ni `leido_en` ni los archivados: los
 * calcula el servidor, y lo que llegara del navegador se descartaría.
 */
export async function enviarMensaje(datos: {
  remitente: string;
  destinatario: string;
  asunto: string;
  cuerpo: string;
  respondeA?: string | null;
}): Promise<Mensaje> {
  const { data, error } = await getSupabase()
    .from('mensajes')
    .insert({
      remitente: datos.remitente,
      destinatario: datos.destinatario,
      asunto: datos.asunto.trim(),
      cuerpo: datos.cuerpo.trim(),
      responde_a: datos.respondeA ?? null,
    })
    .select(CAMPOS_MENSAJE)
    .single();

  if (error) throw error;
  return data as Mensaje;
}

/** Marca leído al abrir. Solo puede hacerlo el destinatario. */
export async function marcarMensajeLeido(id: string): Promise<Mensaje> {
  const { data, error } = await getSupabase()
    .from('mensajes')
    .update({ leido_en: new Date().toISOString() })
    .eq('id', id)
    .select(CAMPOS_MENSAJE)
    .single();

  if (error) throw error;
  return data as Mensaje;
}

/**
 * Archiva o desarchiva. Cada parte archiva su propia copia, el destinatario en
 * la bandeja y el remitente en enviados, sin afectar a la del otro.
 */
export async function archivarMensaje(
  id: string,
  lado: 'recibido' | 'enviado',
  archivado: boolean
): Promise<Mensaje> {
  const campo = lado === 'recibido' ? 'archivado_destinatario' : 'archivado_remitente';

  const { data, error } = await getSupabase()
    .from('mensajes')
    .update({ [campo]: archivado })
    .eq('id', id)
    .select(CAMPOS_MENSAJE)
    .single();

  if (error) throw error;
  return data as Mensaje;
}

/**
 * Elimina un mensaje de la vista propia, para siempre.
 *
 * No borra la fila: pone la columna del lado que elimina, y la otra parte
 * conserva su copia. Cuando las dos partes lo han eliminado, la fila la borra
 * el servidor. Que cada uno solo pueda tocar su lado lo comprueba el trigger de
 * protecciones, no esta función.
 *
 * A diferencia del resto de escrituras, esta no pide la fila de vuelta: si
 * resulta ser la segunda eliminación, la fila deja de existir en ese mismo
 * momento y no habría nada que devolver.
 */
export async function eliminarMensaje(id: string, lado: 'recibido' | 'enviado'): Promise<void> {
  const campo = lado === 'recibido' ? 'eliminado_destinatario' : 'eliminado_remitente';

  const { error } = await getSupabase()
    .from('mensajes')
    .update({ [campo]: true })
    .eq('id', id);

  if (error) throw error;
}

/**
 * Elimina un aviso, para siempre. Aquí sí se borra la fila, porque un aviso
 * solo lo ve su mando y en cuanto lo elimina no queda nadie que pueda verlo.
 * Que sea el suyo lo comprueba la política de borrado.
 */
export async function eliminarAviso(id: string): Promise<void> {
  const { error } = await getSupabase().from('avisos_cadena').delete().eq('id', id);

  if (error) throw error;
}

/** Marca leído un aviso. No hay nada que abrir, así que se marca desde la lista. */
export async function marcarAvisoLeido(id: string): Promise<AvisoCadena> {
  const { data, error } = await getSupabase()
    .from('avisos_cadena')
    .update({ leido_en: new Date().toISOString() })
    .eq('id', id)
    .select(CAMPOS_AVISO)
    .single();

  if (error) throw error;
  return data as AvisoCadena;
}

/** Archiva o desarchiva un aviso. */
export async function archivarAviso(id: string, archivado: boolean): Promise<AvisoCadena> {
  const { data, error } = await getSupabase()
    .from('avisos_cadena')
    .update({ archivado })
    .eq('id', id)
    .select(CAMPOS_AVISO)
    .single();

  if (error) throw error;
  return data as AvisoCadena;
}
