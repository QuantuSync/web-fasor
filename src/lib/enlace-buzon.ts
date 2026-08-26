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
  'id, remitente, destinatario, asunto, cuerpo, creado_en, leido_en, archivado_remitente, archivado_destinatario, responde_a, hilo';

const CAMPOS_AVISO = 'id, mando, remitente, destinatario, creado_en, leido_en, archivado';

const CAMPOS_DIRECTORIO = 'id, nombre, rango, unidad, activo';

// ---------------------------------------------------------------------------
// Cadena de mando (copia informativa de la que aplica el servidor)
// ---------------------------------------------------------------------------

/** Posición en el escalafón. El comandante es el 1. */
const NIVEL_RANGO: Record<Rango, number> = {
  comandante: 1,
  capitan: 2,
  teniente: 3,
  operador: 4,
  cadete: 5,
};

/** Superior inmediato de cada rango. El comandante no tiene. */
const SUPERIOR_INMEDIATO: Record<Rango, Rango | null> = {
  comandante: null,
  capitan: 'comandante',
  teniente: 'capitan',
  operador: 'teniente',
  cadete: 'teniente',
};

/**
 * ¿Escribir a ese rango se salta la cadena de mando?
 *
 * Hay salto cuando el destinatario está estrictamente por encima del superior
 * inmediato del remitente. Un cadete que escribe a su teniente no salta; si
 * escribe al capitán, sí. Sirve solo para avisar al remitente antes de enviar,
 * nunca para impedir el envío, que no se bloquea nunca por esto.
 */
export function haySaltoDeCadena(rangoRemitente: Rango, rangoDestinatario: Rango): boolean {
  const superior = SUPERIOR_INMEDIATO[rangoRemitente];
  if (!superior) return false;
  return NIVEL_RANGO[rangoDestinatario] < NIVEL_RANGO[superior];
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
 * que sean solo los tuyos ya lo garantiza la política de lectura.
 */
export async function listarRecibidos(idPropio: string): Promise<Mensaje[]> {
  const { data, error } = await getSupabase()
    .from('mensajes')
    .select(CAMPOS_MENSAJE)
    .eq('destinatario', idPropio)
    .order('creado_en', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Mensaje[];
}

/** Enviados. */
export async function listarEnviados(idPropio: string): Promise<Mensaje[]> {
  const { data, error } = await getSupabase()
    .from('mensajes')
    .select(CAMPOS_MENSAJE)
    .eq('remitente', idPropio)
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
 */
export async function listarHilo(hilo: string): Promise<Mensaje[]> {
  const { data, error } = await getSupabase()
    .from('mensajes')
    .select(CAMPOS_MENSAJE)
    .eq('hilo', hilo)
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
