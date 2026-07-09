import { useEffect } from 'react';
// GitBranch y no Github: lucide retiró los iconos de marca en esta versión
import {
  Map,
  Maximize,
  MapPin,
  Database,
  Eye,
  Route,
  AlertTriangle,
  GitBranch,
} from 'lucide-react';

// Página de Abeiro: proyecto propio de protección ante incendios forestales.
// Información basada en el repo y la web reales (github.com/QuantuSync/abeiro ·
// abeiro.vercel.app). Mapa embebido en escritorio y botón a pantalla completa en móvil.
// La advertencia de que es un demostrador debe mantenerse SIEMPRE.

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
    <div className="min-h-screen py-16 md:py-24">
      <div className="content-container">
        <div className="observe-me opacity-0 translate-y-8">
          <h1 className="stack-centered mb-12 font-display text-4xl font-bold text-alanizGold-600 md:text-5xl">
            Abeiro
          </h1>
        </div>

        <div className="max-w-5xl mx-auto space-y-12">
          {/* Qué es */}
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
              <p>
                «Abeiro» significa <em>refugio</em> o <em>amparo</em> en gallego, y esa es su
                vocación en Galicia: un sistema{' '}
                <strong className="text-alanizGold-500">abierto y gratuito</strong> al servicio de
                quien vive rodeado de monte. Su aportación no es detectar el fuego — eso ya lo hacen
                los satélites y los servicios de emergencias —, sino{' '}
                <strong className="text-alanizGold-500">
                  traducir su avance en una decisión accionable por aldea y por persona
                </strong>
                : quién debería salir, hacia dónde y con cuánta antelación.
              </p>
            </div>
          </div>

          {/* Comarca piloto */}
          <div
            className="card-elegant observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '300ms' }}
          >
            <h2 className="mb-4 flex items-center font-display text-2xl font-semibold text-alanizGold-600">
              <MapPin className="mr-3 h-6 w-6 shrink-0 text-alanizGold-600" aria-hidden="true" />
              Comarca piloto: Valdeorras / Larouco (Ourense)
            </h2>
            <p className="mb-6 leading-relaxed text-parchment-200">
              El demostrador trabaja sobre una comarca real, con un índice de vulnerabilidad
              calculado para cada núcleo de población y dos lentes intercambiables sobre el mismo
              mapa:
            </p>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-alanizGreen-900/50 rounded-lg p-6 border border-alanizGold-600/30">
                <h3 className="mb-3 flex items-center font-display font-semibold text-alanizGold-500">
                  <Eye className="mr-2 h-5 w-5 text-alanizGold-600" aria-hidden="true" />
                  Vulnerabilidad
                </h3>
                <p className="text-sm leading-relaxed text-parchment-300">
                  Cuánto riesgo acumula cada aldea: población y envejecimiento, entorno forestal,
                  pendiente del terreno y accesos disponibles.
                </p>
              </div>

              <div className="bg-alanizGreen-900/50 rounded-lg p-6 border border-alanizGold-600/30">
                <h3 className="mb-3 flex items-center font-display font-semibold text-alanizGold-500">
                  <Route className="mr-2 h-5 w-5 text-alanizGold-600" aria-hidden="true" />
                  Evacuación
                </h3>
                <p className="text-sm leading-relaxed text-parchment-300">
                  Las rutas reales de salida de cada núcleo, para responder a la pregunta que
                  importa: hacia dónde salir y por qué camino.
                </p>
              </div>
            </div>
          </div>

          {/* Datos reales */}
          <div
            className="card-elegant observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '400ms' }}
          >
            <h2 className="mb-4 flex items-center font-display text-2xl font-semibold text-alanizGold-600">
              <Database className="mr-3 h-6 w-6 shrink-0 text-alanizGold-600" aria-hidden="true" />
              Datos reales, no de prueba
            </h2>
            <p className="mb-6 leading-relaxed text-parchment-200">
              Todo lo que se ve en el mapa procede de fuentes públicas reales:
            </p>
            <ul className="space-y-3">
              {FUENTES_DATOS.map((dato) => (
                <li key={dato.fuente} className="flex items-start gap-3">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-alanizGold-600"
                    aria-hidden="true"
                  ></span>
                  <span className="text-sm leading-relaxed text-parchment-300">
                    <strong className="text-alanizGold-500">{dato.fuente}</strong>: {dato.aporta}.
                  </span>
                </li>
              ))}
            </ul>

            {/* Advertencia: mantener SIEMPRE, destacada */}
            <div
              className="mt-8 rounded-lg border-l-4 border-alanizGold-600 bg-alanizGold-600/10 p-6"
              role="note"
            >
              <p className="m-0 flex items-start gap-3 text-sm leading-relaxed text-parchment-100">
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0 text-alanizGold-500"
                  aria-hidden="true"
                />
                <span>
                  <strong className="text-alanizGold-400">
                    Abeiro es un demostrador, no una herramienta operativa.
                  </strong>{' '}
                  Los pesos del índice de vulnerabilidad son provisionales y no debe usarse como
                  única base para decisiones operativas reales.
                </span>
              </p>
            </div>

            <div className="stack-centered mt-8">
              <a
                href="https://github.com/QuantuSync/abeiro"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <GitBranch className="mr-2 h-5 w-5" aria-hidden="true" />
                Ver el repositorio en GitHub
              </a>
            </div>
          </div>

          {/* Abeiro - mapa incrustado (demostrador) */}
          <div
            className="card-elegant observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '500ms' }}
          >
            <h2 className="mb-4 font-display text-2xl font-semibold text-alanizGold-600">
              El mapa
            </h2>

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
