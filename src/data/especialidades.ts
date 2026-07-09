import {
  Construction,
  Truck,
  Tornado,
  HardHat,
  RadioTower,
  Handshake,
  type LucideIcon,
} from 'lucide-react';

// Las seis especialidades de formación de FASOR.
// Contenido portado verbatim de Fasor.tsx (repo de Casa Alaniz).
export interface Especialidad {
  icono: LucideIcon;
  titulo: string;
  descripcion: string;
}

export const especialidades: Especialidad[] = [
  {
    icono: Construction,
    titulo: 'Ingeniería y Fortificaciones de Emergencia',
    descripcion: 'Construcción de pasos temporales, apuntalamientos y estructuras seguras.',
  },
  {
    icono: Truck,
    titulo: 'Rescate y Movilidad Terrestre',
    descripcion:
      'Apertura de rutas, búsqueda de desaparecidos y extracción en terrenos complicados.',
  },
  {
    icono: Tornado,
    titulo: 'Gestión de Catástrofes Naturales',
    descripcion:
      'Refuerzo en incendios, control de inundaciones y protección de infraestructuras críticas.',
  },
  {
    icono: HardHat,
    titulo: 'Asistencia Sanitaria de Emergencia',
    descripcion: 'Primeros auxilios, estabilización de heridos y evacuaciones sanitarias.',
  },
  {
    icono: RadioTower,
    titulo: 'Logística y Comunicaciones',
    descripcion:
      'Transporte de materiales, coordinación tecnológica y apoyo prolongado en operaciones.',
  },
  {
    icono: Handshake,
    titulo: 'Coordinación Interinstitucional',
    descripcion: 'Enlace con bomberos, protección civil y otras fuerzas de emergencia.',
  },
];
