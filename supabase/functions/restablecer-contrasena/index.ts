// ============================================================================
// FASOR, zona interna. Restablecer la contraseña de un miembro.
//
// Cambiar la contraseña de otra cuenta exige la clave de servicio, que se
// salta RLS. Por eso, antes de tocar nada, se lee el perfil del objetivo CON
// EL JWT DE QUIEN LLAMA: si RLS no se lo deja ver, para él no existe. Solo
// después se comprueba la jerarquía y se cambia la contraseña.
// ============================================================================

import {
  clienteDeServicio,
  clienteDelLlamante,
  fallo,
  perfilDelLlamante,
  puedeGestionar,
  responder,
  responderPreflight,
  type Perfil,
} from '../_compartido/autorizacion.ts';

const LARGO_MINIMO_CONTRASENA = 8;

interface Peticion {
  id?: string;
  contrasena?: string;
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
  if (!id) return fallo('Falta indicar de quién es la contraseña.', 400);

  const contrasena = cuerpo.contrasena ?? '';
  if (contrasena.length < LARGO_MINIMO_CONTRASENA) {
    return fallo(`La contraseña debe tener al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`, 400);
  }

  // ---- El objetivo, visto con los ojos de quien llama ---------------------
  const { data, error } = await comoLlamante
    .from('perfiles')
    .select('id, nombre, rango, unidad, activo')
    .eq('id', id)
    .maybeSingle();

  // Mismo mensaje si no existe que si RLS lo oculta: no se filtra quién hay.
  if (error || !data) return fallo('No se ha encontrado a ese miembro.', 404);
  const objetivo = data as Perfil;

  // Cambiarse la propia contraseña sí se permite: quien llama ya tiene la
  // sesión abierta, así que no hay nada que escalar.
  if (objetivo.id !== gestor.id && !puedeGestionar(gestor, objetivo)) {
    return fallo('No tienes permiso para cambiar la contraseña de ese miembro.', 403);
  }

  const { error: errorCambio } = await clienteDeServicio().auth.admin.updateUserById(id, {
    password: contrasena,
  });

  if (errorCambio) return fallo('No se ha podido cambiar la contraseña.', 500);

  return responder({ ok: true, nombre: objetivo.nombre });
});
