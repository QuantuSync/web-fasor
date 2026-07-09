import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { Scale, Handshake, Zap, Shield } from 'lucide-react';
import { SITE_URL } from '../config';
import fasorLogo from '../assets/fasor.jpg';

// Datos estructurados de la organización (JSON-LD, solo en la home)
const DATOS_ORGANIZACION = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'NGO',
  name: 'FASOR – Fuerza de Auxilio, Soporte y Rescate',
  alternateName: 'FASOR',
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.png`,
  foundingDate: '2025-08-29',
  identifier: [
    {
      '@type': 'PropertyValue',
      propertyID:
        'Registro de Asociaciones de la Delegación Territorial de Valladolid (sección Primera)',
      value: '0006429',
    },
    { '@type': 'PropertyValue', propertyID: 'NIF', value: 'G93758183' },
  ],
});

// Página de Inicio: hero completo (sello, wordmark, presentación, badge operativo),
// Misión Principal con los cuatro valores y CTAs a Unidades y Únete.
// Contenido portado verbatim de Fasor.tsx (repo de Casa Alaniz).
export default function Home() {
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
      <Head>
        <script type="application/ld+json">{DATOS_ORGANIZACION}</script>
      </Head>
      <div className="content-container">
        <div className="stack-centered mb-16 observe-me opacity-0 translate-y-8">
          <div className="inline-flex items-center justify-center w-60 h-60 border-4 border-alanizGold-600/40 bg-transparent rounded-full mb-8 overflow-hidden">
            <img
              src={fasorLogo}
              alt="Logo FASOR - Fuerza de Auxilio, Soporte y Rescate"
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>

          <h1
            className="text-4xl xs:text-5xl md:text-7xl font-bold text-alanizGold-600 mb-4 tracking-wider drop-shadow-lg"
            style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
          >
            FASOR
          </h1>

          <h2 className="text-2xl md:text-3xl font-display font-semibold text-alanizGold-600 mb-6">
            Fuerza de Auxilio, Soporte y Rescate
          </h2>

          <div className="rule-gold mx-auto my-6" aria-hidden="true"></div>

          <div className="text-lg text-parchment-300 max-w-4xl mx-auto leading-relaxed mb-6 space-y-4">
            <p>
              La Fuerza de Auxilio, Soporte y Rescate (FASOR) es una{' '}
              <strong className="text-alanizGold-500">ONG</strong> impulsada por la{' '}
              <strong className="text-alanizGold-500">Casa Alaniz</strong> con un objetivo claro:
              ayudar y proteger a la comunidad cuando más lo necesita. No es una idea abstracta,
              sino una respuesta a problemas reales.
            </p>
            <p>
              Incendios, inundaciones, terremotos y temporales son cada vez más frecuentes. Frente a
              ellos hace falta contar con organizaciones civiles preparadas, disciplinadas y
              comprometidas.
            </p>
            <p>
              FASOR responde a esa necesidad: estar preparados para actuar con decisión allí donde
              se necesita ayuda.
            </p>
            <p>
              Más que una organización, FASOR es un compromiso con la comunidad: estar presentes y
              echar una mano cuando llega la adversidad.
            </p>
          </div>

          <div className="inline-flex items-center px-5 sm:px-6 py-3 border border-alanizGold-600/40 bg-alanizGreen-900/60 text-alanizGold-500 rounded-full font-bold text-base sm:text-lg shadow-lg">
            <span
              className="w-3 h-3 shrink-0 bg-alanizGold-500 rounded-full mr-3 animate-ping"
              aria-hidden="true"
            ></span>
            <span className="sr-only">Estado actual: </span>
            OPERATIVO - EN SERVICIO
          </div>
        </div>

        <div className="max-w-5xl mx-auto space-y-12">
          <div
            className="card-elegant bg-gradient-to-r from-alanizGreen-800/80 to-alanizGreen-900/80 border-2 border-alanizGold-600/40 observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '200ms' }}
          >
            <div className="stack-centered mb-8">
              <h3 className="text-3xl font-display font-bold text-alanizGold-600 mb-6">
                Misión Principal
              </h3>
              <p className="text-xl text-parchment-100 leading-relaxed text-center">
                <strong className="text-alanizGold-400">
                  Estar presentes donde se necesita ayuda
                </strong>
                : incendios, inundaciones, catástrofes naturales y otras emergencias.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
              <div className="stack-centered">
                <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-alanizGold-600 bg-transparent rounded-full mb-4">
                  <Scale className="w-6 h-6 text-alanizGold-600" aria-hidden="true" />
                </div>
                <h4 className="font-display font-semibold text-alanizGold-400 mb-2">Disciplina</h4>
                <p className="text-sm text-parchment-300 text-center">
                  Orden y método en cada actuación
                </p>
              </div>

              <div className="stack-centered">
                <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-alanizGold-600 bg-transparent rounded-full mb-4">
                  <Handshake className="w-6 h-6 text-alanizGold-600" aria-hidden="true" />
                </div>
                <h4 className="font-display font-semibold text-alanizGold-400 mb-2">
                  Coordinación
                </h4>
                <p className="text-sm text-parchment-300 text-center">Trabajo en equipo efectivo</p>
              </div>

              <div className="stack-centered">
                <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-alanizGold-600 bg-transparent rounded-full mb-4">
                  <Zap className="w-6 h-6 text-alanizGold-600" aria-hidden="true" />
                </div>
                <h4 className="font-display font-semibold text-alanizGold-400 mb-2">Sacrificio</h4>
                <p className="text-sm text-parchment-300 text-center">Entrega total al servicio</p>
              </div>

              <div className="stack-centered">
                <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-alanizGold-600 bg-transparent rounded-full mb-4">
                  <Shield className="w-6 h-6 text-alanizGold-600" aria-hidden="true" />
                </div>
                <h4 className="font-display font-semibold text-alanizGold-400 mb-2">Fidelidad</h4>
                <p className="text-sm text-parchment-300 text-center">
                  Lealtad inquebrantable al pueblo
                </p>
              </div>
            </div>
          </div>

          {/* CTAs a las secciones principales del sitio */}
          <div
            className="stack-centered observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '400ms' }}
          >
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/unidades" className="btn-alaniz">
                Conoce nuestras Unidades
              </Link>
              <Link to="/unete" className="btn-secondary">
                Únete a FASOR
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
