import logoCasber from '../assets/logo-casber.png';

// Entidades colaboradoras: catálogo de entidades externas con las que FASOR
// mantiene convenio de colaboración. Añadir una entrada aquí basta para que
// aparezca en /colaboradores, sin maquetar nada.
export type TipoColaborador = 'centro de formación' | 'empresa' | 'administración' | 'colectivo';

export interface EntidadColaboradora {
  id: string;
  nombre: string;
  tipo: TipoColaborador;
  pais: string;
  localidad: string;
  descripcion: string;
  /** Ámbitos del convenio, en entradas cortas */
  ambitos: string[];
  /** Fecha de firma legible tal cual se muestra (p. ej. 'Septiembre de 2026') */
  fechaFirma: string;
  logo: string;
  /** Enlace externo opcional a la web de la entidad colaboradora */
  enlace?: string;
}

export const colaboradores: EntidadColaboradora[] = [
  {
    id: 'casber',
    nombre: 'Casber',
    tipo: 'centro de formación',
    pais: 'Brasil',
    localidad: 'Caraguatatuba, São Paulo',
    descripcion:
      'Centro de formación profesional brasileño especializado en seguridad laboral, emergencias y atención prehospitalaria.',
    ambitos: ['Colaboración en respuesta ante catástrofes', 'Formación'],
    fechaFirma: 'Septiembre de 2026',
    logo: logoCasber,
  },
];
