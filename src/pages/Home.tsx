import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { Scale, Handshake, Zap, Shield } from 'lucide-react';
import { SITE_URL } from '../config';
import fasorLogo from '../assets/fasor.jpg';
import Galon from '../components/Galon';
import TituloSeccion from '../components/TituloSeccion';
import BarraEstado from '../components/BarraEstado';

// Datos estructurados de la organización (JSON-LD, solo en la home)
const DATOS_ORGANIZACION = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'NGO',
  name: 'FASOR, Fuerza de Auxilio, Soporte y Rescate',
  alternateName: 'FASOR',
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.png`,
  foundingDate: '2025-08-29',
  identifier: [
    {
      '@type': 'PropertyValue',
      propertyID: 'Número de registro (sección Primera)',
      value: '0006429',
    },
    { '@type': 'PropertyValue', propertyID: 'NIF', value: 'G93758183' },
  ],
});

// Los cuatro valores de la Misión Principal (texto verbatim)
const VALORES = [
  { icono: Scale, nombre: 'Disciplina', descripcion: 'Orden y método en cada actuación' },
  { icono: Handshake, nombre: 'Coordinación', descripcion: 'Trabajo en equipo efectivo' },
  { icono: Zap, nombre: 'Sacrificio', descripcion: 'Entrega total al servicio' },
  { icono: Shield, nombre: 'Fidelidad', descripcion: 'Lealtad inquebrantable al pueblo' },
];

// Inicio: hero editorial asimétrico (etiqueta dorada, wordmark condensado enorme,
// CTA de contorno, línea que se desvanece, sello circular), barra de estado
// operativo, presentación y Misión Principal con los cuatro valores.
// Contenido textual verbatim de Fasor.tsx (repo de Casa Alaniz).
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
    <div>
      <Head>
        <script type="application/ld+json">{DATOS_ORGANIZACION}</script>
      </Head>

      {/* Hero */}
      <section className="fondo-galones">
        <div className="content-container py-16 md:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr,auto]">
            <div className="observe-me opacity-0 translate-y-8">
              <p className="etiqueta mb-4">Fuerza de Auxilio, Soporte y Rescate</p>
              <h1 className="font-display text-7xl font-bold uppercase leading-none tracking-tight text-fasor-bone sm:text-8xl md:text-9xl">
                FASOR
              </h1>
              <div className="linea-fade mt-6 max-w-xl" aria-hidden="true"></div>
              <p className="mt-6 max-w-xl text-lg italic leading-relaxed text-fasor-sage">
                «Donde la memoria arde, también nace la fuerza de proteger.»
              </p>
              <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Link to="/unidades" className="btn-contorno">
                  Conoce nuestras Unidades
                </Link>
                <Link
                  to="/unete"
                  className="group inline-flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.15em] text-fasor-gold"
                >
                  Únete a FASOR
                  <Galon className="h-3 w-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            <div className="observe-me opacity-0 translate-y-8 justify-self-center lg:justify-self-end">
              <img
                src={fasorLogo}
                alt="Sello de FASOR, Fuerza de Auxilio, Soporte y Rescate"
                width={936}
                height={936}
                className="h-48 w-48 rounded-full border border-fasor-gold/40 object-cover sm:h-56 sm:w-56 lg:h-64 lg:w-64"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Barra de estado operativo */}
      <BarraEstado />

      {/* Presentación */}
      <section className="banda border-t-0">
        <div className="content-container">
          <div className="observe-me opacity-0 translate-y-8 max-w-3xl space-y-5 leading-relaxed">
            <p className="text-lg text-fasor-bone">
              La Fuerza de Auxilio, Soporte y Rescate (FASOR) es una{' '}
              <strong className="text-fasor-gold">ONG</strong> impulsada por la{' '}
              <a
                href="https://casaalaniz.es"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-fasor-gold"
              >
                <strong className="text-fasor-gold">Casa Alaniz</strong>
              </a>{' '}
              con un objetivo claro, ayudar y proteger a la comunidad cuando más lo necesita. No es
              una idea abstracta, sino una respuesta a problemas reales.
            </p>
            <p className="text-fasor-sage">
              Incendios, inundaciones, terremotos y temporales son cada vez más frecuentes. Frente a
              ellos hace falta contar con organizaciones civiles preparadas, disciplinadas y
              comprometidas.
            </p>
            <p className="text-fasor-sage">
              FASOR responde a esa necesidad estando preparados para actuar con decisión allí donde
              se necesita ayuda.
            </p>
            <p className="text-fasor-sage">
              Más que una organización, FASOR es un compromiso con la comunidad, el de estar
              presentes y echar una mano cuando llega la adversidad.
            </p>
          </div>
        </div>
      </section>

      {/* Misión Principal + valores */}
      <section className="banda-superficie">
        <div className="content-container">
          <div className="observe-me opacity-0 translate-y-8">
            <TituloSeccion numero="01" titulo="Misión Principal" />
            <p className="max-w-3xl text-xl leading-relaxed text-fasor-bone md:text-2xl">
              <strong className="text-fasor-gold">Estar presentes donde se necesita ayuda</strong>{' '}
              en incendios, inundaciones, catástrofes naturales y otras emergencias.
            </p>
          </div>

          <div className="observe-me opacity-0 translate-y-8 mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {VALORES.map((valor) => (
              <div key={valor.nombre} className="border-t-2 border-fasor-gold pt-5">
                <valor.icono className="mb-3 h-6 w-6 text-fasor-gold" aria-hidden="true" />
                <h3 className="mb-2 font-display text-lg font-bold uppercase tracking-tight text-fasor-bone">
                  {valor.nombre}
                </h3>
                <p className="m-0 text-sm leading-relaxed text-fasor-sage">{valor.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
