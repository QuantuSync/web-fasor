import { createContext, useContext } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Perfil } from '../lib/enlace-types';

/*
 * Contexto y hook de la sesión de la zona interna. Vive aparte del provider
 * (SesionContext.tsx) para que ese fichero exporte solo componentes y no
 * moleste a react-refresh.
 *
 * `perfil` es null mientras carga, y también cuando la cuenta autenticada no
 * tiene fila en la tabla de perfiles. Esos dos casos se distinguen con
 * `cargando`, y la pantalla los trata por separado.
 */
export interface ValorSesion {
  sesion: Session | null;
  perfil: Perfil | null;
  cargando: boolean;
  salir: () => Promise<void>;
}

export const SesionContext = createContext<ValorSesion | null>(null);

export function useSesion(): ValorSesion {
  const valor = useContext(SesionContext);
  if (!valor) {
    throw new Error('useSesion debe usarse dentro de SesionProvider');
  }
  return valor;
}
