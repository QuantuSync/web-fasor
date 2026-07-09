import {
  Dumbbell,
  Wrench,
  Brain,
  Footprints,
  Medal,
  RefreshCw,
  Timer,
  type LucideIcon,
} from 'lucide-react';

// Entrenamiento y preparación: los tres pilares y el programa de entrenamiento.
// Contenido portado verbatim de Fasor.tsx (repo de Casa Alaniz).
export interface PilarEntrenamiento {
  icono: LucideIcon;
  titulo: string;
  descripcion: string;
}

export interface ItemPrograma {
  icono: LucideIcon;
  titulo: string;
  descripcion: string;
}

export const pilaresEntrenamiento: PilarEntrenamiento[] = [
  {
    icono: Dumbbell,
    titulo: 'Condición Física',
    descripcion:
      'Capacidad para operar en escenarios de esfuerzo prolongado y condiciones adversas.',
  },
  {
    icono: Wrench,
    titulo: 'Formación Técnica',
    descripcion:
      'Instrucción en rescate, fortificación, logística, cartografía y primeros auxilios.',
  },
  {
    icono: Brain,
    titulo: 'Fortaleza Mental',
    descripcion: 'Gestión del estrés, toma de decisiones bajo presión y resiliencia psicológica.',
  },
];

export const programaEntrenamiento: ItemPrograma[] = [
  {
    icono: Footprints,
    titulo: 'Simulacros Coordinados',
    descripcion: 'Ejercicios periódicos que integran todas las especialidades',
  },
  {
    icono: Medal,
    titulo: 'Certificaciones Oficiales',
    descripcion: 'Reconocimiento externo de competencias adquiridas',
  },
  {
    icono: RefreshCw,
    titulo: 'Intercambio de Conocimientos',
    descripcion: 'Colaboración con otras fuerzas para aprendizaje continuo',
  },
  {
    icono: Timer,
    titulo: 'Protocolos de Activación',
    descripcion: 'Tiempos de respuesta optimizados y niveles de alerta',
  },
];
