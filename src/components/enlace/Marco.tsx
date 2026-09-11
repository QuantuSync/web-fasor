import { type ReactNode } from 'react';
import { LogOut } from 'lucide-react';
import fasorLogo from '../../assets/fasor.jpg';
import Galon from '../Galon';
import { useSesion } from '../../context/useSesion';

/*
 * Chasis visual común de /enlace, `Columna`, `Panel`, `Rotulo` y `BotonSalir`.
 * Vive en su propio módulo, separado de `src/pages/Enlace.tsx`, para que
 * `PantallaAspirante.tsx` (y cualquier otra pantalla de la zona interna) pueda
 * reutilizarlo sin crear una dependencia circular con la página que las monta
 * a todas.
 */

// Alto del sello y, por tanto, del distintivo de rango que lo acompaña en el
// `Interior` de un miembro (ver `Enlace.tsx`).
export const ALTO_CABECERA = 48;

/*
 * Columna que centra el contenido. Usa `m-auto` en lugar de `items-center` en
 * el contenedor: con centrado por alineación, un contenido más alto que la
 * ventana se recorta por arriba y deja parte inalcanzable, y la lista de
 * miembros o el examen pueden ser largos. Los márgenes automáticos no tienen
 * ese problema.
 *
 * El interior va a max-w-2xl, porque lleva el buzón y puede llevar la lista de
 * miembros; el acceso y los avisos de cuenta siguen en max-w-md.
 */
export function Columna({ children, ancho = 'max-w-md' }: { children: ReactNode; ancho?: string }) {
  return <div className={`m-auto w-full ${ancho}`}>{children}</div>;
}

// Panel común a todos los estados. Superficie con filete dorado de 1px, radio
// de 4px, sin sombras ni brillos. A 360px ocupa el ancho disponible.
//
// La fila superior lleva el sello a la izquierda y, cuando hay rango que
// mostrar, su distintivo a la derecha. Ambos con `shrink-0`, para que en
// pantallas estrechas repartan el hueco sin comprimirse.
export function Panel({ children, distintivo }: { children: ReactNode; distintivo?: ReactNode }) {
  return (
    <div className="w-full rounded-sm border border-fasor-gold/40 bg-fasor-surface p-6 sm:p-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <img
          src={fasorLogo}
          alt=""
          width={ALTO_CABECERA}
          height={ALTO_CABECERA}
          className="h-12 w-12 shrink-0 rounded-full border border-fasor-gold/40 object-cover"
        />
        {distintivo}
      </div>
      {children}
    </div>
  );
}

/*
 * Rótulo de la zona, común al acceso y al interior.
 *
 * `derecha` es el hueco de la columna derecha, a la altura del titular. En el
 * interior lo ocupa el rango, que así queda justo debajo del distintivo de la
 * fila superior y alineado con el nombre, pero en el lado opuesto.
 *
 * La fila es `flex-wrap` con `items-baseline`, y lo de la derecha lleva
 * `ml-auto` y `shrink-0`: mientras caben, nombre y rango comparten línea de
 * base; cuando no caben, el rango baja a su propia línea y sigue pegado a la
 * derecha, sin comprimirse ni solaparse con el nombre. El galón va `self-center`
 * para que no sea él quien marque la línea de base de la fila.
 */
export function Rotulo({
  titulo,
  derecha,
  children,
}: {
  titulo: string;
  derecha?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <>
      <p className="etiqueta mb-2">Zona interna</p>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h1 className="flex min-w-0 items-baseline gap-3 font-display text-3xl font-bold uppercase tracking-tight text-fasor-bone">
          <Galon count={2} className="h-4 w-3 shrink-0 self-center" />
          <span className="break-words">{titulo}</span>
        </h1>
        {derecha}
      </div>
      <div className="linea-fade mt-4" aria-hidden="true"></div>
      {children}
    </>
  );
}

// Botón de salida, compartido por el interior y por los avisos de cuenta
export function BotonSalir() {
  const { salir } = useSesion();
  return (
    <button type="button" className="btn-contorno mt-8 w-full" onClick={() => void salir()}>
      <LogOut className="h-4 w-4" aria-hidden="true" />
      Salir
    </button>
  );
}
