import { useEffect } from 'react';
import { Map, Maximize, Eye, Route } from 'lucide-react';
import TituloSeccion from '../components/TituloSeccion';
import Galon from '../components/Galon';

// Abeiro: proyecto propio de protección ante incendios forestales.
// Información basada en el proyecto y la web reales (abeiro.vercel.app).
// Mapa embebido en escritorio y botón a pantalla completa en móvil.
// Sin avisos ni disclaimers sobre el proyecto (regla editorial del sitio).

// Procedencia de cada dato que usa el proyecto
const FUENTES_DATOS = [
  { fuente: 'IGE', aporta: 'población y demografía por núcleo (envejecimiento, habitantes)' },
  { fuente: 'OpenStreetMap', aporta: 'aldeas, red viaria y edificaciones' },
  { fuente: 'Sentinel-2', aporta: 'estado de la vegetación y del combustible forestal' },
  { fuente: 'EU-DEM', aporta: 'relieve y pendientes del terreno' },
  { fuente: 'Copernicus EMS', aporta: 'perímetros reales de incendios para validación' },
];

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
    <div>
      {/* Cabecera de página */}
      <header className="content-container pt-14 md:pt-20">
        <div className="observe-me opacity-0 translate-y-8">
          <p className="etiqueta mb-3">Proyecto propio · En desarrollo activo</p>
          <h1 className="font-display text-5xl font-bold uppercase tracking-tight text-fasor-bone md:text-6xl">
            Abeiro
          </h1>
          <div className="linea-fade mt-6" aria-hidden="true"></div>
        </div>
      </header>

      {/* Qué es */}
      <section className="content-container py-14 md:py-20">
        <div className="observe-me opacity-0 translate-y-8">
          <TituloSeccion numero="01" titulo="Abeiro — protección ante incendios forestales" />
          <div className="max-w-3xl space-y-5 leading-relaxed">
            <p className="text-fasor-sage">
              <strong className="text-fasor-gold">Abeiro</strong> es un proyecto propio en
              desarrollo activo: una herramienta de protección ante incendios forestales que traduce
              el avance del fuego en decisiones de evacuación por aldea, a partir de datos reales
              (IGE, OpenStreetMap, Sentinel-2). Nace del mismo principio que FASOR: servir y
              proteger a quien lo necesita. Se encuentra en fase de desarrollo y aún no es un
              sistema operativo de emergencias.
            </p>
            <p className="text-fasor-sage">
              «Abeiro» significa <em>refugio</em> o <em>amparo</em> en gallego, y esa es su vocación
              en Galicia: un sistema <strong className="text-fasor-bone">abierto y gratuito</strong>{' '}
              al servicio de quien vive rodeado de monte. Su aportación no es detectar el fuego —
              eso ya lo hacen los satélites y los servicios de emergencias —, sino{' '}
              <strong className="text-fasor-bone">
                traducir su avance en una decisión accionable por aldea y por persona
              </strong>
              : quién debería salir, hacia dónde y con cuánta antelación.
            </p>
          </div>
        </div>
      </section>

      {/* Comarca piloto */}
      <section className="banda-superficie">
        <div className="content-container">
          <div className="observe-me opacity-0 translate-y-8">
            <TituloSeccion
              numero="02"
              titulo="Comarca piloto: Valdeorras / Larouco (Ourense)"
              intro="Abeiro trabaja sobre una comarca real, con un índice de vulnerabilidad calculado para cada núcleo de población y dos lentes intercambiables sobre el mismo mapa:"
            />
          </div>

          <div className="observe-me opacity-0 translate-y-8 grid grid-cols-1 gap-10 md:grid-cols-2">
            <div className="border-l-2 border-fasor-gold pl-6">
              <div className="mb-2 flex items-center gap-3">
                <Eye className="h-5 w-5 text-fasor-gold" aria-hidden="true" />
                <h3 className="m-0 font-display text-lg font-bold uppercase tracking-tight text-fasor-bone">
                  Vulnerabilidad
                </h3>
              </div>
              <p className="m-0 text-sm leading-relaxed text-fasor-sage">
                Cuánto riesgo acumula cada aldea: población y envejecimiento, entorno forestal,
                pendiente del terreno y accesos disponibles.
              </p>
            </div>

            <div className="border-l-2 border-fasor-gold pl-6">
              <div className="mb-2 flex items-center gap-3">
                <Route className="h-5 w-5 text-fasor-gold" aria-hidden="true" />
                <h3 className="m-0 font-display text-lg font-bold uppercase tracking-tight text-fasor-bone">
                  Evacuación
                </h3>
              </div>
              <p className="m-0 text-sm leading-relaxed text-fasor-sage">
                Las rutas reales de salida de cada núcleo, para responder a la pregunta que importa:
                hacia dónde salir y por qué camino.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Datos reales */}
      <section className="banda">
        <div className="content-container">
          <div className="observe-me opacity-0 translate-y-8">
            <TituloSeccion
              numero="03"
              titulo="Datos reales, no de prueba"
              intro="Todo lo que se ve en el mapa procede de fuentes públicas reales:"
            />
          </div>

          <ul className="observe-me opacity-0 translate-y-8 m-0 max-w-3xl list-none space-y-3 p-0">
            {FUENTES_DATOS.map((dato) => (
              <li key={dato.fuente} className="flex items-start gap-3">
                <Galon className="mt-1 h-3 w-2" />
                <span className="text-sm leading-relaxed text-fasor-sage">
                  <strong className="font-mono text-xs uppercase tracking-wider text-fasor-bone">
                    {dato.fuente}
                  </strong>
                  : {dato.aporta}.
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Mapa incrustado */}
      <section className="banda-superficie">
        <div className="content-container">
          <div className="observe-me opacity-0 translate-y-8">
            <TituloSeccion numero="04" titulo="El mapa" />
          </div>

          {/* Escritorio: mapa embebido usable */}
          <div className="observe-me opacity-0 translate-y-8 hidden md:block">
            <div className="overflow-hidden rounded-sm border border-fasor-gold/25">
              <iframe
                src="https://abeiro.vercel.app"
                title="Abeiro — mapa"
                loading="lazy"
                className="h-[600px] w-full"
              ></iframe>
            </div>
            <p className="mt-3 text-center font-mono text-xs tracking-wider text-fasor-sage">
              Abeiro · abeiro.vercel.app
            </p>
          </div>

          {/* Móvil: vista previa + botón a pantalla completa (evita el conflicto zoom/scroll) */}
          <div className="observe-me opacity-0 translate-y-8 md:hidden">
            <div className="flex flex-col items-center rounded-sm border border-fasor-gold/25 p-8 text-center">
              <Map className="mb-3 h-10 w-10 text-fasor-gold" aria-hidden="true" />
              <p className="mb-4 text-sm text-fasor-sage">
                Para una mejor experiencia en el móvil, abre el mapa a pantalla completa.
              </p>
              <a
                href="https://abeiro.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-contorno"
              >
                <Maximize className="h-4 w-4" aria-hidden="true" />
                Abrir mapa a pantalla completa
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
