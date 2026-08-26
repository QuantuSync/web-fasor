import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabase } from '../lib/supabase';
import type { Perfil } from '../lib/enlace-types';
import { SesionContext, type ValorSesion } from './useSesion';

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
      setCargando(true);
      void aplicar(nueva);
    });

    return () => {
      vigente = false;
      subscription.unsubscribe();
    };
  }, []);

  // El cierre de sesión lo propaga onAuthStateChange, que ya limpia el estado.
  const salir = useCallback(async () => {
    await getSupabase().auth.signOut();
  }, []);

  const valor = useMemo<ValorSesion>(
    () => ({ sesion, perfil, cargando, salir }),
    [sesion, perfil, cargando, salir]
  );

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}
