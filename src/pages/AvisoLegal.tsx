import { useEffect, type ReactNode } from 'react';
import CorreoEnlace from '../components/CorreoEnlace';

// Sección de prosa legal: numeración técnica + título condensado + cuerpo
function SeccionLegal({
  numero,
  titulo,
  children,
}: {
  numero: string;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section className="observe-me opacity-0 translate-y-8 border-t border-fasor-line pt-8">
      <h2 className="mb-4 flex items-baseline gap-3 font-display text-xl font-bold uppercase tracking-tight text-fasor-bone">
        <span className="font-mono text-xs font-normal tracking-widest text-fasor-gold">
          {numero}
        </span>
        {titulo}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-fasor-sage">{children}</div>
    </section>
  );
}

// Aviso legal: identificación del titular, condiciones de uso, propiedad
// intelectual, enlaces externos y legislación aplicable.
export default function AvisoLegal() {
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
            Aviso Legal
          </h1>
          <div className="linea-fade mt-6" aria-hidden="true"></div>
        </div>
      </header>

      <div className="content-container py-14 md:py-20">
        <div className="max-w-2xl space-y-10">
          <SeccionLegal numero="01" titulo="Titular del sitio">
            {/* Cada dato va con su rótulo encima, para identificarlo sin dos puntos */}
            <div className="space-y-4">
              <div>
                <p className="etiqueta m-0 text-[10px]">Denominación</p>
                <p className="m-0 mt-1 text-fasor-bone">
                  FASOR, Fuerza de Auxilio, Soporte y Rescate
                </p>
              </div>
              <div>
                <p className="etiqueta m-0 text-[10px]">Naturaleza jurídica</p>
                <p className="m-0 mt-1 text-fasor-bone">
                  Entidad sin ánimo de lucro con personalidad jurídica propia (art. 22 CE; Ley
                  Orgánica 1/2002, de 22 de marzo)
                </p>
              </div>
              <div>
                <p className="etiqueta m-0 text-[10px]">NIF</p>
                <p className="m-0 mt-1 text-fasor-bone">G93758183</p>
              </div>
              <div>
                <p className="etiqueta m-0 text-[10px]">Inscripción registral</p>
                <p className="m-0 mt-1 text-fasor-bone">
                  Inscrita con el número 0006429, sección Primera
                </p>
              </div>
              <div>
                <p className="etiqueta m-0 text-[10px]">Contacto</p>
                <p className="m-0 mt-1">
                  <CorreoEnlace email="contacto@fasor.es" />
                </p>
              </div>
            </div>
          </SeccionLegal>

          <SeccionLegal numero="02" titulo="Condiciones de uso">
            <p>
              Este sitio web tiene carácter informativo. Presenta la actividad de FASOR, sus
              unidades y su forma de organización, y permite solicitar el ingreso en la entidad.
            </p>
            <p>
              Al navegar por el sitio te comprometes a hacer un uso adecuado de sus contenidos y a
              no emplearlos para actividades ilícitas o contrarias a la buena fe.
            </p>
            <p>
              FASOR procura que la información esté actualizada y sea exacta, pero no puede
              garantizar la ausencia de errores ni la disponibilidad ininterrumpida del sitio, y se
              reserva el derecho a modificar sus contenidos sin previo aviso.
            </p>
          </SeccionLegal>

          <SeccionLegal numero="03" titulo="Propiedad intelectual">
            <p>
              Los textos, el sello de FASOR, los emblemas de sus unidades y el resto de elementos
              gráficos de este sitio pertenecen a FASOR o a la Casa Alaniz. No está permitida su
              reproducción, distribución o transformación sin autorización expresa, salvo para uso
              personal y privado.
            </p>
          </SeccionLegal>

          <SeccionLegal numero="04" titulo="Enlaces externos">
            <p>
              Este sitio enlaza con páginas de terceros, como casaalaniz.es o el visor del proyecto
              Abeiro (abeiro.vercel.app). FASOR no se hace responsable del contenido ni de las
              prácticas de privacidad de esos sitios.
            </p>
          </SeccionLegal>

          <SeccionLegal numero="05" titulo="Legislación aplicable">
            <p>
              Este aviso legal se rige por la legislación española. Para cualquier controversia
              conocerán los juzgados y tribunales españoles competentes, salvo que la ley disponga
              otro fuero.
            </p>
          </SeccionLegal>
        </div>
      </div>
    </div>
  );
}
