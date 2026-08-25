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
}

export const unidades: Unidad[] = [
  {
    id: 'buceadores',
    nombre: 'Buceadores de Rescate',
    logo: buceadoresLogo,
    descripcion:
      'Especialistas en rescate acuático, operaciones subacuáticas y salvamento en entornos fluviales, lacustres y costeros.',
  },
  {
    id: 'drones',
    nombre: 'Intervención Aérea',
    logo: dronesLogo,
    descripcion:
      'Operaciones con drones para reconocimiento aéreo, búsqueda de personas, evaluación de daños y coordinación táctica desde el aire.',
  },
  {
    id: 'forestal',
    nombre: 'Intervención Forestal',
    logo: forestalLogo,
    descripcion:
      'Combate y prevención de incendios forestales, rescate en montaña y operaciones en entornos naturales hostiles.',
  },
  {
    id: 'terrestres',
    nombre: 'Operaciones Terrestres',
    logo: terrestresLogo,
    descripcion:
      'Rescate urbano, apertura de rutas de acceso, búsqueda de personas desaparecidas y operaciones en terreno difícil.',
  },
  {
    id: 'sanitario',
    nombre: 'Sanitario',
    logo: sanitarioLogo,
    descripcion:
      'Asistencia médica de emergencia, estabilización de heridos, evacuaciones sanitarias y apoyo médico en catástrofes.',
  },
  {
    id: 'comunicaciones',
    nombre: 'Comunicaciones y Coordinación',
    logo: comunicacionesLogo,
    descripcion:
      'Enlace radio, coordinación con el 112 y las autoridades competentes, puesto de mando avanzado y seguimiento de los equipos sobre el terreno.',
  },
];

// Búsqueda de una unidad por su identificador, para las páginas que muestran
// su emblema sin repetir los datos (p. ej. el catálogo de FASOR Academy).
export function unidadPorId(id: UnidadId): Unidad {
  const unidad = unidades.find((u) => u.id === id);
  if (!unidad) throw new Error(`Unidad desconocida: ${id}`);
  return unidad;
}
