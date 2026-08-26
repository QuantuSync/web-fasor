import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/*
 * Cliente de Supabase para la zona interna (/enlace).
 *
 * Se crea de forma perezosa a propósito. `createClient` persiste la sesión en
 * localStorage, así que una instancia a nivel de módulo se evaluaría durante el
 * pre-render (SSG) y tocaría el navegador donde no lo hay. Con este getter, el
 * cliente solo nace cuando alguien lo pide, y eso solo ocurre en el navegador.
 *
 * Las credenciales llegan por variables de entorno (.env.local en local, panel
 * de Vercel en producción). Nunca se escriben literales en el código.
 */

let cliente: SupabaseClient | null = null;

function leerVariable(nombre: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_PUBLISHABLE_KEY'): string {
  const valor = import.meta.env[nombre];
  if (!valor) {
    throw new Error(
      `Falta la variable de entorno ${nombre}. Defínela en .env.local (en local) y en el panel de Vercel (en producción).`
    );
  }
  return valor;
}

export function getSupabase(): SupabaseClient {
  if (!cliente) {
    cliente = createClient(
      leerVariable('VITE_SUPABASE_URL'),
      leerVariable('VITE_SUPABASE_PUBLISHABLE_KEY')
    );
  }
  return cliente;
}
