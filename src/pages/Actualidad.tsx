import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Galon from '../components/Galon';
import { actualidad, type EntradaActualidad } from '../data/actualidad';

// Etiqueta visible según el tipo de entrada
const TIPOS = { proyecto: 'Proyecto', noticia: 'Noticia' } as const;

// Tarjeta plana de una entrada: línea superior dorada, metadatos en mono,
// titular condensado y enlace (interno con Link, externo con <a>).
function TarjetaEntrada({ entrada }: { entrada: EntradaActualidad }) {
  const esInterno = entrada.enlace.startsWith('/');

  const contenidoEnlace = (
    <span className="inline-flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.15em] text-fasor-gold">
      Ver más
      <Galon className="h-3 w-2 transition-transform duration-300 group-hover:translate-x-1" />
    </span>
  );

  return (
    <article className="group border-t-2 border-fasor-gold bg-fasor-surface p-6 transition-colors duration-300 hover:bg-fasor-surface2 md:p-8">
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] tracking-widest">
        <span className="border border-fasor-gold/60 px-2 py-0.5 uppercase text-fasor-gold">
          {TIPOS[entrada.tipo]}
        </span>
        <span className="uppercase text-fasor-sage">{entrada.estado}</span>
        <span className="uppercase text-fasor-sage">{entrada.fecha}</span>
      </div>

      <h2 className="mb-3 font-display text-2xl font-bold uppercase tracking-tight text-fasor-bone">
        {entrada.titulo}
      </h2>
      <p className="mb-5 max-w-3xl text-sm leading-relaxed text-fasor-sage">{entrada.resumen}</p>

      {esInterno ? (
        <Link to={entrada.enlace} aria-label={`Ver más sobre ${entrada.titulo}`}>
          {contenidoEnlace}
        </Link>
      ) : (
        <a
          href={entrada.enlace}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Ver más sobre ${entrada.titulo} (se abre en una pestaña nueva)`}
        >
          {contenidoEnlace}
        </a>
      )}
    </article>
  );
}

// Actualidad: hub de proyectos propios y noticias de FASOR, alimentado por
// src/data/actualidad.ts.
export default function Actualidad() {
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
            Actualidad
          </h1>
          <div className="linea-fade mt-6" aria-hidden="true"></div>
          <p className="mt-6 max-w-2xl leading-relaxed text-fasor-sage">
            La actividad de FASOR: los proyectos propios en los que trabajamos y las noticias de la
            asociación.
          </p>
        </div>
      </header>

      {/* Entradas */}
      <section className="content-container py-14 md:py-20">
        <div className="observe-me opacity-0 translate-y-8 max-w-4xl space-y-8">
          {actualidad.map((entrada) => (
            <TarjetaEntrada key={entrada.id} entrada={entrada} />
          ))}
        </div>
      </section>
    </div>
  );
}
