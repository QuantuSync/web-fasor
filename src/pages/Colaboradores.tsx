import { useEffect } from 'react';
import { Globe, Camera, Users, Video, Briefcase, Mail, Phone, type LucideIcon } from 'lucide-react';
import TituloSeccion from '../components/TituloSeccion';
import Galon from '../components/Galon';
import CorreoEnlace from '../components/CorreoEnlace';
import {
  colaboradores,
  type EntidadColaboradora,
  type TipoColaborador,
  type EnlaceColaborador,
  type TipoEnlaceColaborador,
} from '../data/colaboradores';

// Etiqueta visible según el tipo de entidad colaboradora
const TIPOS: Record<TipoColaborador, string> = {
  'centro de formación': 'Centro de formación',
  empresa: 'Empresa',
  administración: 'Administración',
  colectivo: 'Colectivo',
};

// lucide-react no trae iconos de marca (Instagram, Facebook, YouTube,
// LinkedIn no existen en esta versión, igual que ya ocurre con GitHub).
// Cada red usa un icono genérico distinto y va siempre acompañada de su
// nombre en texto visible, así que el icono no es la única pista.
const ETIQUETAS_ENLACE: Record<TipoEnlaceColaborador, string> = {
  web: 'Web',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  email: 'Correo',
  telefono: 'Teléfono',
};

const ICONOS_ENLACE: Record<TipoEnlaceColaborador, LucideIcon> = {
  web: Globe,
  instagram: Camera,
  facebook: Users,
  youtube: Video,
  linkedin: Briefcase,
  email: Mail,
  telefono: Phone,
};

// Un enlace de contacto o red social de una entidad colaboradora. El correo
// reutiliza CorreoEnlace (tratamiento único de mailto: del sitio); el resto
// son enlaces propios, con icono + nombre de la red y, si la nota lo trae
// (dos Facebook de una misma entidad, por ejemplo), el matiz que los
// distingue. Área táctil de 44px con separación entre enlaces.
function EnlaceItem({
  entidad,
  enlace,
}: {
  entidad: EntidadColaboradora;
  enlace: EnlaceColaborador;
}) {
  // El «·» separa visualmente etiqueta y nota; en el nombre accesible se lee
  // como coma, más natural para un lector de pantalla.
  const etiquetaVisible = enlace.nota
    ? `${ETIQUETAS_ENLACE[enlace.tipo]} · ${enlace.nota}`
    : ETIQUETAS_ENLACE[enlace.tipo];
  const etiquetaAccesible = enlace.nota
    ? `${ETIQUETAS_ENLACE[enlace.tipo]}, ${enlace.nota}`
    : ETIQUETAS_ENLACE[enlace.tipo];

  if (enlace.tipo === 'email') {
    return (
      <span className="flex min-h-11 items-center">
        <CorreoEnlace email={enlace.valor} />
      </span>
    );
  }

  if (enlace.tipo === 'telefono') {
    return (
      <a
        href={`tel:${enlace.valor}`}
        aria-label={
          enlace.nota ? `Llamar a ${entidad.nombre}, ${enlace.nota}` : `Llamar a ${entidad.nombre}`
        }
        className="flex min-h-11 items-center gap-2 border border-fasor-gold/25 px-3 text-sm text-fasor-bone transition-colors duration-200 hover:border-fasor-gold hover:text-fasor-gold"
      >
        <Phone className="h-4 w-4 shrink-0 text-fasor-gold" aria-hidden="true" />
        {enlace.valor}
      </a>
    );
  }

  const Icono = ICONOS_ENLACE[enlace.tipo];
  const aria =
    enlace.tipo === 'web'
      ? `Ir a la web de ${entidad.nombre}`
      : `${entidad.nombre} en ${etiquetaAccesible}`;

  return (
    <a
      href={enlace.valor}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${aria} (se abre en una pestaña nueva)`}
      className="flex min-h-11 items-center gap-2 border border-fasor-gold/25 px-3 text-sm text-fasor-bone transition-colors duration-200 hover:border-fasor-gold hover:text-fasor-gold"
    >
      <Icono className="h-4 w-4 shrink-0 text-fasor-gold" aria-hidden="true" />
      {etiquetaVisible}
    </a>
  );
}

// Tarjeta plana de una entidad colaboradora: línea superior dorada, logo en
// chip claro (los logos externos llegan con fondo y proporción propios, y no
// pueden recortarse en círculo como los emblemas de FASOR sin deformarlos),
// metadatos en mono, descripción y ámbitos del convenio con galón-bullet.
function TarjetaColaborador({ entidad }: { entidad: EntidadColaboradora }) {
  return (
    <article className="flex h-full flex-col border-t-2 border-fasor-gold bg-fasor-surface p-6 md:p-8">
      <div className="mb-5 flex h-20 items-center justify-center border border-fasor-gold/25 bg-fasor-bone p-3">
        <img
          src={entidad.logo}
          alt={`Logo de ${entidad.nombre}`}
          className="max-h-full max-w-full object-contain"
          loading="lazy"
        />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[11px] tracking-widest">
        <span className="border border-fasor-gold/60 px-2 py-0.5 uppercase text-fasor-gold">
          {TIPOS[entidad.tipo]}
        </span>
        <span className="uppercase text-fasor-sage">
          {entidad.localidad}, {entidad.pais}
        </span>
      </div>

      <h3 className="mb-3 font-display text-xl font-bold uppercase tracking-tight text-fasor-bone">
        {entidad.nombre}
      </h3>

      <p className="m-0 text-sm leading-relaxed text-fasor-sage">{entidad.descripcion}</p>

      <div className="mt-5">
        <p className="etiqueta mb-3">Ámbitos del convenio</p>
        <ul className="m-0 list-none space-y-2 p-0">
          {entidad.ambitos.map((ambito) => (
            <li key={ambito} className="flex items-start gap-3">
              <Galon className="mt-1 h-3 w-2" />
              <span className="text-sm leading-relaxed text-fasor-sage">{ambito}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 border-t border-fasor-line pt-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-fasor-sage">
          Convenio firmado {entidad.fechaFirma}
        </span>

        {entidad.enlaces && entidad.enlaces.length > 0 && (
          <ul className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0">
            {entidad.enlaces.map((enlace, indice) => (
              <li key={`${enlace.tipo}-${indice}`}>
                <EnlaceItem entidad={entidad} enlace={enlace} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

// Entidades colaboradoras: catálogo de entidades externas con convenio de
// colaboración con FASOR, alimentado por src/data/colaboradores.ts.
export default function Colaboradores() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elementsToObserve = document.querySelectorAll('.observe-me');
    elementsToObserve.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div>
      {/* Cabecera de página */}
      <header className="content-container pt-14 md:pt-20">
        <div className="observe-me opacity-0 translate-y-8">
          <p className="etiqueta mb-3">FASOR</p>
          <h1 className="font-display text-5xl font-bold uppercase tracking-tight text-fasor-bone md:text-6xl">
            Entidades Colaboradoras
          </h1>
          <div className="linea-fade mt-6" aria-hidden="true"></div>
        </div>
      </header>

      {/* Qué son */}
      <section className="content-container py-14 md:py-20">
        <div className="observe-me opacity-0 translate-y-8">
          <TituloSeccion numero="01" titulo="Qué son" />
          <p className="max-w-3xl text-lg leading-relaxed text-fasor-sage">
            Son las{' '}
            <strong className="text-fasor-gold">
              entidades con las que FASOR mantiene un convenio de colaboración
            </strong>
            . Cada una es una entidad independiente, con su propia dirección y su propio ámbito de
            actividad, no una delegación ni un centro dependiente de FASOR.
          </p>
        </div>
      </section>

      {/* Las entidades */}
      <section className="banda-superficie">
        <div className="content-container py-14 md:py-20">
          <div className="observe-me opacity-0 translate-y-8">
            <TituloSeccion numero="02" titulo="Las Entidades" />
          </div>

          <div className="observe-me opacity-0 translate-y-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {colaboradores.map((entidad) => (
              <div key={entidad.id} className="max-w-md">
                <TarjetaColaborador entidad={entidad} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
