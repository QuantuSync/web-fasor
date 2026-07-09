import { Flame, Waves, Mountain, Siren, Hospital, BarChart3, type LucideIcon } from 'lucide-react';

// Las seis áreas de actuación de FASOR.
// Contenido portado verbatim de Fasor.tsx (repo de Casa Alaniz).
export interface AreaActuacion {
  icono: LucideIcon;
  titulo: string;
  descripcion: string;
}

export const areasActuacion: AreaActuacion[] = [
  {
    icono: Flame,
    titulo: 'Incendios',
    descripcion: 'Forestales y urbanos. Extinción, evacuación y protección de infraestructuras.',
  },
  {
    icono: Waves,
    titulo: 'Inundaciones',
    descripcion: 'Rescate acuático, evacuaciones y control de daños por desbordamientos.',
  },
  {
    icono: Mountain,
    titulo: 'Catástrofes Naturales',
    descripcion: 'Terremotos, tormentas severas y eventos meteorológicos extremos.',
  },
  {
    icono: Siren,
    titulo: 'Emergencias Civiles',
    descripcion: 'Accidentes, colapsos estructurales y situaciones de crisis urbana.',
  },
  {
    icono: Hospital,
    titulo: 'Apoyo Sanitario',
    descripcion: 'Asistencia médica de emergencia y evacuaciones sanitarias.',
  },
  {
    icono: BarChart3,
    titulo: 'Evaluación de Riesgos',
    descripcion: 'Análisis previo de situaciones y planificación de respuesta.',
  },
];
