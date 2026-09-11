import { getSupabase } from './supabase';
import type { UnidadId } from '../data/unidades';

/*
 * Examen de ingreso, zona interna (/enlace).
 *
 * MISMO AVISO QUE EN `enlace-gestion.ts` y `enlace-buzon.ts`: nada de lo que
 * hay aquí autoriza. La corrección automática, la elegibilidad para repetir,
 * el bloqueo de unidad y la resolución de la concurrencia entre dos mandos
 * viven en `07_examen_ingreso.sql` (triggers y políticas sobre `examenes`).
 * Esto solo pide lo que corresponde y traduce los errores.
 */

export type ResultadoExamen = 'apto' | 'no_apto_provisional' | 'no_apto_definitivo';

/** Fila de la tabla `examenes`, tal cual la devuelve Supabase. */
export interface Examen {
  id: string;
  aspirante_id: string;
  orden_preferencia: UnidadId[];
  /** Una por pregunta, en su posición fija; `null` es una pregunta sin responder. */
  respuestas: Array<number | null>;
  creado_en: string;
  estado: 'enviado' | 'corregido';
  puntuacion_automatica: number | null;
  resultado_automatico: ResultadoExamen | null;
  unidad_automatica: UnidadId | null;
  resultado_final: ResultadoExamen | null;
  unidad_final: UnidadId | null;
  ratificado_por: string | null;
  ratificado_en: string | null;
  corregido_manualmente: boolean;
  motivo_correccion: string | null;
  visto_por_aspirante_en: string | null;
}

/** Un examen pendiente de revisar, con el nombre de su aspirante. */
export interface ExamenConAspirante extends Examen {
  aspirante: { id: string; nombre: string } | null;
}

/**
 * Autorización del comandante para que un aspirante repita el examen pese a
 * su resultado anterior. Ligada a un examen concreto (`examen_id`), nunca al
 * aspirante en general, así que desbloquea exactamente un examen nuevo.
 */
export interface AutorizacionExamen {
  id: string;
  aspirante_id: string;
  examen_id: string;
  autorizado_por: string;
  autorizado_en: string;
  motivo: string;
  visto_por_aspirante_en: string | null;
}

/**
 * Cuántos exámenes lleva hechos un aspirante y cómo quedó el último, para que
 * quien decide autorizar una repetición lo sepa. Solo la calcula quien puede
 * leer todos los exámenes (comandante); `listarResumenExamenes` devuelve un
 * resumen vacío si no hay permiso, no lanza.
 */
export interface ResumenExamenAspirante {
  total: number;
  ultimoExamenId: string | null;
  ultimoEstado: 'enviado' | 'corregido' | null;
  ultimoResultado: ResultadoExamen | null;
}

/**
 * Una fila de la vista `examen_correccion`, acierto o fallo de una pregunta.
 * Solo la ven teniente, capitán y comandante (la política de la vista lo
 * garantiza); un aspirante nunca la ve, ni siquiera para su propio examen.
 *
 * `respuesta` y `acierto` pueden ser `null`, una pregunta sin responder no
 * tiene opción elegida ni cuenta como acierto ni como fallo, se distingue de
 * las dos cosas.
 */
export interface CorreccionPregunta {
  examen_id: string;
  numero: number;
  respuesta: number | null;
  respuesta_correcta: number;
  acierto: boolean | null;
}

const CAMPOS =
  'id, aspirante_id, orden_preferencia, respuestas, creado_en, estado, puntuacion_automatica, resultado_automatico, unidad_automatica, resultado_final, unidad_final, ratificado_por, ratificado_en, corregido_manualmente, motivo_correccion, visto_por_aspirante_en';

const CAMPOS_CON_ASPIRANTE = `${CAMPOS}, aspirante:perfiles!aspirante_id(id, nombre)`;

// ---------------------------------------------------------------------------
// El propio aspirante
// ---------------------------------------------------------------------------

/**
 * El último examen del aspirante, o `null` si nunca ha hecho ninguno. Solo
 * hace falta el último, un aspirante no puede tener dos pendientes a la vez
 * (índice único en la base de datos) y el histórico no se muestra en ningún
 * sitio.
 */
export async function cargarMiExamen(aspiranteId: string): Promise<Examen | null> {
  const { data, error } = await getSupabase()
    .from('examenes')
    .select(CAMPOS)
    .eq('aspirante_id', aspiranteId)
    .order('creado_en', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as Examen | null;
}

/**
 * Envía el examen. El trigger de la base de datos calcula la puntuación, la
 * banda y la unidad propuesta; aquí solo se manda lo que el aspirante ha
 * decidido, el orden de preferencia y sus 50 respuestas.
 */
export async function enviarExamen(datos: {
  aspiranteId: string;
  ordenPreferencia: UnidadId[];
  /** Una por pregunta, en su posición fija; `null` es una pregunta sin responder. */
  respuestas: Array<number | null>;
}): Promise<Examen> {
  const { data, error } = await getSupabase()
    .from('examenes')
    .insert({
      aspirante_id: datos.aspiranteId,
      orden_preferencia: datos.ordenPreferencia,
      respuestas: datos.respuestas,
    })
    .select(CAMPOS)
    .single();

  if (error) throw error;
  return data as Examen;
}

/** Marca visto el resultado, una sola vez (el trigger rechaza la segunda). */
export async function marcarExamenVisto(id: string): Promise<Examen> {
  const { data, error } = await getSupabase()
    .from('examenes')
    .update({ visto_por_aspirante_en: new Date().toISOString() })
    .eq('id', id)
    .select(CAMPOS)
    .single();

  if (error) throw error;
  return data as Examen;
}

const CAMPOS_AUTORIZACION =
  'id, aspirante_id, examen_id, autorizado_por, autorizado_en, motivo, visto_por_aspirante_en';

/**
 * La última autorización del propio aspirante, o `null` si nunca se le ha
 * concedido ninguna. Solo importa si `examen_id` coincide con el examen
 * actual (`cargarMiExamen`), lo decide quien la usa, no esta función.
 */
export async function cargarMiUltimaAutorizacion(
  aspiranteId: string
): Promise<AutorizacionExamen | null> {
  const { data, error } = await getSupabase()
    .from('examen_autorizaciones')
    .select(CAMPOS_AUTORIZACION)
    .eq('aspirante_id', aspiranteId)
    .order('autorizado_en', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as AutorizacionExamen | null;
}

/** Marca vista la autorización, una sola vez (el trigger rechaza la segunda). */
export async function marcarAutorizacionVista(id: string): Promise<AutorizacionExamen> {
  const { data, error } = await getSupabase()
    .from('examen_autorizaciones')
    .update({ visto_por_aspirante_en: new Date().toISOString() })
    .eq('id', id)
    .select(CAMPOS_AUTORIZACION)
    .single();

  if (error) throw error;
  return data as AutorizacionExamen;
}

// ---------------------------------------------------------------------------
// Autorización de un nuevo examen (solo comandante, ver 11_autorizar_nuevo_examen.sql)
// ---------------------------------------------------------------------------

/**
 * Autoriza a un aspirante a repetir el examen. Solo manda `aspirante_id` y
 * `motivo`; `examen_id` (el último examen corregido de ese aspirante),
 * `autorizado_por` y `autorizado_en` los resuelve el trigger, nunca lo que
 * mande el cliente. Que el llamante sea comandante lo exige la base de
 * datos, no esta función.
 */
export async function autorizarNuevoExamen(
  aspiranteId: string,
  motivo: string
): Promise<AutorizacionExamen> {
  const { data, error } = await getSupabase()
    .from('examen_autorizaciones')
    .insert({ aspirante_id: aspiranteId, motivo })
    .select(CAMPOS_AUTORIZACION)
    .single();

  if (error) throw error;
  return data as AutorizacionExamen;
}

/**
 * Cuántos exámenes lleva cada aspirante y cómo quedó el último, para la
 * Gestión de Aspirantes. Si quien pregunta no puede leer `examenes` (RLS lo
 * limita a teniente, capitán y comandante), simplemente no llegan filas, así
 * que devuelve un mapa vacío en vez de lanzar; el llamante decide si pedirlo.
 */
export async function listarResumenExamenes(
  aspiranteIds: string[]
): Promise<Record<string, ResumenExamenAspirante>> {
  if (aspiranteIds.length === 0) return {};

  const { data, error } = await getSupabase()
    .from('examenes')
    .select('id, aspirante_id, estado, resultado_final, creado_en')
    .in('aspirante_id', aspiranteIds)
    .order('creado_en', { ascending: true });

  if (error) throw error;

  const resumen: Record<string, ResumenExamenAspirante> = {};
  for (const fila of data ?? []) {
    const actual = resumen[fila.aspirante_id] ?? {
      total: 0,
      ultimoExamenId: null,
      ultimoEstado: null,
      ultimoResultado: null,
    };
    actual.total += 1;
    actual.ultimoExamenId = fila.id;
    actual.ultimoEstado = fila.estado;
    actual.ultimoResultado = fila.resultado_final;
    resumen[fila.aspirante_id] = actual;
  }
  return resumen;
}

/**
 * De esta lista de exámenes, cuáles ya tienen una autorización (como mucho
 * una por examen, lo exige la base de datos). Para no ofrecer «Permitir un
 * nuevo examen» sobre uno que ya la tiene y que solo puede rebotar.
 */
export async function listarExamenesYaAutorizados(examenIds: string[]): Promise<Set<string>> {
  if (examenIds.length === 0) return new Set();

  const { data, error } = await getSupabase()
    .from('examen_autorizaciones')
    .select('examen_id')
    .in('examen_id', examenIds);

  if (error) throw error;
  return new Set((data ?? []).map((fila) => fila.examen_id as string));
}

// ---------------------------------------------------------------------------
// Revisión por el mando
// ---------------------------------------------------------------------------

/** Exámenes pendientes de revisar, con el nombre de cada aspirante. */
export async function listarExamenesPendientes(): Promise<ExamenConAspirante[]> {
  const { data, error } = await getSupabase()
    .from('examenes')
    .select(CAMPOS_CON_ASPIRANTE)
    .eq('estado', 'enviado')
    .order('creado_en', { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as ExamenConAspirante[];
}

/**
 * Acierto o fallo de cada una de las 50 preguntas, para la revisión. Cruza
 * con `src/data/examen.ts` por `numero` en el componente, esta función solo
 * trae lo que la vista expone.
 */
export async function cargarCorreccion(examenId: string): Promise<CorreccionPregunta[]> {
  const { data, error } = await getSupabase()
    .from('examen_correccion')
    .select('examen_id, numero, respuesta, respuesta_correcta, acierto')
    .eq('examen_id', examenId)
    .order('numero', { ascending: true });

  if (error) throw error;
  return (data ?? []) as CorreccionPregunta[];
}

export interface RatificacionExamen {
  resultadoFinal: ResultadoExamen;
  /** Solo si `resultadoFinal` es `'apto'`; el trigger rechaza cualquier otra combinación. */
  unidadFinal: UnidadId | null;
  corregidoManualmente: boolean;
  motivoCorreccion?: string | null;
}

/**
 * Ratifica un examen. Devuelve `null`, y no lanza, cuando otro mando ya lo
 * había corregido primero, que es justo la señal que pide la interfaz para
 * decir «ya lo ha corregido otro mando» y refrescar la lista, en vez de un
 * error genérico.
 */
export async function ratificarExamen(
  id: string,
  datos: RatificacionExamen
): Promise<Examen | null> {
  const { data, error } = await getSupabase()
    .from('examenes')
    .update({
      estado: 'corregido',
      resultado_final: datos.resultadoFinal,
      unidad_final: datos.unidadFinal,
      corregido_manualmente: datos.corregidoManualmente,
      motivo_correccion: datos.motivoCorreccion ?? null,
    })
    .eq('id', id)
    .eq('estado', 'enviado')
    .select(CAMPOS)
    .maybeSingle();

  if (error) throw error;
  return data as Examen | null;
}

// ---------------------------------------------------------------------------
// Errores
// ---------------------------------------------------------------------------

/**
 * Mensaje en español para lo que devuelva Supabase. Los `raise exception` de
 * los triggers de `examenes` llegan con código P0001 y el texto ya redactado
 * en español, se dejan pasar tal cual, mismo criterio que
 * `mensajeDeError` en `enlace-gestion.ts`.
 */
export function mensajeDeErrorExamen(error: unknown, porDefecto: string): string {
  if (!error) return porDefecto;

  const e = error as { code?: string; message?: string };
  const mensaje = e.message ?? '';

  if (e.code === 'P0001' && mensaje) return mensaje;
  if (/Failed to fetch|NetworkError|network/i.test(mensaje)) {
    return 'No se ha podido conectar. Inténtalo de nuevo en unos minutos.';
  }
  if (/row-level security|violates/i.test(mensaje)) return 'No tienes permiso para hacer eso.';

  return porDefecto;
}
