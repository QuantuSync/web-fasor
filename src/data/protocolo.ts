// El protocolo de activación de FASOR: tres niveles de alerta.
// Los acentos de color de estado (green/amber/red) solo se usan aquí, por convención.
// Contenido portado verbatim de Fasor.tsx (repo de Casa Alaniz).
export interface NivelActivacion {
  numero: number;
  nombre: string;
  /** Clase Tailwind del color del título del nivel */
  colorTitulo: string;
  categoria: string;
  despliegue: string;
  tiempo: string;
  /** El nivel crítico lleva animate-pulse en su insignia */
  critico?: boolean;
}

export const protocoloActivacion: NivelActivacion[] = [
  {
    numero: 1,
    nombre: 'Nivel Verde',
    colorTitulo: 'text-green-300/80',
    categoria: 'Alerta Preventiva',
    despliegue: 'Monitoreo y preparación.',
    tiempo: 'Tiempo de activación: 2-4 horas',
  },
  {
    numero: 2,
    nombre: 'Nivel Ámbar',
    colorTitulo: 'text-amber-300/80',
    categoria: 'Emergencia Moderada',
    despliegue: 'Despliegue parcial.',
    tiempo: 'Tiempo de activación: 30-60 min',
  },
  {
    numero: 3,
    nombre: 'Nivel Rojo',
    colorTitulo: 'text-red-300/80',
    categoria: 'Emergencia Crítica',
    despliegue: 'Movilización total.',
    tiempo: 'Tiempo de activación: 10-15 min',
    critico: true,
  },
];
