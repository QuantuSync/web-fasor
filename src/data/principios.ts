import { Zap, Handshake, Target, type LucideIcon } from 'lucide-react';

// Los tres principios operativos de FASOR.
// Contenido portado verbatim de Fasor.tsx (repo de Casa Alaniz).
export interface PrincipioOperativo {
  icono: LucideIcon;
  titulo: string;
  descripcion: string;
}

export const principiosOperativos: PrincipioOperativo[] = [
  {
    icono: Zap,
    titulo: 'Respuesta Rápida y Coordinada',
    descripcion:
      'Cada segundo cuenta en una emergencia. FASOR mantiene equipos en estado de alerta permanente, con protocolos claros que permiten la movilización inmediata y la coordinación efectiva con otros organismos de emergencia.',
  },
  {
    icono: Handshake,
    titulo: 'Colaboración Institucional',
    descripcion:
      'La cooperación con instituciones públicas y privadas es fundamental. FASOR actúa como fuerza de apoyo complementaria, nunca en competencia, fortaleciendo la red de protección civil existente.',
  },
  {
    icono: Target,
    titulo: 'Eficacia y Profesionalidad',
    descripcion:
      'Cada intervención se ejecuta con método y precisión. La preparación continua y el entrenamiento especializado garantizan que cada miembro de FASOR pueda actuar con la máxima eficacia cuando la situación lo requiera.',
  },
];
