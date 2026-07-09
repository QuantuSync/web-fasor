import { useEffect } from 'react';
import { Swords, Landmark, Users } from 'lucide-react';
import { RankBadge, RankStars, RankChevrons } from '../components/RankInsignia';
import { escalafon } from '../data/escalafon';

// Página de Organización: estructura organizativa, escalafón oficial (cinco rangos
// con sus distintivos) y órganos de gobierno según estatutos, en términos impersonales.
// Por la regla de privacidad del CLAUDE.md aquí NO se publican nombres de personas.
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

          <div
            className="card-elegant observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '400ms' }}
          >
            <h2 className="text-2xl font-display font-semibold text-alanizGold-600 mb-2">
              Órganos de Gobierno
            </h2>
            <p className="text-sm text-parchment-400 mb-6">
              Según los artículos 9 y 10 de los estatutos.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-alanizGreen-900/50 rounded-lg p-6 border border-alanizGold-600/30">
                <h3 className="font-display font-semibold text-alanizGold-500 mb-3 flex items-center">
                  <Landmark className="w-5 h-5 mr-2 text-alanizGold-600" aria-hidden="true" />
                  Asamblea General
                </h3>
                <p className="text-sm text-parchment-300 leading-relaxed">
                  Órgano supremo de gobierno de la Asociación, integrado por todos los socios de
                  pleno derecho. Se reúne al menos una vez al año, dentro de los cuatro meses
                  siguientes al cierre del ejercicio (31 de diciembre). Sus acuerdos obligan a todos
                  los socios.
                </p>
              </div>

              <div className="bg-alanizGreen-900/50 rounded-lg p-6 border border-alanizGold-600/30">
                <h3 className="font-display font-semibold text-alanizGold-500 mb-3 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-alanizGold-600" aria-hidden="true" />
                  Junta Directiva
                </h3>
                <p className="text-sm text-parchment-300 leading-relaxed">
                  Órgano de representación y gestión de la Asociación, compuesto por Presidente/a,
                  Secretario/a y Tesorero/a, pudiendo añadirse vocales si lo aprueba la Asamblea.
                  Los cargos son gratuitos, con mandato de cuatro años renovable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
