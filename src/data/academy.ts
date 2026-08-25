import {
  ShieldCheck,
  HeartPulse,
  Compass,
  RadioTower,
  Dumbbell,
  Drone,
  Waves,
  Flame,
  Stethoscope,
  Users,
  Siren,
  BrainCircuit,
  Monitor,
  FileUser,
  Megaphone,
  ListChecks,
  Lock,
  type LucideIcon,
} from 'lucide-react';
import type { RangoId } from './escalafon';
import type { UnidadId } from './unidades';

// FASOR Academy: la plataforma formativa de la entidad. Órgano transversal
// dependiente de la Junta Directiva, no una unidad más ni una academia externa.
// Contenido nuevo (no procede de Fasor.tsx). En esta fase la web es informativa:
// sin precios, sin pasarela y sin venta online.

// ---------------------------------------------------------------------------
// 02 · Principios
// ---------------------------------------------------------------------------

// Van antes del catálogo a propósito: responden de antemano a la sospecha de
// «pagar por ascender».
export const principiosAcademy: string[] = [
  'La pertenencia a FASOR es gratuita.',
  'Los rangos no se venden, se ganan por formación, práctica, conducta, compromiso y evaluación.',
  'El itinerario obligatorio de progresión es gratuito; solo las especialidades opcionales son de pago.',
  'Los certificados son internos, salvo homologación oficial externa.',
  'Nadie desempeña funciones sin formación, autorización y supervisión adecuadas.',
  'Los ingresos se reinvierten íntegramente en FASOR.',
];

// ---------------------------------------------------------------------------
// 03 · Itinerario de progresión
// ---------------------------------------------------------------------------

export interface PasoItinerario {
  titulo: string;
  descripcion: string;
  /** Pertenece al tronco gratuito de progresión */
  gratuito: boolean;
  /**
   * Rango del escalafón al que corresponde el paso, cuando lo hay. La divisa
   * se lee de src/data/escalafon.ts: aquí no se redefine ninguna insignia.
   */
  rangoId?: RangoId;
}

export const itinerarioAcademy: PasoItinerario[] = [
  {
    titulo: 'Evaluación de incorporación',
    descripcion:
      'Una valoración inicial sitúa el punto de partida de cada persona según su condición física, su experiencia previa y su disponibilidad real.',
    gratuito: true,
  },
  {
    titulo: 'Cadete en Formación',
    descripcion: 'Ingreso en el escalafón con brazalete amarillo como distintivo de instrucción.',
    gratuito: true,
    rangoId: 'cadete',
  },
  {
    titulo: 'Formación básica común',
    descripcion:
      'El tronco común de la Academy, con seguridad, primeros auxilios, orientación, comunicaciones y preparación física.',
    gratuito: true,
  },
  {
    titulo: 'Prácticas supervisadas',
    descripcion:
      'La instrucción se lleva al terreno en tareas de apoyo y misiones no críticas, siempre bajo mando y supervisión.',
    gratuito: true,
  },
  {
    titulo: 'Evaluación',
    descripcion:
      'Se valoran competencia técnica, conducta y compromiso sostenido. No hay atajos ni plazos que puedan comprarse.',
    gratuito: true,
  },
  {
    titulo: 'Operador Táctico',
    descripcion: 'Formación completa y autonomía operativa bajo mando superior.',
    gratuito: true,
    rangoId: 'operador',
  },
  {
    titulo: 'Especialidades y liderazgo',
    descripcion:
      'A partir de aquí se abren las especialidades operativas, las responsabilidades dentro de una unidad y las funciones de liderazgo.',
    gratuito: false,
  },
];

// ---------------------------------------------------------------------------
// 04 · Catálogo formativo
// ---------------------------------------------------------------------------

export type ModalidadCurso = 'Gratuito' | 'De pago';

export interface CursoAcademy {
  icono: LucideIcon;
  titulo: string;
  descripcion: string;
  /**
   * Unidad en cuyo dominio cae el curso. La declaran también cursos del
   * tronco común, para que aparezcan en el bloque de formación de la vista
   * ampliada de esa unidad (`cursosPorUnidad`). Los cursos realmente
   * transversales y todos los de la escuela abierta no llevan ninguna, esta
   * última porque por definición no da especialidad operativa.
   * El emblema del catálogo se sigue mostrando solo en las especialidades
   * operativas (ver Academy.tsx) y se lee de src/data/unidades.ts: aquí no se
   * duplica ninguna imagen.
   */
  unidadId?: UnidadId;
}

export interface NivelCatalogo {
  id: 'tronco' | 'especialidades' | 'escuela';
  nombre: string;
  modalidad: ModalidadCurso;
  /** Condición de acceso o de obligatoriedad del nivel */
  condicion: string;
  descripcion: string;
  /** Matiz doctrinal del nivel, cuando lo necesita */
  nota?: string;
  cursos: CursoAcademy[];
}

export const catalogoAcademy: NivelCatalogo[] = [
  {
    id: 'tronco',
    nombre: 'Tronco común',
    modalidad: 'Gratuito',
    condicion: 'Obligatorio',
    descripcion:
      'La base que comparte todo miembro de FASOR. Es el itinerario obligatorio de progresión y no cuesta nada.',
    cursos: [
      {
        icono: ShieldCheck,
        titulo: 'Formación básica y de seguridad',
        descripcion: 'Doctrina, disciplina operativa y seguridad personal en intervención.',
      },
      {
        icono: HeartPulse,
        titulo: 'Primeros auxilios',
        unidadId: 'sanitario',
        descripcion: 'Soporte vital básico, control de hemorragias e inmovilización.',
      },
      {
        icono: Compass,
        titulo: 'Orientación y supervivencia',
        unidadId: 'terrestres',
        descripcion: 'Cartografía, navegación terrestre y autonomía prolongada en el medio.',
      },
      {
        icono: RadioTower,
        titulo: 'Comunicaciones y coordinación de equipos',
        unidadId: 'comunicaciones',
        descripcion: 'Radio, protocolos de transmisión y trabajo coordinado en cuadrilla.',
      },
      {
        icono: Dumbbell,
        titulo: 'Preparación física',
        descripcion: 'Acondicionamiento para operar en esfuerzo prolongado y condiciones adversas.',
      },
    ],
  },
  {
    id: 'especialidades',
    nombre: 'Especialidades operativas',
    modalidad: 'De pago',
    condicion: 'Opcional',
    descripcion:
      'Formación avanzada ligada a las unidades, para quien quiere profundizar en un área concreta.',
    nota: 'Dan especialidad interna y pueden ser requisito para desempeñar funciones concretas. Nunca son requisito para un rango.',
    cursos: [
      {
        icono: Drone,
        titulo: 'Drones y apoyo a búsqueda',
        unidadId: 'drones',
        descripcion: 'Pilotaje, planificación de vuelo y apoyo aéreo a batidas y rastreos.',
      },
      {
        icono: Waves,
        titulo: 'Rescate acuático',
        unidadId: 'buceadores',
        descripcion: 'Técnicas de aproximación, extracción y seguridad en medio acuático.',
      },
      {
        icono: Flame,
        titulo: 'Intervención forestal',
        unidadId: 'forestal',
        descripcion:
          'Comportamiento del fuego, herramientas y trabajo de apoyo en incendios forestales.',
      },
      {
        icono: Stethoscope,
        titulo: 'Sanitario avanzado',
        unidadId: 'sanitario',
        descripcion: 'Asistencia en escenarios complejos, triaje y evacuación sanitaria.',
      },
      {
        icono: Users,
        titulo: 'Liderazgo y gestión de equipos',
        descripcion: 'Mando en el terreno, toma de decisiones bajo presión y cuidado del equipo.',
      },
      {
        icono: Siren,
        titulo: 'Simulacros y jornadas prácticas',
        descripcion:
          'Ejercicios integrados que ponen a prueba lo aprendido en condiciones realistas.',
      },
    ],
  },
  {
    id: 'escuela',
    nombre: 'Escuela abierta',
    modalidad: 'De pago',
    condicion: 'Abierta a quien no es socio',
    descripcion:
      'Formación de utilidad general, abierta también a quien no pertenece a FASOR. Se puede cursar sin ningún vínculo previo con la entidad.',
    nota: 'No da rango ni especialidad operativa, es conocimiento aplicable a cualquier trayectoria.',
    cursos: [
      {
        icono: BrainCircuit,
        titulo: 'IA práctica',
        descripcion: 'Uso real de herramientas de inteligencia artificial en el trabajo diario.',
      },
      {
        icono: Monitor,
        titulo: 'Herramientas digitales',
        descripcion: 'Ofimática, gestión documental y flujos de trabajo digitales.',
      },
      {
        icono: FileUser,
        titulo: 'Empleabilidad, CV y entrevistas',
        descripcion: 'Preparación de la candidatura, del currículo y de la entrevista de trabajo.',
      },
      {
        icono: Megaphone,
        titulo: 'Comunicación y oratoria',
        descripcion: 'Hablar en público, estructurar un mensaje y sostenerlo ante una audiencia.',
      },
      {
        icono: ListChecks,
        titulo: 'Productividad y gestión de proyectos',
        descripcion: 'Método de trabajo, planificación y seguimiento de proyectos.',
      },
      {
        icono: Lock,
        titulo: 'Ciberseguridad básica',
        descripcion: 'Higiene digital, contraseñas, fraude por correo y protección de datos.',
      },
    ],
  },
];

/**
 * Cursos del catálogo ligados a una unidad, derivados del propio
 * `catalogoAcademy` por su `unidadId`. Los usa la vista ampliada de
 * /unidades: al leerse del catálogo y no escribirse a mano, la formación
 * que muestra cada unidad no puede divergir de la que publica /academy
 * (mismo criterio que `rangoPorId` con las divisas del escalafón).
 * Las unidades sin curso asociado devuelven una lista vacía.
 */
export function cursosPorUnidad(unidadId: UnidadId): CursoAcademy[] {
  return catalogoAcademy.flatMap((nivel) =>
    nivel.cursos.filter((curso) => curso.unidadId === unidadId)
  );
}

// ---------------------------------------------------------------------------
// 05 · Cuerpo de instructores
// ---------------------------------------------------------------------------

// Instructor es una habilitación, no un rango: se suma al rango sin alterar la
// cadena de mando.
export const requisitosInstructor: string[] = [
  'Rango mínimo de Operador Táctico.',
  'Competencia acreditada en la materia que se pretende impartir.',
  'Aval de FASOR Academy.',
];

export interface NivelInstructor {
  numero: number;
  nombre: string;
  descripcion: string;
}

export const nivelesInstructor: NivelInstructor[] = [
  {
    numero: 1,
    nombre: 'Instructor en Prácticas',
    descripcion:
      'Apoya la impartición de formación bajo la supervisión de un instructor acreditado.',
  },
  {
    numero: 2,
    nombre: 'Instructor',
    descripcion:
      'Imparte formación de forma autónoma dentro de las materias en las que está habilitado.',
  },
  {
    numero: 3,
    nombre: 'Instructor Jefe',
    descripcion: 'Diseña programas, evalúa y acredita a otros instructores.',
  },
];
