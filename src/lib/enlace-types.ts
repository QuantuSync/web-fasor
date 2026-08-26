import { unidades, type UnidadId } from '../data/unidades';

/*
 * Tipos de la zona interna (/enlace), en correspondencia con la base de datos.
 *
 * `Unidad` es el mismo conjunto de valores que `UnidadId` del sitio público
 * (buceadores, drones, forestal, terrestres, sanitario, comunicaciones), así
 * que se declara como alias en lugar de duplicar la lista.
 */
export type Rango = 'comandante' | 'capitan' | 'teniente' | 'operador' | 'cadete';

export type Unidad = UnidadId;

export interface Perfil {
  id: string;
  nombre: string;
  rango: Rango;
  /** Puede no tener unidad asignada */
  unidad: Unidad | null;
  activo: boolean;
}

/*
 * Etiquetas legibles de rango para pantalla. No se toman de `escalafon.ts`
 * porque allí los nombres van numerados («1. Comandante»), y en la zona interna
 * el rango se muestra suelto, sin su posición en el escalafón.
 */
export const ETIQUETA_RANGO: Record<Rango, string> = {
  comandante: 'Comandante',
  capitan: 'Capitán de Unidad',
  teniente: 'Teniente de Cuadrilla',
  operador: 'Operador Táctico',
  cadete: 'Cadete en Formación',
};

/*
 * Nombre de la unidad, leído de la fuente de verdad del sitio (unidades.ts).
 * No usa `unidadPorId` porque ese lanza ante un id desconocido, y aquí el valor
 * llega de la base de datos, no del código: si algún día divergieran, la
 * pantalla debe seguir mostrando algo en vez de romperse.
 */
export function etiquetaUnidad(unidad: Unidad): string {
  return unidades.find((u) => u.id === unidad)?.nombre ?? unidad;
}

/*
 * Emblema de la unidad, de la misma fuente que el nombre, para que la zona
 * interna no repita rutas de imagen. Devuelve null si la unidad no se reconoce,
 * y entonces la pantalla no pinta emblema (mismo criterio que sin unidad).
 */
export function emblemaUnidad(unidad: Unidad): string | null {
  return unidades.find((u) => u.id === unidad)?.logo ?? null;
}
