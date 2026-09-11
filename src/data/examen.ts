// Banco de preguntas del examen de ingreso de FASOR. Contenido portado del
// documento de origen `examen-ingreso-fasor.md`, en la raíz del repositorio.
//
// IMPORTANTE, ninguna respuesta correcta vive aquí ni en ningún otro archivo
// de `src/`. Este módulo forma parte del bundle del sitio, así que cualquier
// campo que se añadiera aquí viajaría al navegador de cualquier aspirante. La
// clave de corrección vive solo en la base de datos (`examen_clave`), sin
// ningún permiso de lectura para el rol autenticado, y la usa un trigger para
// corregir el examen en el momento de enviarlo, ver `07_examen_ingreso.sql`.
export interface PreguntaExamen {
  /** 1 a 50, mismo número que en el documento de origen y que en `examen_clave` */
  numero: number;
  enunciado: string;
  /** Cuatro opciones, en el mismo orden que a) b) c) d) del documento de origen */
  opciones: [string, string, string, string];
}

export const preguntasExamen: PreguntaExamen[] = [
  {
    numero: 1,
    enunciado:
      'Recibes una orden de tu Teniente de Cuadrilla que no entiendes, en plena intervención.',
    opciones: [
      'La cumples sin más y preguntas cuando acabe la intervención',
      'Pides que te la explique antes de moverte',
      'Haces lo que consideras más razonable según tu criterio',
      'Consultas con un compañero qué hacer',
    ],
  },
  {
    numero: 2,
    enunciado: 'Consideras que una orden que has recibido pone en riesgo directo a tu equipo.',
    opciones: [
      'La cumples, la disciplina está por encima de todo',
      'Te niegas y te retiras de la intervención',
      'Lo comunicas de inmediato a quien te la dio, con claridad y brevedad, y actúas según su respuesta',
      'La cumples a medias, adaptándola por tu cuenta',
    ],
  },
  {
    numero: 3,
    enunciado: 'Tu superior directo no está localizable y hay que tomar una decisión menor.',
    opciones: [
      'Esperas hasta que aparezca',
      'Tomas la decisión y das cuenta en cuanto puedas',
      'Pides a un compañero que decida',
      'Abandonas la tarea',
    ],
  },
  {
    numero: 4,
    enunciado:
      'Un mando de otra unidad te da una instrucción que contradice la de tu propio mando.',
    opciones: [
      'Obedeces al de mayor rango de los dos',
      'Obedeces al de tu unidad e informas de la contradicción',
      'Obedeces al que te lo pidió primero',
      'No haces ninguna de las dos hasta aclararlo',
    ],
  },
  {
    numero: 5,
    enunciado: 'Discrepas de una decisión tomada en asamblea y aprobada por mayoría.',
    opciones: [
      'La acatas y puedes seguir defendiendo tu posición por los cauces internos',
      'La acatas y guardas silencio para siempre',
      'La incumples discretamente',
      'Expones tu desacuerdo públicamente fuera de la entidad',
    ],
  },
  {
    numero: 6,
    enunciado:
      'Te das cuenta de que has cometido un error durante una intervención. Nadie lo ha visto.',
    opciones: [
      'Lo callas, ya no tiene remedio',
      'Lo comentas solo con un compañero de confianza',
      'Lo comunicas a tu mando aunque te perjudique',
      'Esperas a ver si tiene consecuencias',
    ],
  },
  {
    numero: 7,
    enunciado:
      'Un compañero de tu misma cuadrilla incumple sistemáticamente los protocolos de seguridad.',
    opciones: [
      'Lo dejas pasar, no es asunto tuyo',
      'Se lo dices a él y, si no cambia, lo elevas a tu mando',
      'Lo denuncias directamente sin hablar con él',
      'Haces tú lo mismo, si él puede tú también',
    ],
  },
  {
    numero: 8,
    enunciado: 'Se te asigna una tarea que consideras por debajo de tu preparación.',
    opciones: [
      'La haces con la misma diligencia que cualquier otra',
      'Pides que se la den a otro',
      'La haces con desgana',
      'Preguntas por qué te ha tocado a ti',
    ],
  },
  {
    numero: 9,
    enunciado: 'Durante un simulacro, tu mando comete un error evidente delante de todos.',
    opciones: [
      'Lo corriges en el momento y en voz alta',
      'Lo comentas con él en privado al terminar',
      'No dices nada, es su responsabilidad',
      'Lo comentas con el resto del equipo',
    ],
  },
  {
    numero: 10,
    enunciado:
      'Te ofrecen ascender a un puesto de responsabilidad para el que no te sientes preparado.',
    opciones: [
      'Lo aceptas, rechazarlo quedaría mal',
      'Lo rechazas sin explicaciones',
      'Expones con honestidad tus dudas y dejas la decisión al mando',
      'Lo aceptas y disimulas tus carencias',
    ],
  },
  {
    numero: 11,
    enunciado:
      'Antes de entrar en una zona de intervención, detectas que te falta una pieza del equipo de protección.',
    opciones: [
      'Entras igual, el resto del equipo te cubre',
      'Lo comunicas y no entras hasta resolverlo',
      'Entras y procuras no exponerte',
      'Pides prestada la pieza a quien se queda fuera',
    ],
  },
  {
    numero: 12,
    enunciado:
      'El principio de seguridad en toda intervención de emergencia establece un orden de prioridad.',
    opciones: [
      'Víctima, equipo, uno mismo',
      'Uno mismo, equipo, víctima',
      'Equipo, uno mismo, víctima',
      'Todos por igual, sin orden',
    ],
  },
  {
    numero: 13,
    enunciado:
      'Llegas a una zona de intervención y la situación es distinta y peor de lo que se informó.',
    opciones: [
      'Actúas según el plan previsto, ya se corregirá',
      'Comunicas la situación real antes de actuar y esperas instrucciones',
      'Improvisas un plan nuevo por tu cuenta',
      'Te retiras hasta que llegue alguien con más rango',
    ],
  },
  {
    numero: 14,
    enunciado: 'Estás agotado tras muchas horas y queda trabajo por hacer.',
    opciones: [
      'Sigues hasta caer, el compromiso es lo primero',
      'Comunicas tu estado real a tu mando',
      'Disimulas el cansancio para no parecer débil',
      'Te retiras sin avisar',
    ],
  },
  {
    numero: 15,
    enunciado: 'Ves a un compañero realizar una maniobra peligrosa que podría salir bien.',
    opciones: [
      'Lo dejas, si sale bien no hay problema',
      'Lo detienes de inmediato',
      'Esperas a ver el resultado',
      'Lo grabas para comentarlo después',
    ],
  },
  {
    numero: 16,
    enunciado: 'El equipo de protección individual debe revisarse.',
    opciones: [
      'Una vez al año',
      'Cuando se nota que falla',
      'Antes de cada salida',
      'Cuando lo ordena el mando',
    ],
  },
  {
    numero: 17,
    enunciado: 'Durante una intervención nocturna, pierdes contacto visual con tu cuadrilla.',
    opciones: [
      'Continúas avanzando en la dirección acordada',
      'Te detienes, te señalizas e intentas restablecer comunicación',
      'Vuelves solo al punto de partida',
      'Buscas a tus compañeros por tu cuenta',
    ],
  },
  {
    numero: 18,
    enunciado:
      'Se declara la orden de evacuación de la zona y estás a punto de completar una tarea importante.',
    opciones: [
      'Terminas la tarea y sales',
      'Sales de inmediato',
      'Pides permiso para terminar',
      'Sales cuando lo hagan los demás',
    ],
  },
  {
    numero: 19,
    enunciado: 'Detectas un riesgo que nadie más parece haber visto y no hay tiempo de consultar.',
    opciones: [
      'Avisas de inmediato a todo el equipo',
      'Te apartas tú del riesgo',
      'Esperas a confirmar que es real',
      'Se lo dices solo a tu mando por radio privada',
    ],
  },
  {
    numero: 20,
    enunciado: 'Tu estado de salud no es óptimo el día de una activación, aunque podrías aguantar.',
    opciones: [
      'Acudes sin mencionarlo',
      'No acudes y no das explicaciones',
      'Acudes e informas de tu estado para que se te asigne en consecuencia',
      'Acudes y decides tú qué tareas puedes hacer',
    ],
  },
  {
    numero: 21,
    enunciado:
      'Transmites un mensaje por radio en plena intervención. Lo más importante es que sea',
    opciones: [
      'Breve, claro y confirmado por el receptor',
      'Completo y detallado',
      'Rápido, aunque se entienda a medias',
      'Educado y formal',
    ],
  },
  {
    numero: 22,
    enunciado: 'Un compañero nuevo comete errores de novato que ralentizan al equipo.',
    opciones: [
      'Lo apartas de las tareas importantes',
      'Le corriges sobre la marcha y le explicas al terminar',
      'Te quejas a tu mando',
      'Haces tú su parte para ir más rápido',
    ],
  },
  {
    numero: 23,
    enunciado: 'Hay tensión personal entre tú y otro miembro de tu cuadrilla.',
    opciones: [
      'Pides no coincidir con él en ninguna salida',
      'Lo resuelves fuera del servicio y mantienes la profesionalidad dentro',
      'Lo ignoras durante las intervenciones',
      'Lo comentas con el resto del equipo',
    ],
  },
  {
    numero: 24,
    enunciado: 'No has entendido una instrucción transmitida por radio en un entorno ruidoso.',
    opciones: [
      'Haces lo que te ha parecido entender',
      'Pides repetición antes de actuar',
      'Preguntas a un compañero qué ha entendido él',
      'No haces nada y esperas',
    ],
  },
  {
    numero: 25,
    enunciado: 'Se te asigna trabajar con alguien cuyo método no compartes.',
    opciones: [
      'Impones tu método, que es mejor',
      'Trabajáis cada uno por su lado',
      'Acordáis uno antes de empezar y lo mantenéis',
      'Cedes siempre para evitar el conflicto',
    ],
  },
  {
    numero: 26,
    enunciado: 'Una intervención sale mal y el equipo busca responsables.',
    opciones: [
      'Señalas a quien crees que falló',
      'Asumes tu parte y pides que se analice el procedimiento, no a las personas',
      'Te defiendes de antemano',
      'Guardas silencio',
    ],
  },
  {
    numero: 27,
    enunciado: 'Tienes información relevante sobre la intervención que tu mando parece desconocer.',
    opciones: [
      'Se la haces llegar en cuanto puedes',
      'Esperas a que te pregunte',
      'Actúas tú en consecuencia sin decirlo',
      'La comentas con tus compañeros',
    ],
  },
  {
    numero: 28,
    enunciado: 'Durante una intervención larga, el ánimo del equipo decae.',
    opciones: [
      'No es asunto tuyo, cada uno se gestiona',
      'Mantienes tu actitud y apoyas a quien lo necesita, sin forzar euforia',
      'Animas al equipo con bromas constantes',
      'Comentas que la situación es desesperada',
    ],
  },
  {
    numero: 29,
    enunciado: 'Un miembro de otra unidad te pide ayuda con una tarea que no conoces.',
    opciones: [
      'Lo intentas igualmente',
      'Le dices que no sabes y buscas a quien sí',
      'Le dices que no es tu unidad',
      'Le pides que te enseñe sobre la marcha',
    ],
  },
  {
    numero: 30,
    enunciado: 'Al terminar una intervención, el mando convoca un repaso de lo ocurrido.',
    opciones: [
      'Asistes y aportas lo que viste, incluidos tus propios fallos',
      'Asistes y escuchas sin intervenir',
      'Te vas, estás agotado',
      'Asistes y destacas lo que hiciste bien',
    ],
  },
  {
    numero: 31,
    enunciado:
      'Durante una intervención presencias una escena impactante. Un medio de comunicación te pide declaraciones.',
    opciones: [
      'Cuentas lo que viste, es información pública',
      'Remites al portavoz o al mando, sin declarar',
      'Das tu opinión personal',
      'Niegas haber estado allí',
    ],
  },
  {
    numero: 32,
    enunciado: 'Tienes una fotografía de una intervención en la que se reconoce a una víctima.',
    opciones: [
      'La publicas, muestra el trabajo de la entidad',
      'La compartes solo en el grupo interno',
      'No la difundes por ningún canal',
      'La publicas ocultando la cara',
    ],
  },
  {
    numero: 33,
    enunciado: 'Un familiar de una persona atendida te pide información sobre su estado.',
    opciones: [
      'Le cuentas lo que sabes',
      'Le indicas quién puede informarle oficialmente',
      'Le dices que no sabes nada',
      'Le das una versión tranquilizadora',
    ],
  },
  {
    numero: 34,
    enunciado:
      'Atiendes a una persona cuyas ideas o conducta te resultan personalmente reprobables.',
    opciones: [
      'La atiendes igual que a cualquier otra',
      'La atiendes con menos dedicación',
      'Pides que la atienda otro',
      'Le haces saber tu opinión',
    ],
  },
  {
    numero: 35,
    enunciado: 'Encuentras objetos de valor en una zona de intervención.',
    opciones: [
      'Los entregas a tu mando y se registra el hallazgo',
      'Los dejas donde están',
      'Los guardas hasta encontrar al propietario',
      'Los entregas directamente a quien creas que es el dueño',
    ],
  },
  {
    numero: 36,
    enunciado: 'Un conocido tuyo te pide que le cuentes detalles de una intervención reciente.',
    opciones: [
      'Se los cuentas, es alguien de confianza',
      'Le cuentas una versión sin datos identificables',
      'Le explicas que no puedes hablar de eso',
      'Le cuentas solo la parte en la que participaste',
    ],
  },
  {
    numero: 37,
    enunciado: 'Ves a un compañero apropiarse de material de la entidad.',
    opciones: [
      'Se lo comunicas a tu mando',
      'Hablas con él y le das oportunidad de devolverlo',
      'Lo ignoras, no es asunto tuyo',
      'Lo comentas con otros compañeros',
    ],
  },
  {
    numero: 38,
    enunciado: 'Alguien te ofrece un trato de favor por pertenecer a la entidad.',
    opciones: [
      'Lo aceptas, es un gesto de reconocimiento',
      'Lo rechazas y lo comunicas si es relevante',
      'Lo aceptas y no lo mencionas',
      'Lo aceptas en nombre de la entidad',
    ],
  },
  {
    numero: 39,
    enunciado:
      'Durante una intervención, una persona atendida te agradece efusivamente y te ofrece dinero.',
    opciones: [
      'Lo aceptas, es voluntario',
      'Lo rechazas y explicas que el servicio es gratuito',
      'Lo aceptas y lo entregas a la entidad',
      'Lo aceptas para no ofenderla',
    ],
  },
  {
    numero: 40,
    enunciado: 'Detectas que un miembro de la entidad ha falseado su formación o su experiencia.',
    opciones: [
      'Lo comunicas a la Junta Directiva',
      'Hablas con él en privado',
      'Lo ignoras si hace bien su trabajo',
      'Lo comentas con tus compañeros',
    ],
  },
  {
    numero: 41,
    enunciado:
      'En una intervención con víctimas, notas que el impacto emocional te está afectando.',
    opciones: [
      'Lo reprimes y continúas',
      'Lo comunicas a tu mando y pides relevo si es necesario',
      'Te apartas sin avisar',
      'Lo comentas con las víctimas',
    ],
  },
  {
    numero: 42,
    enunciado: 'Días después de una intervención dura, sigues teniendo dificultades para dormir.',
    opciones: [
      'Lo asumes como normal y no haces nada',
      'Lo comunicas y buscas apoyo profesional',
      'Evitas volver a intervenir',
      'Lo compensas con más actividad',
    ],
  },
  {
    numero: 43,
    enunciado: 'Una persona atendida te insulta y te agrede verbalmente durante la asistencia.',
    opciones: [
      'Mantienes la asistencia y la calma',
      'Le respondes para poner límites',
      'Interrumpes la asistencia',
      'Le respondes cuando termine',
    ],
  },
  {
    numero: 44,
    enunciado: 'Cometes un error grave y sientes que has fallado al equipo.',
    opciones: [
      'Lo asumes, lo comunicas y sigues trabajando',
      'Te retiras de la entidad',
      'Lo justificas con las circunstancias',
      'Evitas pensar en ello',
    ],
  },
  {
    numero: 45,
    enunciado: 'En una situación de alta tensión, un mando te grita una orden.',
    opciones: [
      'Cumples la orden y no interpretas el tono',
      'Le pides que te hable con respeto',
      'Te bloqueas',
      'Respondes en el mismo tono',
    ],
  },
  {
    numero: 46,
    enunciado: 'Compruebas que llevas varias activaciones seguidas sin descanso real.',
    opciones: [
      'Continúas mientras el cuerpo aguante',
      'Lo comunicas para que se reorganicen los turnos',
      'Dejas de acudir sin avisar',
      'Acudes pero rindes menos',
    ],
  },
  {
    numero: 47,
    enunciado:
      'Ante una escena que supera con claridad la capacidad de tu equipo, tu reacción debe ser',
    opciones: [
      'Intentarlo de todas formas',
      'Comunicar la situación y solicitar refuerzos antes de actuar',
      'Retirarte',
      'Actuar solo en lo que puedas sin decir nada',
    ],
  },
  {
    numero: 48,
    enunciado: 'Te comprometes a una guardia y surge un plan personal atractivo el mismo día.',
    opciones: [
      'Cancelas la guardia, es voluntariado',
      'Mantienes el compromiso adquirido',
      'Buscas quien te sustituya en el último momento',
      'Acudes tarde',
    ],
  },
  {
    numero: 49,
    enunciado:
      'La formación continua dentro de la entidad supone dedicar tiempo propio de forma regular.',
    opciones: [
      'Asistes a lo obligatorio',
      'La asumes como parte inseparable del compromiso',
      'Asistes cuando te viene bien',
      'Consideras que la experiencia sustituye a la formación',
    ],
  },
  {
    numero: 50,
    enunciado: 'Tu motivación principal para ingresar en FASOR debería ser',
    opciones: [
      'El reconocimiento social y la pertenencia a un cuerpo',
      'La adquisición de formación técnica valiosa',
      'La voluntad de servicio a la comunidad, aceptando la disciplina y el esfuerzo que conlleva',
      'La posibilidad de vivir experiencias intensas',
    ],
  },
];

// Búsqueda de una pregunta por su número, para cruzar con el resultado que
// devuelve la base de datos (respuesta elegida, correcta) sin repetir el
// enunciado en ningún otro sitio.
export function preguntaPorNumero(numero: number): PreguntaExamen {
  const pregunta = preguntasExamen.find((p) => p.numero === numero);
  if (!pregunta) throw new Error(`Pregunta de examen desconocida: ${numero}`);
  return pregunta;
}
