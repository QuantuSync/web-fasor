import { useCallback, useEffect, useState } from 'react';
import { Maximize2 } from 'lucide-react';
import TituloSeccion from '../components/TituloSeccion';
import Galon from '../components/Galon';
import UnidadAmpliada from '../components/UnidadAmpliada';
import { unidades, type UnidadId } from '../data/unidades';
import { areasActuacion } from '../data/areas';

// Unidades: grid de tarjetas planas con línea superior dorada para las seis
// unidades, y las áreas de actuación como retícula compacta con galón-bullet.
// Cada tarjeta es un botón real que abre la vista ampliada de su unidad.
// Contenido textual verbatim de Fasor.tsx (repo de Casa Alaniz).
export default function Unidades() {
  const [unidadAbierta, setUnidadAbierta] = useState<UnidadId | null>(null);
  const cerrarAmpliada = useCallback(() => setUnidadAbierta(null), []);
  const ampliada = unidades.find((u) => u.id === unidadAbierta) ?? null;

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
            Unidades
          </h1>
          <div className="linea-fade mt-6" aria-hidden="true"></div>
        </div>
      </header>

      {/* Unidades especializadas */}
      <section className="content-container py-14 md:py-20">
        <div className="observe-me opacity-0 translate-y-8">
          <TituloSeccion numero="01" titulo="Unidades Especializadas" />
          <p className="max-w-3xl text-lg leading-relaxed text-fasor-sage">
            FASOR se organiza en{' '}
            <strong className="text-fasor-gold">seis unidades especializadas</strong>, cada una con
            capacidades específicas que garantizan una respuesta integral ante cualquier emergencia.
          </p>
        </div>

        <div className="observe-me opacity-0 translate-y-8 mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {unidades.map((unidad) => (
            <button
              key={unidad.id}
              type="button"
              onClick={() => setUnidadAbierta(unidad.id)}
              aria-haspopup="dialog"
              aria-labelledby={`unidad-${unidad.id}`}
              aria-describedby={`unidad-${unidad.id}-desc`}
              className="flex h-full flex-col items-start border-t-2 border-fasor-gold bg-fasor-surface
                         p-6 text-left transition-colors duration-300 hover:bg-fasor-surface2"
            >
              <img
                src={unidad.logo}
                alt=""
                width={80}
                height={80}
                className="mb-4 h-20 w-20 rounded-full border border-fasor-gold/40 object-cover"
                loading="lazy"
              />
              <h3
                id={`unidad-${unidad.id}`}
                className="mb-2 font-display text-lg font-bold uppercase tracking-tight text-fasor-bone"
              >
                {unidad.nombre}
              </h3>
              <p
                id={`unidad-${unidad.id}-desc`}
                className="m-0 text-sm leading-relaxed text-fasor-sage"
              >
                {unidad.descripcion}
              </p>
              <span
                className="etiqueta mt-auto inline-flex items-center gap-2 pt-4"
                aria-hidden="true"
              >
                <Maximize2 size={14} />
                Ampliar
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Áreas de actuación */}
      <section className="banda-superficie">
        <div className="content-container">
          <div className="observe-me opacity-0 translate-y-8">
            <TituloSeccion numero="02" titulo="Áreas de Actuación" />
          </div>

          <div className="observe-me opacity-0 translate-y-8 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {areasActuacion.map((area) => (
              <div key={area.titulo} className="border-t border-fasor-line pt-5">
                <div className="mb-2 flex items-center gap-2.5">
                  <Galon />
                  <h3 className="m-0 font-display text-base font-bold uppercase tracking-tight text-fasor-bone">
                    {area.titulo}
                  </h3>
                </div>
                <p className="m-0 text-sm leading-relaxed text-fasor-sage">{area.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vista ampliada de la unidad seleccionada */}
      {ampliada && <UnidadAmpliada unidad={ampliada} onCerrar={cerrarAmpliada} />}
    </div>
  );
}
