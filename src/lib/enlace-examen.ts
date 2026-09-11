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
  respuestas: number[];
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
  respuestas: number[];
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
