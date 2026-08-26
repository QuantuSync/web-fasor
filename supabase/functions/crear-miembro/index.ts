// ============================================================================
// FASOR, zona interna. Alta de un miembro.
//
// Crea la cuenta de acceso y su perfil en una sola operación. La cuenta nace
// confirmada, sin correo de verificación, porque los identificadores internos
// no reciben correo.
//
// El orden importa: primero la cuenta (necesita la clave de servicio) y
// después el perfil, insertado CON EL JWT DE QUIEN LLAMA para que RLS vuelva a
// validar la jerarquía en la base de datos. Si ese insert falla, se borra la
// cuenta recién creada, de modo que no queda nunca una cuenta sin perfil.
// ============================================================================

import {
  clienteDeServicio,
  clienteDelLlamante,
  fallo,
  normalizarUsuario,
  perfilDelLlamante,
  puedeGestionar,
  RANGOS,
  responder,
  responderPreflight,
  UNIDADES,
  usuarioValido,
  type Rango,
  type Unidad,
} from '../_compartido/autorizacion.ts';

const LARGO_MINIMO_CONTRASENA = 8;

interface Peticion {
  nombre?: string;
  usuario?: string;
  contrasena?: string;
  rango?: string;
  unidad?: string | null;
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

  // ---- Validación de los datos que llegan --------------------------------
  const nombre = (cuerpo.nombre ?? '').trim();
  if (nombre.length < 2) return fallo('El nombre es obligatorio.', 400);

  const usuario = normalizarUsuario(cuerpo.usuario ?? '');
  if (!usuarioValido(usuario)) return fallo('El usuario no tiene un formato válido.', 400);

  const contrasena = cuerpo.contrasena ?? '';
  if (contrasena.length < LARGO_MINIMO_CONTRASENA) {
    return fallo(`La contraseña debe tener al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`, 400);
  }

  const rango = cuerpo.rango as Rango;
  if (!RANGOS.includes(rango)) return fallo('El rango indicado no existe.', 400);

  const unidad = (cuerpo.unidad ?? null) as Unidad | null;
  if (unidad !== null && !UNIDADES.includes(unidad)) {
    return fallo('La unidad indicada no existe.', 400);
  }

  // ---- Jerarquía ----------------------------------------------------------
  // Comprobada aquí para dar un mensaje claro, y otra vez por RLS más abajo,
  // que es donde de verdad se autoriza.
  if (!puedeGestionar(gestor, { rango, unidad })) {
    return fallo('No tienes permiso para dar de alta a un miembro con ese rango o unidad.', 403);
  }

  // ---- La cuenta ----------------------------------------------------------
  const conServicio = clienteDeServicio();
  const { data: creada, error: errorCuenta } = await conServicio.auth.admin.createUser({
    email: usuario,
    password: contrasena,
    email_confirm: true,
  });

  if (errorCuenta || !creada?.user) {
    const yaExiste =
      errorCuenta?.status === 422 || /already|registered|exists/i.test(errorCuenta?.message ?? '');
    return fallo(
      yaExiste ? 'Ese usuario ya existe.' : 'No se ha podido crear la cuenta de acceso.',
      yaExiste ? 409 : 500
    );
  }

  // ---- El perfil, con la identidad de quien llama -------------------------
  const { data: perfil, error: errorPerfil } = await comoLlamante
    .from('perfiles')
    .insert({ id: creada.user.id, nombre, rango, unidad, activo: true })
    .select('id, nombre, rango, unidad, activo')
    .single();

  if (errorPerfil || !perfil) {
    // Compensación: la cuenta ya existe pero el perfil no, así que se deshace.
    const { error: errorBorrado } = await conServicio.auth.admin.deleteUser(creada.user.id);
    if (errorBorrado) {
      // Caso peor: ni se creó el perfil ni se pudo deshacer la cuenta. Se dice
      // en voz alta con el id, en lugar de dejar el huérfano en silencio.
      return fallo(
        `No se ha podido crear el perfil y ha quedado una cuenta suelta sin perfil (${creada.user.id}). Avisa a la Junta Directiva para que la retire.`,
        500
      );
    }
    return fallo('No se ha podido crear el perfil, así que no se ha dado de alta a nadie.', 403);
  }

  return responder({ perfil, usuario }, 201);
});
