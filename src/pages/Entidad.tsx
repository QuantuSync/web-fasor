import { useEffect } from 'react';
import AccreditationSeal from '../components/AccreditationSeal';
import TituloSeccion from '../components/TituloSeccion';
import Galon from '../components/Galon';
import equipoImg from '../assets/Equipo.jpg';

// Entidad: panel de acreditación oficial (con el número de registro),
// Compromiso con la Comunidad, foto de equipo y cita final del lema.
// Contenido textual verbatim de Fasor.tsx (repo de Casa Alaniz), con el texto
// de acreditación actualizado para incluir la inscripción registral.
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
    <div>
      {/* Cabecera de página */}
      <header className="content-container pt-14 md:pt-20">
        <div className="observe-me opacity-0 translate-y-8">
          <p className="etiqueta mb-3">FASOR</p>
          <h1 className="font-display text-5xl font-bold uppercase tracking-tight text-fasor-bone md:text-6xl">
            Entidad
          </h1>
          <div className="linea-fade mt-6" aria-hidden="true"></div>
        </div>
      </header>

      {/* Acreditación oficial */}
      <section className="content-container py-14 md:py-20">
        <AccreditationSeal eyebrow="Acreditación oficial" title="Entidad registrada">
          <p>
            La Fuerza de Auxilio, Soporte y Rescate (FASOR) es una entidad de protección civil y
            respuesta rápida ante emergencias, con personalidad jurídica propia, creada en 2025 al
            amparo del artículo 22 de la Constitución Española y conforme a la Ley Orgánica 1/2002,
            de 22 de marzo, e inscrita en el Registro de Asociaciones con el número 0006429, sección
            Primera.
          </p>
          <p>
            Su ámbito de actuación es España, pudiendo intervenir también en el extranjero en
            colaboración con las autoridades competentes.
          </p>
          <p>
            FASOR nace bajo el amparo de la Casa Alaniz como reflejo de un deber de servicio y
            protección a la comunidad, y desarrolla fines de intervención en emergencias civiles y
            catástrofes, auxilio a la población, formación ciudadana en prevención y primeros
            auxilios, y colaboración con administraciones públicas en materia de protección civil.
          </p>
        </AccreditationSeal>
      </section>

      {/* Compromiso con la comunidad */}
      <section className="banda-superficie">
        <div className="content-container">
          <div className="observe-me opacity-0 translate-y-8">
            <TituloSeccion numero="01" titulo="Compromiso con la Comunidad" />
          </div>

          <div className="observe-me opacity-0 translate-y-8 max-w-3xl space-y-5 leading-relaxed">
            <p className="text-fasor-sage">
              En cada intervención, la Fuerza de Auxilio, Soporte y Rescate busca ser más que un
              grupo de apoyo: aspira a convertirse en un{' '}
              <strong className="text-fasor-bone">referente de confianza</strong>, capaz de inspirar
              seguridad en quienes nos ven actuar y esperanza en quienes reciben nuestra ayuda.
            </p>
            <p className="text-fasor-sage">
              Para la Casa Alaniz, lo que de verdad importa no son los títulos ni el pasado, sino{' '}
              <strong className="text-fasor-bone">
                la capacidad de responder con eficacia cuando más se la necesita
              </strong>
              . FASOR es, a la vez, una forma de honrar esa idea y un proyecto de futuro.
            </p>
          </div>

          {/* Cita destacada */}
          <blockquote className="observe-me opacity-0 translate-y-8 my-10 max-w-3xl border-l-2 border-fasor-gold pl-6">
            <p className="m-0 text-lg italic leading-relaxed text-fasor-bone">
              "La Fuerza Casa Alaniz actúa con seriedad, método y determinación. Su estructura no
              busca imitar un ejército, sino transmitir la misma solidez y confianza que requiere
              toda organización destinada a proteger y servir en momentos de crisis."
            </p>
          </blockquote>

          {/* Divisa como línea tipográfica */}
          <div className="observe-me opacity-0 translate-y-8 my-10 flex items-center gap-4">
            <Galon count={2} className="h-3.5 w-2.5" />
            <p className="m-0 font-display text-xl font-bold uppercase tracking-[0.25em] text-fasor-gold">
              DISCIPLINA • VALOR • SERVICIO
            </p>
          </div>

          {/* Foto de equipo */}
          <div className="observe-me opacity-0 translate-y-8 max-w-3xl">
            <img
              src={equipoImg}
              alt="Equipo FASOR - Fuerza de Auxilio, Soporte y Rescate Casa Alaniz"
              width={1536}
              height={962}
              className="h-auto w-full rounded border border-fasor-line"
              loading="lazy"
            />
            <p className="mt-3 font-mono text-xs tracking-wider text-fasor-sage">
              FASOR: Honor, disciplina y servicio bajo la bandera de Casa Alaniz
            </p>
          </div>
        </div>
      </section>

      {/* Cita final del lema */}
      <section className="banda">
        <div className="content-container">
          <div className="observe-me opacity-0 translate-y-8 max-w-3xl">
            <blockquote className="m-0">
              <p className="m-0 font-display text-2xl font-semibold uppercase leading-snug tracking-tight text-fasor-bone md:text-3xl">
                "Donde la memoria arde, también nace la fuerza de proteger."
              </p>
              <cite className="mt-4 block font-mono text-xs not-italic tracking-wider text-fasor-sage">
                — Lema de la Fuerza de Auxilio, Soporte y Rescate Casa Alaniz
              </cite>
            </blockquote>
          </div>
        </div>
      </section>
    </div>
  );
}
