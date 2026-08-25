import buceadoresLogo from '../assets/buceadores-logo.jpg';
import dronesLogo from '../assets/drones-logo.jpg';
import forestalLogo from '../assets/forestal-logo.jpg';
import terrestresLogo from '../assets/terrestres-logo.jpg';
import sanitarioLogo from '../assets/sanitario-logo.jpg';
import comunicacionesLogo from '../assets/comunicaciones-logo.png';

// Las seis unidades especializadas de FASOR.
// Contenido portado verbatim de Fasor.tsx (repo de Casa Alaniz).
export type UnidadId =
  'buceadores' | 'drones' | 'forestal' | 'terrestres' | 'sanitario' | 'comunicaciones';

export interface Unidad {
  id: UnidadId;
  nombre: string;
  logo: string;
  descripcion: string;
  /** Lo que la unidad sabe hacer, en entradas cortas */
  capacidades: string[];
  /** Situaciones en las que se activa la unidad */
  escenarios: string[];
}

/*
 * Nota sobre la formación de cada unidad. NO vive aquí: los cursos de la
 * Academy ligados a una unidad se derivan de `catalogoAcademy` con
 * `cursosPorUnidad()` (src/data/academy.ts), que ya conoce el `unidadId` de
 * cada curso. Así el dato es uno solo y /unidades no puede divergir de
 * /academy. Este módulo no importa academy.ts a propósito, para no arrastrar
 * el catálogo entero a las páginas que solo necesitan las unidades.
 */

export const unidades: Unidad[] = [
  {
    id: 'buceadores',
    nombre: 'Buceadores de Rescate',
    logo: buceadoresLogo,
    descripcion:
      'Especialistas en rescate acuático, operaciones subacuáticas y salvamento en entornos fluviales, lacustres y costeros.',
    capacidades: [
      'Búsqueda subacuática en aguas interiores y en costa',
      'Rescate y salvamento de personas en superficie',
      'Apoyo en inundaciones y crecidas',
      'Seguridad acuática para el trabajo de otras unidades',
    ],
    escenarios: [
      'Personas desaparecidas en río, embalse o litoral',
      'Episodios de inundación que dejan a personas aisladas',
      'Operaciones que se desarrollan sobre el agua o junto a ella',
    ],
  },
  {
    id: 'drones',
    nombre: 'Intervención Aérea',
    logo: dronesLogo,
    descripcion:
      'Operaciones con drones para reconocimiento aéreo, búsqueda de personas, evaluación de daños y coordinación táctica desde el aire.',
    capacidades: [
      'Reconocimiento aéreo de la zona de intervención',
      'Apoyo desde el aire a la búsqueda de personas',
      'Evaluación de daños y de accesos tras un suceso',
      'Vista de conjunto para el puesto de mando',
    ],
    escenarios: [
      'Batidas y rastreos que necesitan cubrir mucho terreno',
      'Zonas siniestradas cuyo alcance hay que valorar antes de entrar',
      'Intervenciones en las que el mando necesita ver el conjunto',
    ],
  },
  {
    id: 'forestal',
    nombre: 'Intervención Forestal',
    logo: forestalLogo,
    descripcion:
      'Combate y prevención de incendios forestales, rescate en montaña y operaciones en entornos naturales hostiles.',
    capacidades: [
      'Trabajo de apoyo en incendio forestal',
      'Prevención y vigilancia en periodo de riesgo',
      'Búsqueda y rescate en montaña',
      'Progresión y trabajo en entornos naturales hostiles',
    ],
    escenarios: [
      'Incendios forestales en apoyo de las autoridades competentes',
      'Personas perdidas o accidentadas en monte',
      'Periodos de riesgo alto que aconsejan vigilancia preventiva',
    ],
  },
  {
    id: 'terrestres',
    nombre: 'Operaciones Terrestres',
    logo: terrestresLogo,
    descripcion:
      'Rescate urbano, apertura de rutas de acceso, búsqueda de personas desaparecidas y operaciones en terreno difícil.',
    capacidades: [
      'Rescate de personas en entorno urbano',
      'Apertura y aseguramiento de rutas de acceso',
      'Búsqueda de personas desaparecidas sobre el terreno',
      'Movimiento y trabajo sostenido en terreno difícil',
    ],
    escenarios: [
      'Siniestros en zona habitada con personas atrapadas o aisladas',
      'Batidas de búsqueda coordinadas con las autoridades competentes',
      'Accesos cortados que impiden llegar a la zona afectada',
    ],
  },
  {
    id: 'sanitario',
    nombre: 'Sanitario',
    logo: sanitarioLogo,
    descripcion:
      'Asistencia médica de emergencia, estabilización de heridos, evacuaciones sanitarias y apoyo médico en catástrofes.',
    capacidades: [
      'Asistencia sanitaria de emergencia en el punto de intervención',
      'Estabilización de heridos hasta su traslado',
      'Apoyo a la evacuación sanitaria',
      'Cobertura sanitaria de los equipos desplegados',
    ],
    escenarios: [
      'Intervenciones con personas heridas que necesitan atención inmediata',
      'Catástrofes con varios afectados que exigen apoyo sanitario',
      'Despliegues y ejercicios que requieren cobertura propia',
    ],
  },
  {
    id: 'comunicaciones',
    nombre: 'Comunicaciones y Coordinación',
    logo: comunicacionesLogo,
    descripcion:
      'Enlace radio, coordinación con el 112 y las autoridades competentes, puesto de mando avanzado y seguimiento de los equipos sobre el terreno.',
    capacidades: [
      'Enlace radio permanente entre los equipos y el mando',
      'Coordinación con el 112 y con las autoridades competentes',
      'Puesto de mando avanzado en la zona de intervención',
      'Seguimiento de la situación y la posición de los equipos',
    ],
    escenarios: [
      'Intervenciones con varias unidades trabajando a la vez',
      'Zonas donde la comunicación ordinaria es difícil o insuficiente',
      'Operaciones que exigen enlace continuo con los servicios públicos',
    ],
  },
];

// Búsqueda de una unidad por su identificador, para las páginas que muestran
// su emblema sin repetir los datos (p. ej. el catálogo de FASOR Academy).
export function unidadPorId(id: UnidadId): Unidad {
  const unidad = unidades.find((u) => u.id === id);
  if (!unidad) throw new Error(`Unidad desconocida: ${id}`);
  return unidad;
}
