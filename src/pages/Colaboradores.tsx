import { useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import TituloSeccion from '../components/TituloSeccion';
import Galon from '../components/Galon';
import {
  colaboradores,
  type EntidadColaboradora,
  type TipoColaborador,
} from '../data/colaboradores';

// Etiqueta visible según el tipo de entidad colaboradora
const TIPOS: Record<TipoColaborador, string> = {
  'centro de formación': 'Centro de formación',
  empresa: 'Empresa',
  administración: 'Administración',
  colectivo: 'Colectivo',
};

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

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-fasor-line pt-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-fasor-sage">
          Convenio firmado {entidad.fechaFirma}
        </span>
        {entidad.enlace && (
          <a
            href={entidad.enlace}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ir a la web de ${entidad.nombre} (se abre en una pestaña nueva)`}
            className="inline-flex items-center gap-1.5 font-display text-xs font-semibold uppercase
                       tracking-[0.15em] text-fasor-gold transition-colors duration-200 hover:text-fasor-bone"
          >
            Ver web
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
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
