import type { UnidadId } from '../data/unidades';

/*
 * Progreso local de un examen de ingreso a medias, red de seguridad frente a
 * una recarga de página, un cambio de pestaña o una navegación a otra ruta
 * del sitio y vuelta a /enlace.
 *
 * Vive SOLO en `localStorage` del navegador, nunca en la base de datos, un
 * examen no existe de verdad hasta que se envía (`enviarExamen`), y lo que
 * hay aquí es justo lo contrario, lo que todavía no se ha enviado. No guarda
 * nada más que la fase, el orden de preferencia y las respuestas.
 *
 * Se borra en dos sitios, y solo esos dos, al enviar el examen
 * (`PantallaAspirante.tsx`) y al cerrar sesión (`SesionContext.tsx`, con el
 * id de quien sale todavía disponible), para que no quede el progreso de una
 * persona en el navegador para la siguiente que entre en el mismo equipo. La
 * clave va con el id del aspirante para que, aunque alguno de esos dos sitios
 * fallara, una cuenta distinta nunca lea el progreso de otra.
 */

export interface ProgresoExamen {
  paso: 'orden' | 'preguntas';
  orden: UnidadId[];
  respuestas: Array<number | null>;
}

const clave = (aspiranteId: string) => `fasor.examen.progreso.${aspiranteId}`;

function formaValida(datos: unknown): datos is ProgresoExamen {
  if (!datos || typeof datos !== 'object') return false;
  const d = datos as Record<string, unknown>;
  return (
    (d.paso === 'orden' || d.paso === 'preguntas') &&
    Array.isArray(d.orden) &&
    Array.isArray(d.respuestas)
  );
}

/**
 * Guarda el progreso. `localStorage` puede fallar (navegación privada, cuota
 * agotada, deshabilitado por el usuario); si falla, se pierde la red de
 * seguridad pero no hay por qué romper el examen por eso.
 */
export function guardarProgresoExamen(aspiranteId: string, progreso: ProgresoExamen): void {
  try {
    localStorage.setItem(clave(aspiranteId), JSON.stringify(progreso));
  } catch {
    // Sin red de seguridad esta vez; el examen sigue funcionando igual.
  }
}

/** Lee el progreso guardado, o `null` si no hay ninguno o no tiene la forma esperada. */
export function cargarProgresoExamen(aspiranteId: string): ProgresoExamen | null {
  try {
    const bruto = localStorage.getItem(clave(aspiranteId));
    if (!bruto) return null;
    const datos: unknown = JSON.parse(bruto);
    return formaValida(datos) ? datos : null;
  } catch {
    return null;
  }
}

/** Borra el progreso guardado. Se llama al enviar el examen y al cerrar sesión. */
export function borrarProgresoExamen(aspiranteId: string): void {
  try {
    localStorage.removeItem(clave(aspiranteId));
  } catch {
    // Igual que al guardar, no hay nada más que hacer si falla.
  }
}
