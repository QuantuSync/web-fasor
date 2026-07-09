import { useEffect } from 'react';
import { Map, Maximize } from 'lucide-react';

// Página de Abeiro: proyecto propio de protección ante incendios forestales.
// Mapa embebido en escritorio y botón a pantalla completa en móvil.
// Contenido portado verbatim de Fasor.tsx (repo de Casa Alaniz).
export default function Abeiro() {
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
            Abeiro
          </h1>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Abeiro - mapa incrustado (demostrador) */}
          <div
            className="card-elegant observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '200ms' }}
          >
            <div className="mb-6 flex items-start space-x-6">
              <div className="flex-shrink-0">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-alanizGold-600 bg-transparent">
                  <Map className="h-5 w-5 text-alanizGold-600" aria-hidden="true" />
                </div>
              </div>
              <div className="flex-1">
                <p className="eyebrow mb-1 text-alanizGold-600/70">
                  Proyecto propio · En desarrollo activo
                </p>
                <h2 className="font-display text-2xl font-semibold text-alanizGold-600">
                  Abeiro — protección ante incendios forestales
                </h2>
              </div>
            </div>

            <div className="space-y-4 leading-relaxed text-parchment-200">
              <p>
                <strong className="text-alanizGold-600">Abeiro</strong> es un proyecto propio en
                desarrollo activo: una herramienta de protección ante incendios forestales que
                traduce el avance del fuego en decisiones de evacuación por aldea, a partir de datos
                reales (IGE, OpenStreetMap, Sentinel-2). Nace del mismo principio que FASOR: servir
                y proteger a quien lo necesita. Se encuentra en fase de desarrollo y aún no es un
                sistema operativo de emergencias.
              </p>
            </div>

            {/* Escritorio: mapa embebido usable */}
            <div className="mt-6 hidden md:block">
              <div className="overflow-hidden rounded-xl border border-alanizGold-600/30 bg-alanizGreen-900/40">
                <iframe
                  src="https://abeiro.vercel.app"
                  title="Abeiro — mapa (demostrador)"
                  loading="lazy"
                  className="h-[600px] w-full"
                ></iframe>
              </div>
              <p className="mt-3 text-center text-sm italic text-parchment-400">
                Abeiro · abeiro.vercel.app
              </p>
            </div>

            {/* Móvil: vista previa + botón a pantalla completa (evita el conflicto zoom/scroll) */}
            <div className="mt-6 md:hidden">
              <div className="stack-centered rounded-xl border border-alanizGold-600/30 bg-alanizGreen-900/40 p-8">
                <Map className="mb-3 h-10 w-10 text-alanizGold-600" aria-hidden="true" />
                <p className="mb-4 text-sm text-parchment-300">
                  Para una mejor experiencia en el móvil, abre el mapa a pantalla completa.
                </p>
                <a
                  href="https://abeiro.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-alaniz"
                >
                  <Maximize className="mr-2 h-5 w-5" aria-hidden="true" />
                  Abrir mapa a pantalla completa
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
