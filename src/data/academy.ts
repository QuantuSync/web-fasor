import { type RangoId } from './escalafon';

// FASOR Academy: la plataforma formativa de la asociación. Órgano transversal
// dependiente de la Junta Directiva, no una sexta unidad ni una academia externa.
// Contenido nuevo (no procede de Fasor.tsx). En esta fase la web es informativa:
// sin precios, sin pasarela y sin venta online.

// ---------------------------------------------------------------------------
// 02 · Principios
// ---------------------------------------------------------------------------

// Van antes del catálogo a propósito: responden de antemano a la sospecha de
// «pagar por ascender».
export const principiosAcademy: string[] = [
  'La pertenencia a FASOR es gratuita.',
  'Los rangos no se venden: se ganan por formación, práctica, conducta, compromiso y evaluación.',
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
      'Una valoración inicial sitúa el punto de partida de cada persona: condición física, experiencia previa y disponibilidad real.',
    gratuito: true,
  },
  {
    titulo: 'Cadete en Formación',
    descripcion:
      'Se ingresa en el escalafón como Cadete en Formación, con el brazalete amarillo como distintivo de instrucción.',
    gratuito: true,
    rangoId: 'cadete',
  },
  {
    titulo: 'Formación básica común',
    descripcion:
      'El tronco común de la Academy: seguridad, primeros auxilios, orientación, comunicaciones y preparación física.',
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
    descripcion:
      'Superada la evaluación se alcanza el rango de Operador Táctico: formación completa y autonomía bajo mando superior.',
    gratuito: true,
    rangoId: 'operador',
  },
  {
    titulo: 'Especialidades, responsabilidades y liderazgo',
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
  titulo: string;
  descripcion: string;
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
        titulo: 'Formación básica y de seguridad',
        descripcion: 'Doctrina, disciplina operativa y seguridad personal en intervención.',
      },
      {
        titulo: 'Primeros auxilios',
        descripcion: 'Soporte vital básico, control de hemorragias e inmovilización.',
      },
      {
        titulo: 'Orientación y supervivencia',
        descripcion: 'Cartografía, navegación terrestre y autonomía prolongada en el medio.',
      },
      {
        titulo: 'Comunicaciones y coordinación de equipos',
        descripcion: 'Radio, protocolos de transmisión y trabajo coordinado en cuadrilla.',
      },
      {
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
        titulo: 'Drones y apoyo a búsqueda',
        descripcion: 'Pilotaje, planificación de vuelo y apoyo aéreo a batidas y rastreos.',
      },
      {
        titulo: 'Rescate acuático',
        descripcion: 'Técnicas de aproximación, extracción y seguridad en medio acuático.',
      },
      {
        titulo: 'Intervención forestal',
        descripcion:
          'Comportamiento del fuego, herramientas y trabajo de apoyo en incendios forestales.',
      },
      {
        titulo: 'Sanitario avanzado',
        descripcion: 'Asistencia en escenarios complejos, triaje y evacuación sanitaria.',
      },
      {
        titulo: 'Liderazgo y gestión de equipos',
        descripcion: 'Mando en el terreno, toma de decisiones bajo presión y cuidado del equipo.',
      },
      {
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
      'Formación de utilidad general, abierta también a quien no pertenece a FASOR. Se puede cursar sin ningún vínculo previo con la asociación.',
    nota: 'No da rango ni especialidad operativa: es conocimiento aplicable a cualquier trayectoria.',
    cursos: [
      {
        titulo: 'IA práctica',
        descripcion: 'Uso real de herramientas de inteligencia artificial en el trabajo diario.',
      },
      {
        titulo: 'Herramientas digitales',
        descripcion: 'Ofimática, gestión documental y flujos de trabajo digitales.',
      },
      {
        titulo: 'Empleabilidad: CV y entrevistas',
        descripcion: 'Preparación de la candidatura, del currículo y de la entrevista de trabajo.',
      },
      {
        titulo: 'Comunicación y oratoria',
        descripcion: 'Hablar en público, estructurar un mensaje y sostenerlo ante una audiencia.',
      },
      {
        titulo: 'Productividad y gestión de proyectos',
        descripcion: 'Método de trabajo, planificación y seguimiento de proyectos.',
      },
      {
        titulo: 'Ciberseguridad básica',
        descripcion: 'Higiene digital, contraseñas, fraude por correo y protección de datos.',
      },
    ],
  },
];

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
