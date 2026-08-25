import { Landmark, Users, Award, type LucideIcon } from 'lucide-react';

// Categorías de socios, derechos y deberes según los estatutos de FASOR
// (arts. 15, 16 y 17). Redacción fiel al texto estatutario.
export interface CategoriaSocio {
  icono: LucideIcon;
  nombre: string;
  descripcion: string;
}

export const categoriasSocios: CategoriaSocio[] = [
  {
    icono: Landmark,
    nombre: 'Socios Fundadores',
    descripcion: 'Firmantes del acta constitutiva de la entidad.',
  },
  {
    icono: Users,
    nombre: 'Socios de Número',
    descripcion:
      'Quienes ingresen con posterioridad a la constitución y participen en las actividades ordinarias.',
  },
  {
    icono: Award,
    nombre: 'Socios Honorarios',
    descripcion:
      'Personas físicas o jurídicas que, por sus méritos o aportaciones, reciban tal distinción, sin derecho a voto.',
  },
];

// Derechos de los socios (art. 16 de los estatutos)
export const derechosSocios: string[] = [
  'Participar en la Asamblea con voz y voto (excepto los socios honorarios).',
  'Elegir y ser elegidos para cargos de la entidad.',
  'Acceder a las actividades y formación.',
];

// Deberes de los socios (art. 17 de los estatutos)
export const deberesSocios: string[] = [
  'Cumplir los estatutos y reglamentos internos.',
  'Contribuir al sostenimiento económico con las cuotas aprobadas.',
  'Colaborar en las actividades de la entidad.',
  'Respetar la jerarquía y disciplina de FASOR.',
];
