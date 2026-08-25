import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import TituloSeccion from '../components/TituloSeccion';
import Galon from '../components/Galon';
import CorreoEnlace from '../components/CorreoEnlace';
import { RankDivisa } from '../components/RankInsignia';
import { rangoPorId } from '../data/escalafon';
import {
  principiosAcademy,
  itinerarioAcademy,
  catalogoAcademy,
  requisitosInstructor,
  nivelesInstructor,
} from '../data/academy';

// Etiqueta de modalidad del catálogo: contorno dorado, sin relleno (el dorado
// es tinta). No hay precios en esta fase: solo Gratuito / De pago.
const EtiquetaModalidad = ({ texto }: { texto: string }) => (
  <span className="inline-block rounded-sm border border-fasor-gold/25 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-fasor-gold">
    {texto}
  </span>
);

// FASOR Academy: la plataforma formativa de la asociación. Los principios van
// antes del catálogo a propósito. Las divisas del itinerario se leen del
// escalafón (src/data/escalafon.ts), nunca se redefinen aquí.
export default function Academy() {
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
            Academy
          </h1>
          <div className="linea-fade mt-6" aria-hidden="true"></div>
          <p className="mt-6 max-w-2xl leading-relaxed text-fasor-sage">
            La plataforma formativa de FASOR: el itinerario que prepara a sus miembros y la escuela
            abierta a quien quiera formarse.
          </p>
        </div>
      </header>

      {/* Qué es */}
      <section className="content-container py-14 md:py-20">
        <div className="observe-me opacity-0 translate-y-8">
          <TituloSeccion numero="01" titulo="Qué es FASOR Academy" />
        </div>

        <div className="observe-me opacity-0 translate-y-8 max-w-3xl space-y-5">
          <p className="m-0 leading-relaxed text-fasor-sage">
            FASOR Academy es la plataforma formativa de la asociación. No es una academia externa ni
            una entidad aparte: es un órgano transversal que depende de la Junta Directiva y
            atraviesa todas las unidades, en lugar de constituir una sexta.
          </p>
          <p className="m-0 leading-relaxed text-fasor-sage">
            Su función es doble. Hacia dentro, prepara a los miembros de FASOR y sostiene su
            progresión: nadie interviene sin la formación adecuada. Hacia fuera, abre parte de su
            catálogo a cualquier persona interesada en formarse, sea o no socia.
          </p>
          <p className="m-0 leading-relaxed text-fasor-sage">
            La formación es además el sostén económico de las actividades: lo recaudado se
            reinvierte íntegramente en FASOR —material, instrucción y despliegue—. La Academy no
            sustituye ni altera la misión de la asociación; la sostiene.
          </p>
        </div>

        {/* Frase fuerza */}
        <div className="observe-me opacity-0 translate-y-8 mt-12 border-l-2 border-fasor-gold pl-6">
          <p className="m-0 max-w-3xl font-display text-2xl font-bold uppercase leading-tight tracking-tight text-fasor-bone md:text-3xl">
            FASOR te prepara para ayudar. FASOR Academy te ayuda a crecer.
          </p>
        </div>
      </section>

      {/* Principios: antes del catálogo, deliberadamente */}
      <section className="banda-superficie">
        <div className="content-container">
          <div className="observe-me opacity-0 translate-y-8">
            <TituloSeccion
              numero="02"
              titulo="Principios"
              intro="Las reglas que rigen la Academy y que ninguna formación puede alterar."
            />
          </div>

          <ul className="observe-me opacity-0 translate-y-8 m-0 max-w-3xl list-none space-y-4 p-0">
            {principiosAcademy.map((principio) => (
              <li key={principio} className="flex items-start gap-3">
                <Galon className="mt-1 h-3 w-2" />
                <span className="leading-relaxed text-fasor-sage">{principio}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Itinerario de progresión */}
      <section className="banda">
        <div className="content-container">
          <div className="observe-me opacity-0 translate-y-8">
            <TituloSeccion
              numero="03"
              titulo="Itinerario de Progresión"
              intro="El camino desde la incorporación hasta la plena autonomía operativa. Todo el tronco de progresión —hasta Operador Táctico— es gratuito."
            />
          </div>

          <div className="observe-me opacity-0 translate-y-8">
            {itinerarioAcademy.map((paso, i) => {
              const rango = paso.rangoId ? rangoPorId(paso.rangoId) : null;
              return (
                <div
                  key={paso.titulo}
                  className="grid grid-cols-[auto,1fr] items-start gap-5 border-t border-fasor-line py-6 sm:gap-8 md:grid-cols-[auto,auto,1fr]"
                >
                  <span className="hidden pt-1 font-mono text-xs tracking-widest text-fasor-gold md:block">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* Los pasos con rango real muestran su divisa del escalafón;
                      el resto, el galón del sistema */}
                  <div className="flex w-10 shrink-0 justify-center pt-1">
                    {rango ? <RankDivisa divisa={rango.insignia} /> : <Galon className="h-4 w-3" />}
                  </div>

                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <h3 className="m-0 font-display text-xl font-bold uppercase tracking-tight text-fasor-bone">
                        {paso.titulo}
                      </h3>
                      {paso.gratuito && <EtiquetaModalidad texto="Gratuito" />}
                    </div>
                    <p className="m-0 max-w-2xl text-sm leading-relaxed text-fasor-sage">
                      {paso.descripcion}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Catálogo formativo */}
      <section className="banda-superficie">
        <div className="content-container">
          <div className="observe-me opacity-0 translate-y-8">
            <TituloSeccion
              numero="04"
              titulo="Catálogo Formativo"
              intro="El catálogo está en desarrollo y la oferta inicial será reducida: crecerá a medida que la Academy acredite instructores y consolide programas. Se organiza en tres niveles."
            />
          </div>

          <div className="observe-me opacity-0 translate-y-8 space-y-14">
            {catalogoAcademy.map((nivel, i) => (
              <div key={nivel.id} className="border-t-2 border-fasor-gold pt-6">
                <p className="m-0 mb-3 font-mono text-xs tracking-widest text-fasor-sage">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <h3 className="m-0 font-display text-2xl font-bold uppercase tracking-tight text-fasor-bone">
                    {nivel.nombre}
                  </h3>
                  <EtiquetaModalidad texto={nivel.modalidad} />
                  <EtiquetaModalidad texto={nivel.condicion} />
                </div>
                <p className="m-0 max-w-3xl leading-relaxed text-fasor-sage">{nivel.descripcion}</p>
                {nivel.nota && (
                  <p className="m-0 mt-2 max-w-3xl text-sm leading-relaxed text-fasor-sage">
                    {nivel.nota}
                  </p>
                )}

                <ul className="m-0 mt-8 grid list-none grid-cols-1 gap-x-10 gap-y-5 p-0 md:grid-cols-2">
                  {nivel.cursos.map((curso) => (
                    <li key={curso.titulo} className="flex items-start gap-3">
                      <Galon className="mt-1 h-3 w-2" />
                      <div>
                        <h4 className="m-0 mb-1 text-sm font-semibold text-fasor-bone">
                          {curso.titulo}
                        </h4>
                        <p className="m-0 text-xs leading-relaxed text-fasor-sage">
                          {curso.descripcion}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cuerpo de instructores */}
      <section className="banda">
        <div className="content-container">
          <div className="observe-me opacity-0 translate-y-8">
            <TituloSeccion
              numero="05"
              titulo="Cuerpo de Instructores"
              intro="Instructor es una habilitación, no un rango. El rango dice dónde estás en la jerarquía; la habilitación, qué estás acreditado para impartir. Se suma al rango sin alterar la cadena de mando."
            />
          </div>

          <div className="observe-me opacity-0 translate-y-8 max-w-3xl">
            <h3 className="mb-5 font-display text-lg font-bold uppercase tracking-tight text-fasor-bone">
              Requisitos
            </h3>
            <p className="m-0 mb-5 leading-relaxed text-fasor-sage">
              La habilitación de instructor es exclusiva de miembros de FASOR.
            </p>
            <ul className="m-0 list-none space-y-3 p-0">
              {requisitosInstructor.map((requisito) => (
                <li key={requisito} className="flex items-start gap-3">
                  <Galon className="mt-1 h-3 w-2" />
                  <span className="text-sm leading-relaxed text-fasor-sage">{requisito}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="observe-me opacity-0 translate-y-8 mt-14">
            <h3 className="mb-6 font-display text-lg font-bold uppercase tracking-tight text-fasor-bone">
              Niveles de habilitación
            </h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {nivelesInstructor.map((nivel) => (
                <div key={nivel.nombre} className="border-t-2 border-fasor-gold pt-5">
                  <p className="m-0 mb-3 font-mono text-xs tracking-widest text-fasor-sage">
                    {String(nivel.numero).padStart(2, '0')}
                  </p>
                  <h4 className="mb-2 font-display text-lg font-bold uppercase tracking-tight text-fasor-bone">
                    {nivel.nombre}
                  </h4>
                  <p className="m-0 text-sm leading-relaxed text-fasor-sage">{nivel.descripcion}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="observe-me opacity-0 translate-y-8 mt-14 max-w-3xl space-y-5">
            <p className="m-0 leading-relaxed text-fasor-sage">
              La habilitación no se compra: se obtiene cursando «Formación de Formadores», interno y
              gratuito, y superando la acreditación correspondiente.
            </p>
            <p className="m-0 leading-relaxed text-fasor-sage">
              Los instructores no perciben remuneración: FASOR es una asociación sin ánimo de lucro.
              A cambio, la asociación certifica sus horas de docencia como experiencia acreditable.
            </p>
            <p className="m-0 leading-relaxed text-fasor-sage">
              El docente colaborador es una figura distinta y externa: profesionales contratados o
              convenidos para impartir un curso concreto. No son miembros de FASOR, no llevan
              habilitación de instructor y no acreditan a otros instructores.
            </p>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section className="banda-superficie">
        <div className="content-container">
          <div className="observe-me opacity-0 translate-y-8">
            <TituloSeccion numero="06" titulo="Formarse con la Academy" />
          </div>

          <div className="observe-me opacity-0 translate-y-8 max-w-3xl space-y-5">
            <p className="m-0 leading-relaxed text-fasor-sage">
              Si quieres formarte con FASOR Academy —seas o no socio—, escríbenos y te informamos de
              la formación disponible en cada momento.
            </p>
            <p className="m-0">
              <CorreoEnlace email="contacto@fasor.es" />
            </p>
            <p className="m-0 leading-relaxed text-fasor-sage">
              Si lo que buscas es ingresar en FASOR, la vía es{' '}
              <Link
                to="/unete"
                className="text-fasor-gold underline underline-offset-2 hover:text-fasor-bone"
              >
                Únete
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
