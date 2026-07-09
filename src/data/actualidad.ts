// Entradas del hub de Actualidad: proyectos propios y noticias de la asociación.
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
    titulo: 'Abeiro — protección ante incendios forestales',
    estado: 'En desarrollo activo',
    fecha: 'Julio de 2026',
    resumen:
      'Herramienta abierta y gratuita que traduce el avance del fuego en decisiones de evacuación por aldea, con datos reales de la comarca piloto de Valdeorras / Larouco (Ourense).',
    enlace: '/abeiro',
  },
];
