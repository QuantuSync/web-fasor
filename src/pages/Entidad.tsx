import { useEffect } from 'react';
import { Heart, Flame } from 'lucide-react';
import AccreditationSeal from '../components/AccreditationSeal';
import equipoImg from '../assets/Equipo.jpg';

// Página de Entidad: panel de acreditación oficial (con el número de registro),
// Compromiso con la Comunidad, foto de equipo y cita final del lema.
// Contenido portado verbatim de Fasor.tsx (repo de Casa Alaniz), con el texto de
// acreditación actualizado para incluir la inscripción registral.
export default function Entidad() {
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
            Entidad
          </h1>
        </div>

        <div className="max-w-5xl mx-auto space-y-12">
          <AccreditationSeal eyebrow="Acreditación oficial" title="Entidad registrada">
            <p>
              La Fuerza de Auxilio, Soporte y Rescate (FASOR) es una entidad de protección civil y
              respuesta rápida ante emergencias, con personalidad jurídica propia, creada en 2025 al
              amparo del artículo 22 de la Constitución Española y conforme a la Ley Orgánica
              1/2002, de 22 de marzo, e inscrita en el Registro de Asociaciones de la Delegación
              Territorial de Valladolid con el número 0006429, sección Primera.
            </p>
            <p>
              Su ámbito principal de actuación es la comunidad de Castilla y León, pudiendo
              intervenir en el resto de España y en el extranjero en colaboración con las
              autoridades competentes.
            </p>
            <p>
              FASOR nace bajo el amparo de la Casa Alaniz como reflejo de un deber de servicio y
              protección a la comunidad, y desarrolla fines de intervención en emergencias civiles y
              catástrofes, auxilio a la población, formación ciudadana en prevención y primeros
              auxilios, y colaboración con administraciones públicas en materia de protección civil.
            </p>
          </AccreditationSeal>

          <div
            className="card-elegant bg-gradient-to-r from-alanizGreen-800/80 to-alanizGreen-900/80 border-2 border-alanizGold-600/40 observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '200ms' }}
          >
            <div className="flex items-start space-x-6 mb-6">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center w-14 h-14 border-2 border-alanizGold-600 bg-transparent rounded-full">
                  <Heart className="w-5 h-5 text-alanizGold-600" aria-hidden="true" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-display font-semibold text-alanizGold-500 mb-4">
                  Compromiso con la Comunidad
                </h2>
              </div>
            </div>

            <div className="space-y-4 text-parchment-100 leading-relaxed">
              <p>
                En cada intervención, la Fuerza de Auxilio, Soporte y Rescate busca ser más que un
                grupo de apoyo: aspira a convertirse en un{' '}
                <strong className="text-alanizGold-400">referente de confianza</strong>, capaz de
                inspirar seguridad en quienes nos ven actuar y esperanza en quienes reciben nuestra
                ayuda.
              </p>
              <p>
                Para la Casa Alaniz, lo que de verdad importa no son los títulos ni el pasado, sino{' '}
                <strong className="text-alanizGold-400">
                  la capacidad de responder con eficacia cuando más se la necesita
                </strong>
                . FASOR es, a la vez, una forma de honrar esa idea y un proyecto de futuro.
              </p>

              <div className="bg-alanizGold-600/10 rounded-lg p-6 border-l-4 border-alanizGold-600 mt-6">
                <p className="text-alanizGold-400 font-medium text-center italic text-lg">
                  "La Fuerza Casa Alaniz actúa con seriedad, método y determinación. Su estructura
                  no busca imitar un ejército, sino transmitir la misma solidez y confianza que
                  requiere toda organización destinada a proteger y servir en momentos de crisis."
                </p>
              </div>

              <div className="text-center mt-8">
                {/* text-base + px-6 en móvil: con text-lg/px-8 el badge desborda a 360px */}
                <div className="inline-flex items-center px-6 sm:px-8 py-4 bg-alanizGold-600 text-alanizGreen-950 rounded-full font-bold text-base sm:text-lg shadow-lg">
                  <Flame className="w-5 h-5 mr-3 shrink-0" aria-hidden="true" />
                  DISCIPLINA • VALOR • SERVICIO
                </div>
              </div>

              <div className="mt-8">
                <div className="w-full max-w-2xl mx-auto">
                  <img
                    src={equipoImg}
                    alt="Equipo FASOR - Fuerza de Auxilio, Soporte y Rescate Casa Alaniz"
                    width={1536}
                    height={962}
                    className="w-full h-auto rounded-xl shadow-2xl border-2 border-alanizGold-600/30"
                    loading="lazy"
                  />
                  <p className="text-center text-parchment-400 text-sm mt-3 italic">
                    FASOR: Honor, disciplina y servicio bajo la bandera de Casa Alaniz
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className="text-center mt-16 observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '400ms' }}
          >
            <div className="bg-alanizGreen-800/50 rounded-xl p-8 border border-alanizGold-600/20 backdrop-blur-sm shadow-elegant">
              <blockquote className="text-xl md:text-2xl font-display italic text-alanizGold-600 mb-4">
                "Donde la memoria arde, también nace la fuerza de proteger."
              </blockquote>
              <cite className="text-parchment-400 text-sm">
                — Lema de la Fuerza de Auxilio, Soporte y Rescate Casa Alaniz
              </cite>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
