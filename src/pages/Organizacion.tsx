import { useEffect } from 'react';
import { Landmark, Users } from 'lucide-react';
import CorreoEnlace from '../components/CorreoEnlace';
import TituloSeccion from '../components/TituloSeccion';
import { RankBadge, RankComandante, RankStars, RankChevrons } from '../components/RankInsignia';
import { escalafon } from '../data/escalafon';

// Buzones institucionales de los cargos de la Junta Directiva: siempre el
// cargo u órgano, nunca nombres de personas (regla de privacidad del proyecto)
const CORREOS_JUNTA = [
  { cargo: 'Presidencia', email: 'presidencia@fasor.es' },
  { cargo: 'Secretaría', email: 'secretaria@fasor.es' },
  { cargo: 'Tesorería', email: 'tesoreria@fasor.es' },
];

// Organización: estructura organizativa, escalafón como listado jerárquico
// descendente con las insignias, y órganos de gobierno en paneles planos.
// Por la regla de privacidad del proyecto aquí NO se publican nombres de personas.
// Contenido textual verbatim de Fasor.tsx (repo de Casa Alaniz).
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
    <div>
      {/* Cabecera de página */}
      <header className="content-container pt-14 md:pt-20">
        <div className="observe-me opacity-0 translate-y-8">
          <p className="etiqueta mb-3">FASOR</p>
          <h1 className="font-display text-5xl font-bold uppercase tracking-tight text-fasor-bone md:text-6xl">
            Organización
          </h1>
          <div className="linea-fade mt-6" aria-hidden="true"></div>
        </div>
      </header>

      {/* Estructura organizativa */}
      <section className="content-container py-14 md:py-20">
        <div className="observe-me opacity-0 translate-y-8">
          <TituloSeccion numero="01" titulo="Estructura Organizativa" />
          <p className="max-w-3xl leading-relaxed text-fasor-sage">
            La Fuerza de Auxilio, Soporte y Rescate Casa Alaniz se organiza bajo principios de
            disciplina, responsabilidad y servicio. Cada nivel jerárquico tiene una función clara,
            garantizando que la misión se cumpla con eficacia en cualquier circunstancia.
          </p>
        </div>
      </section>

      {/* Escalafón: listado jerárquico descendente */}
      <section className="banda-superficie">
        <div className="content-container">
          <div className="observe-me opacity-0 translate-y-8">
            <TituloSeccion numero="02" titulo="Escalafón Oficial de FASOR" />
          </div>

          <div className="observe-me opacity-0 translate-y-8">
            {escalafon.map((rango, i) => (
              <div
                key={rango.nombre}
                className="grid grid-cols-[auto,1fr] items-start gap-5 border-t border-fasor-line py-6 sm:gap-8 md:grid-cols-[auto,auto,1fr]"
              >
                <span className="hidden pt-1 font-mono text-xs tracking-widest text-fasor-gold md:block">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <RankBadge>
                  {/* El Comandante (rango 1, tres estrellas en los datos) lleva divisa propia */}
                  {rango.insignia.tipo === 'estrellas' ? (
                    rango.insignia.numero === 3 ? (
                      <RankComandante />
                    ) : (
                      <RankStars count={rango.insignia.numero} />
                    )
                  ) : (
                    <RankChevrons count={rango.insignia.numero} />
                  )}
                </RankBadge>
                <div>
                  <h3 className="mb-2 font-display text-xl font-bold uppercase tracking-tight text-fasor-bone">
                    {rango.nombre}
                  </h3>
                  <p className="m-0 max-w-2xl text-sm leading-relaxed text-fasor-sage">
                    {rango.descripcion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Órganos de gobierno */}
      <section className="banda">
        <div className="content-container">
          <div className="observe-me opacity-0 translate-y-8">
            <TituloSeccion
              numero="03"
              titulo="Órganos de Gobierno"
              intro="Según los artículos 9 y 10 de los estatutos."
            />
          </div>

          <div className="observe-me opacity-0 translate-y-8 grid grid-cols-1 gap-10 md:grid-cols-2">
            <div className="border-l-2 border-fasor-gold pl-6">
              <div className="mb-3 flex items-center gap-3">
                <Landmark className="h-5 w-5 text-fasor-gold" aria-hidden="true" />
                <h3 className="m-0 font-display text-lg font-bold uppercase tracking-tight text-fasor-bone">
                  Asamblea General
                </h3>
              </div>
              <p className="m-0 text-sm leading-relaxed text-fasor-sage">
                Órgano supremo de gobierno de la Asociación, integrado por todos los socios de pleno
                derecho. Se reúne al menos una vez al año, dentro de los cuatro meses siguientes al
                cierre del ejercicio (31 de diciembre). Sus acuerdos obligan a todos los socios.
              </p>
            </div>

            <div className="border-l-2 border-fasor-gold pl-6">
              <div className="mb-3 flex items-center gap-3">
                <Users className="h-5 w-5 text-fasor-gold" aria-hidden="true" />
                <h3 className="m-0 font-display text-lg font-bold uppercase tracking-tight text-fasor-bone">
                  Junta Directiva
                </h3>
              </div>
              <p className="m-0 text-sm leading-relaxed text-fasor-sage">
                Órgano de representación y gestión de la Asociación, compuesto por Presidente/a,
                Secretario/a y Tesorero/a, pudiendo añadirse vocales si lo aprueba la Asamblea. Los
                cargos son gratuitos, con mandato de cuatro años renovable.
              </p>
              <ul className="m-0 mt-5 list-none space-y-3 p-0">
                {CORREOS_JUNTA.map(({ cargo, email }) => (
                  <li key={email} className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span className="w-24 shrink-0 text-sm text-fasor-sage">{cargo}</span>
                    <CorreoEnlace email={email} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
