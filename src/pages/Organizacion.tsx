import { useEffect } from 'react';
import { Swords } from 'lucide-react';
import { RankBadge, RankStars, RankChevrons } from '../components/RankInsignia';
import { escalafon } from '../data/escalafon';

// Página de Organización: estructura organizativa y escalafón oficial (cinco rangos
// con sus distintivos). Los órganos de gobierno y la Junta Directiva llegan en la fase 3.
// Contenido portado verbatim de Fasor.tsx (repo de Casa Alaniz).
export default function Organizacion() {
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
            Organización
          </h1>
        </div>

        <div className="max-w-5xl mx-auto space-y-12">
          <div
            className="card-elegant observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '200ms' }}
          >
            <div className="flex items-start space-x-6 mb-6">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center w-14 h-14 border-2 border-alanizGold-600 bg-transparent rounded-full">
                  <Swords className="w-5 h-5 text-alanizGold-600" aria-hidden="true" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-display font-semibold text-alanizGold-600 mb-4">
                  Estructura Organizativa
                </h2>
                <p className="text-parchment-200 leading-relaxed">
                  La Fuerza de Auxilio, Soporte y Rescate Casa Alaniz se organiza bajo principios de
                  disciplina, responsabilidad y servicio. Cada nivel jerárquico tiene una función
                  clara, garantizando que la misión se cumpla con eficacia en cualquier
                  circunstancia.
                </p>
              </div>
            </div>

            <div className="space-y-6 mt-8">
              <h3 className="text-xl font-display font-semibold text-alanizGold-500 mb-6 flex items-center">
                <Swords className="w-5 h-5 mr-2 text-alanizGold-600" aria-hidden="true" />
                Escalafón Oficial de FASOR
              </h3>

              <div className="space-y-4">
                {escalafon.map((rango) => (
                  <div
                    key={rango.nombre}
                    className="bg-alanizGreen-900/50 rounded-lg p-5 border border-alanizGold-600/30"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <RankBadge>
                        {rango.insignia.tipo === 'estrellas' ? (
                          <RankStars count={rango.insignia.numero} />
                        ) : (
                          <RankChevrons count={rango.insignia.numero} />
                        )}
                      </RankBadge>
                      <div className="flex-1">
                        <h4 className="font-display font-bold text-alanizGold-500 text-lg mb-1">
                          {rango.nombre}
                        </h4>
                      </div>
                    </div>
                    <p className="text-sm text-parchment-300 leading-relaxed">
                      {rango.descripcion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
