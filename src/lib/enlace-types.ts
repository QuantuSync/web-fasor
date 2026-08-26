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
 * Miembro tal y como lo devuelve la vista `directorio` de la base de datos.
 *
 * Es lo único que un miembro cualquiera puede ver de los demás, y existe porque
 * la política de lectura de `perfiles` es estrecha a propósito (un cadete solo
 * se ve a sí mismo). Incluye a los de baja, para poder poner nombre al
 * remitente de un mensaje antiguo de alguien que ya no está; escribirles es
 * otra cosa, y eso lo impide la base de datos.
 */
export interface MiembroDirectorio {
  id: string;
  nombre: string;
  rango: Rango;
  unidad: Unidad | null;
  activo: boolean;
}

/** Un mensaje del buzón interno. Los campos son los de la tabla `mensajes`. */
export interface Mensaje {
  id: string;
  remitente: string;
  destinatario: string;
  asunto: string;
  cuerpo: string;
  creado_en: string;
  leido_en: string | null;
  archivado_remitente: boolean;
  archivado_destinatario: boolean;
  /*
   * Eliminado por cada lado, por separado. Eliminar es permanente y afecta solo
   * a la vista de quien elimina: si el destinatario borra el mensaje, el
   * remitente lo conserva en Enviados, y al revés. Cuando las dos partes lo han
   * eliminado, la fila se borra de verdad en el servidor.
   */
  eliminado_remitente: boolean;
  eliminado_destinatario: boolean;
  responde_a: string | null;
  hilo: string;
}

/*
 * Aviso de salto de cadena de mando.
 *
 * Fíjate en lo que NO hay aquí y no debe añadirse nunca: ni asunto, ni cuerpo,
 * ni identificador del mensaje que lo originó. El aviso dice quién ha escrito,
 * a quién y cuándo, y ahí se acaba. El mando se entera de que ha ocurrido, no
 * de lo que se dijo. La tabla de la base de datos está construida igual, sin
 * ninguna columna que apunte a `mensajes`, así que no hay forma de llegar al
 * contenido ni siquiera por referencia.
 */
export interface AvisoCadena {
  id: string;
  /** El mando que lo recibe */
  mando: string;
  /** Quién escribió */
  remitente: string;
  /** A quién escribió */
  destinatario: string;
  creado_en: string;
  leido_en: string | null;
  archivado: boolean;
}

/** Lo que se pinta en la bandeja, que mezcla las dos cosas ordenadas por fecha. */
export type EntradaBuzon =
  { tipo: 'mensaje'; mensaje: Mensaje } | { tipo: 'aviso'; aviso: AvisoCadena };

/*
 * Etiquetas legibles de rango para pantalla. No se toman de `escalafon.ts`
 * porque allí los nombres van numerados («1. Comandante»), y en la zona interna
 * el rango se muestra suelto, sin su posición en el escalafón.
 */
/*
 * Dominio de los identificadores internos. Los miembros no usan correos reales:
 * la Junta usa direcciones @fasor.es y el resto identificadores @fasor.local,
 * que nunca reciben correo. Si un usuario se escribe sin arroba, se le añade.
 */
export const DOMINIO_INTERNO = '@fasor.local';

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
