// ============================================================================
// FASOR, zona interna. Baja real de un miembro o de un aspirante.
//
// Borra la cuenta, no la desactiva. Solo comandante, secretario y tesorero
// pueden invocarla (nunca capitán, ver `puedeEliminar` en el módulo
// compartido); nadie puede eliminarse a sí mismo. Igual que `crear-miembro`,
// el rango, la unidad y el id de quien llama se recalculan siempre desde su
// JWT, nunca desde el cuerpo de la petición.
//
// El borrado en sí se hace sobre `auth.users`, no sobre `perfiles`: la clave
// ajena va en esa dirección (`perfiles.id references auth.users(id) on
// delete cascade`), así que borrar solo el perfil dejaría una cuenta
// huérfana que todavía podría iniciar sesión. El cascade se lleva por
// delante el perfil, los mensajes, los avisos de cadena, los exámenes y las
// autorizaciones de examen de esa persona (ver
// `supabase/sql/12_eliminacion_real_de_miembros.sql`, que además corrige las
// dos claves que apuntaban a un mando en vez de al dueño de la fila,
// `examenes.ratificado_por` y `examen_autorizaciones.autorizado_por`, para
// que queden en null en vez de bloquear el borrado o arrastrar el examen de
// otra persona).
// ============================================================================

import {
  clienteDeServicio,
  clienteDelLlamante,
  fallo,
  perfilDelLlamante,
  puedeEliminar,
  responder,
  responderPreflight,
} from '../_compartido/autorizacion.ts';

interface Peticion {
  id?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return responderPreflight();
  if (req.method !== 'POST') return fallo('Método no admitido.', 405);

  let cuerpo: Peticion;
  try {
    cuerpo = await req.json();
  } catch {
    return fallo('La petición no es válida.', 400);
  }

  const comoLlamante = clienteDelLlamante(req);
  const gestor = await perfilDelLlamante(comoLlamante);
  if (!gestor) return fallo('Tu sesión no es válida o tu cuenta no está activa.', 401);

  const id = (cuerpo.id ?? '').trim();
  if (!id) return fallo('Falta el identificador de la cuenta a eliminar.', 400);

  // La ficha objetivo, leída con la identidad de quien llama: si la política
  // de lectura no se la deja ver, tampoco va a poder gestionarla.
  const { data: objetivo, error: errorObjetivo } = await comoLlamante
    .from('perfiles')
    .select('id, nombre, rango, unidad, activo')
    .eq('id', id)
    .maybeSingle();

  if (errorObjetivo || !objetivo) {
    return fallo('Esa cuenta no existe o no tienes permiso para verla.', 404);
  }

  // ---- Jerarquía ------------------------------------------------------------
  // Comprobada aquí para dar un mensaje claro, y otra vez por el trigger de la
  // base de datos (la regla del último comandante, que es incondicional).
  // Nadie más protege esto, no hay política de DELETE sobre `perfiles`.
  if (!puedeEliminar(gestor, objetivo)) {
    return fallo('No tienes permiso para eliminar esa cuenta.', 403);
  }

  // Mensaje claro antes de intentarlo; el trigger `perfiles_protecciones` lo
  // rechazaría igual si por lo que sea esta comprobación se equivocara o
  // cambiara entretanto (tiene su propio bloqueo contra dos borrados a la vez).
  if (objetivo.rango === 'comandante' && objetivo.activo) {
    const { count, error: errorConteo } = await comoLlamante
      .from('perfiles')
      .select('id', { count: 'exact', head: true })
      .eq('rango', 'comandante')
      .eq('activo', true);

    if (errorConteo) {
      return fallo('No se ha podido comprobar cuántos comandantes quedan.', 500);
    }
    if ((count ?? 0) <= 1) {
      return fallo(
        'No puedes dejar a la entidad sin ningún comandante activo. Nombra antes a otro comandante.',
        409
      );
    }
  }

  // ---- El borrado, con la clave de servicio ---------------------------------
  const conServicio = clienteDeServicio();
  const { error: errorBorrado } = await conServicio.auth.admin.deleteUser(id);

  if (errorBorrado) {
    return fallo('No se ha podido eliminar la cuenta.', 500);
  }

  return responder({ eliminado: true, id });
});
