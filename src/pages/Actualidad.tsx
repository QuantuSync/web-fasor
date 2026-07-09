import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, Newspaper, CalendarDays, Activity, ArrowRight } from 'lucide-react';
import { actualidad, type EntradaActualidad } from '../data/actualidad';

// Etiqueta visible según el tipo de entrada
const TIPOS = {
  proyecto: { etiqueta: 'Proyecto', icono: FlaskConical },
  noticia: { etiqueta: 'Noticia', icono: Newspaper },
} as const;

// Tarjeta de una entrada: badge de tipo, estado, fecha, resumen y enlace
// (interno con Link, externo con <a>).
function TarjetaEntrada({ entrada }: { entrada: EntradaActualidad }) {
  const tipo = TIPOS[entrada.tipo];
  const esInterno = entrada.enlace.startsWith('/');

  const contenidoEnlace = (
    <span className="inline-flex items-center gap-2 font-semibold text-alanizGold-500 transition-colors duration-200 group-hover:text-alanizGold-400">
      Ver más
      <ArrowRight
        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
        aria-hidden="true"
      />
    </span>
  );

  return (
    <article className="card-elegant group">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-alanizGold-600 bg-transparent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-alanizGold-500">
          <tipo.icono className="h-3.5 w-3.5" aria-hidden="true" />
          {tipo.etiqueta}
        </span>
        <span className="inline-flex items-center gap-2 text-xs text-parchment-300">
          <Activity className="h-3.5 w-3.5 text-alanizGold-600" aria-hidden="true" />
          {entrada.estado}
        </span>
        <span className="inline-flex items-center gap-2 text-xs text-parchment-300">
          <CalendarDays className="h-3.5 w-3.5 text-alanizGold-600" aria-hidden="true" />
          {entrada.fecha}
        </span>
      </div>

      <h2 className="mb-3 font-display text-xl font-semibold text-alanizGold-600">
        {entrada.titulo}
      </h2>
      <p className="mb-4 text-sm leading-relaxed text-parchment-300">{entrada.resumen}</p>

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

// Página de Actualidad: hub de proyectos propios y noticias de FASOR,
// alimentado por src/data/actualidad.ts.
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
    <div className="min-h-screen py-16 md:py-24">
      <div className="content-container">
        <div className="stack-centered mb-12 observe-me opacity-0 translate-y-8">
          <h1 className="font-display text-4xl font-bold text-alanizGold-600 md:text-5xl">
            Actualidad
          </h1>
          <div className="rule-gold mt-4" aria-hidden="true"></div>
          <p className="mt-4 max-w-2xl text-center text-lg leading-relaxed text-parchment-300">
            La actividad de FASOR: los proyectos propios en los que trabajamos y las noticias de la
            asociación.
          </p>
        </div>

        <div
          className="max-w-3xl mx-auto space-y-8 observe-me opacity-0 translate-y-8"
          style={{ animationDelay: '200ms' }}
        >
          {actualidad.map((entrada) => (
            <TarjetaEntrada key={entrada.id} entrada={entrada} />
          ))}
        </div>
      </div>
    </div>
  );
}
