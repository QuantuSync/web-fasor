// El escalafón oficial de FASOR: cinco rangos con su divisa (estrellas para mando,
// galones para tropa). Contenido portado verbatim de Fasor.tsx (repo de Casa Alaniz).
export interface Rango {
  nombre: string;
  descripcion: string;
  insignia: { tipo: 'estrellas' | 'galones'; numero: number };
}

export const escalafon: Rango[] = [
  {
    nombre: '1. Comandante',
    descripcion:
      'Máxima autoridad operativa y doctrinal. Dirige la estrategia general, aprueba despliegues y representa a FASOR ante organismos oficiales.',
    insignia: { tipo: 'estrellas', numero: 3 },
  },
  {
    nombre: '2. Capitán de Unidad',
    descripcion:
      'Mando superior sobre una Unidad Operativa (por territorio o especialidad). Coordina múltiples equipos, autoriza intervenciones y lidera misiones complejas.',
    insignia: { tipo: 'estrellas', numero: 2 },
  },
  {
    nombre: '3. Teniente de Cuadrilla',
    descripcion:
      'Mando directo sobre una cuadrilla de intervención. Ejecuta órdenes del Capitán, lidera en el terreno y asegura disciplina y eficacia en situaciones reales.',
    insignia: { tipo: 'estrellas', numero: 1 },
  },
  {
    nombre: '4. Operador Táctico',
    descripcion:
      'Miembro con formación completa y certificación operativa. Actúa con autonomía bajo mando superior. Es la fuerza viva de FASOR.',
    insignia: { tipo: 'galones', numero: 2 },
  },
  {
    nombre: '5. Cadete en Formación',
    descripcion:
      'Integrante en fase de instrucción. Participa en tareas de apoyo, prácticas y misiones no críticas. Asimila doctrina, técnica y espíritu de la organización.',
    insignia: { tipo: 'galones', numero: 1 },
  },
];
