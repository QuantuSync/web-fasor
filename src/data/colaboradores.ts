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
  /** Enlaces de contacto y redes sociales; ninguno, uno o varios, en cualquier combinación */
  enlaces?: EnlaceColaborador[];
}

export type TipoEnlaceColaborador =
  'web' | 'instagram' | 'facebook' | 'youtube' | 'linkedin' | 'email' | 'telefono';

export interface EnlaceColaborador {
  tipo: TipoEnlaceColaborador;
  /** URL limpia (sin parámetros de seguimiento ni de idioma), o el correo/teléfono tal cual */
  valor: string;
  /** Distingue enlaces del mismo tipo en una misma entidad (p. ej. dos Facebook) */
  nota?: string;
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
    // Sin web propia; los enlaces sociales cubren la presencia online de Casber.
    enlaces: [
      { tipo: 'instagram', valor: 'https://www.instagram.com/casberct_oficial' },
      {
        tipo: 'facebook',
        valor: 'https://www.facebook.com/casberct',
        nota: 'Centro de formación',
      },
      { tipo: 'facebook', valor: 'https://www.facebook.com/casbertercserv', nota: 'Servicios' },
    ],
  },
];
