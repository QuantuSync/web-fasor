import { useEffect } from 'react';
import SectionHeading from '../components/SectionHeading';
import { unidades } from '../data/unidades';
import { areasActuacion } from '../data/areas';

// Página de Unidades: las cinco unidades especializadas con sus logos y las
// seis áreas de actuación. Contenido portado verbatim de Fasor.tsx (repo de Casa Alaniz).
export default function Unidades() {
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
        <div className="observe-me opacity-0 translate-y-8">
          <h1 className="stack-centered mb-12 font-display text-4xl font-bold text-alanizGold-600 md:text-5xl">
            Unidades
          </h1>
        </div>

        <div className="max-w-5xl mx-auto space-y-12">
          <div
            className="card-elegant bg-gradient-to-r from-alanizGreen-800/80 to-alanizGreen-900/80 border-2 border-alanizGold-600/40 observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '200ms' }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-display font-bold text-alanizGold-600 mb-6">
                Unidades Especializadas
              </h2>
              <p className="text-lg text-parchment-100 leading-relaxed">
                FASOR se organiza en{' '}
                <strong className="text-alanizGold-600">cinco unidades especializadas</strong>, cada
                una con capacidades específicas que garantizan una respuesta integral ante cualquier
                emergencia.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {unidades.map((unidad) => (
                <div
                  key={unidad.id}
                  className="stack-centered rounded-xl border border-alanizGold-600/30 bg-alanizGreen-900/40 p-6 transition-all duration-300 hover:border-alanizGold-600/60"
                >
                  <div className="mb-4 inline-flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-alanizGold-600/40 bg-alanizGreen-900 shadow-lg">
                    <img
                      src={unidad.logo}
                      alt={`Logo ${unidad.nombre} - FASOR`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-semibold text-alanizGold-500">
                    {unidad.nombre}
                  </h3>
                  <p className="text-sm leading-relaxed text-parchment-300">{unidad.descripcion}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="observe-me opacity-0 translate-y-8" style={{ animationDelay: '400ms' }}>
            <SectionHeading title="Áreas de Actuación" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {areasActuacion.map((area) => (
                <div key={area.titulo} className="card-elegant">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 border-2 border-alanizGold-600 bg-transparent rounded-full flex-shrink-0">
                      <area.icono className="w-5 h-5 text-alanizGold-600" aria-hidden="true" />
                    </div>
                    <h3 className="font-display font-semibold text-alanizGold-500">
                      {area.titulo}
                    </h3>
                  </div>
                  <p className="text-sm text-parchment-300">{area.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
