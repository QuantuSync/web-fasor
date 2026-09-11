import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabase } from '../lib/supabase';
import type { Perfil } from '../lib/enlace-types';
import { SesionContext, type ValorSesion } from './useSesion';
import { borrarProgresoExamen } from '../lib/enlace-examen-progreso';

/*
 * Estado de sesión de la zona interna (/enlace).
 *
 * Todo el trabajo vive en un useEffect, nunca en el cuerpo del render, porque
 * el cliente de Supabase toca localStorage y este provider no debe evaluarse
 * durante el pre-render. Aun así, el provider se monta bajo <ClientOnly> en la
 * página, así que en el HTML generado no llega a existir.
 */
export default function SesionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(true);
  // Id del usuario autenticado ahora mismo, para distinguir un evento que de
  // verdad cambia de identidad de uno que no. Va en un `ref` y no en estado
  // porque el `useEffect` de más abajo solo se monta una vez (`[]`) y su
  // cierre necesita leer el valor VIGENTE en cada evento, no el de cuando se
  // creó la suscripción.
  const idUsuarioActual = useRef<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    // Evita escribir estado después de desmontar, y descartar respuestas viejas
    // cuando llegan fuera de orden.
    let vigente = true;

    // Carga el perfil del usuario autenticado. `maybeSingle` devuelve null sin
    // error cuando no hay fila, que es un caso previsto (cuenta sin perfil).
    const cargarPerfil = async (idUsuario: string) => {
      const { data, error } = await supabase
        .from('perfiles')
        .select('id, nombre, rango, unidad, activo')
        .eq('id', idUsuario)
        .maybeSingle();

      if (!vigente) return;
      setPerfil(error ? null : ((data as Perfil | null) ?? null));
    };

    const aplicar = async (nueva: Session | null) => {
      if (!vigente) return;
      idUsuarioActual.current = nueva?.user?.id ?? null;
      setSesion(nueva);

      if (nueva?.user?.id) {
        await cargarPerfil(nueva.user.id);
      } else if (vigente) {
        setPerfil(null);
      }

      if (vigente) setCargando(false);
    };

    // Sesión inicial (puede venir de localStorage) y suscripción a los cambios.
    supabase.auth.getSession().then(({ data }) => aplicar(data.session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, nueva) => {
      /*
       * `supabase-js` refresca el token solo con que la pestaña recupere la
       * visibilidad (escucha `visibilitychange` y comprueba el token en
       * `_onVisibilityChanged`), y eso dispara `onAuthStateChange` con
       * `TOKEN_REFRESHED` aunque el usuario sea exactamente el mismo de
       * antes. Tratar ese evento como los demás (pantalla de carga + volver
       * a pedir el perfil) desmonta `Interior` mientras `cargando` vale
       * `true` y lo vuelve a montar después, y con él cualquier estado local
       * en curso debajo, un examen a medias, un mensaje a medio redactar, un
       * panel de edición abierto. Si el usuario sigue siendo el mismo, no ha
       * cambiado nada que la zona interna necesite recargar, así que solo se
       * actualiza la sesión (lleva el token nuevo) y se sale, sin tocar
       * `cargando` ni volver a pedir el perfil.
       */
      if (nueva?.user?.id && nueva.user.id === idUsuarioActual.current) {
        setSesion(nueva);
        return;
      }

      setCargando(true);
      void aplicar(nueva);
    });

    return () => {
      vigente = false;
      subscription.unsubscribe();
    };
  }, []);

  // El cierre de sesión lo propaga onAuthStateChange, que ya limpia el estado.
  // El progreso local de un examen a medias se borra aquí, con el id de quien
  // sale todavía disponible, para que no quede en el navegador para el
  // siguiente que entre.
  const salir = useCallback(async () => {
    if (idUsuarioActual.current) {
      borrarProgresoExamen(idUsuarioActual.current);
    }
    await getSupabase().auth.signOut();
  }, []);

  const valor = useMemo<ValorSesion>(
    () => ({ sesion, perfil, cargando, salir }),
    [sesion, perfil, cargando, salir]
  );

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}
