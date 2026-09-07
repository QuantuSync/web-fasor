// Entradas del hub de Actualidad: proyectos propios y noticias de la entidad.
// Añadir una entrada aquí basta para que aparezca en /actualidad, sin maquetar nada.
export interface EntradaActualidad {
  id: string;
  tipo: 'proyecto' | 'noticia';
  titulo: string;
  /** Estado breve visible en la tarjeta (p. ej. 'En desarrollo activo') */
  estado: string;
  /** Fecha legible tal cual se muestra (p. ej. 'Julio de 2026') */
  fecha: string;
  resumen: string;
  /** Ruta interna (empieza por '/') o URL externa (https://...) */
  enlace: string;
}

export const actualidad: EntradaActualidad[] = [
  {
    id: 'abeiro',
    tipo: 'proyecto',
    titulo: 'Abeiro, protección ante incendios forestales',
    estado: 'En desarrollo activo',
    fecha: 'Julio de 2026',
    resumen:
      'Herramienta abierta y gratuita que traduce el avance del fuego en decisiones de evacuación por aldea, con datos reales de la comarca piloto de Valdeorras / Larouco (Ourense).',
    enlace: '/abeiro',
  },
  {
    id: 'convenio-casber',
    tipo: 'noticia',
    titulo: 'FASOR firma un convenio de colaboración con Casber',
    estado: 'Convenio firmado',
    fecha: 'Septiembre de 2026',
    resumen:
      'FASOR suma a Casber, centro de formación profesional brasileño especializado en seguridad laboral, emergencias y atención prehospitalaria, como primera entidad de su catálogo de entidades colaboradoras.',
    enlace: '/colaboradores',
  },
];
