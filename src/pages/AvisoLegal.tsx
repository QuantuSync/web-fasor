import { useEffect, type ReactNode } from 'react';

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
            <p>
              <strong className="text-fasor-bone">Denominación:</strong> FASOR – Fuerza de Auxilio,
              Soporte y Rescate
            </p>
            <p>
              <strong className="text-fasor-bone">Naturaleza jurídica:</strong> asociación sin ánimo
              de lucro con personalidad jurídica propia (art. 22 CE; Ley Orgánica 1/2002, de 22 de
              marzo)
            </p>
            <p>
              <strong className="text-fasor-bone">NIF:</strong> G93758183
            </p>
            <p>
              <strong className="text-fasor-bone">Inscripción registral:</strong> Registro de
              Asociaciones de la Delegación Territorial de Valladolid (Junta de Castilla y León),
              número 0006429, sección Primera
            </p>
            <p>
              <strong className="text-fasor-bone">Contacto:</strong>{' '}
              <a
                href="mailto:contacto@fasor.es"
                className="text-fasor-gold underline underline-offset-2 hover:text-fasor-bone"
              >
                contacto@fasor.es
              </a>
            </p>
          </SeccionLegal>

          <SeccionLegal numero="02" titulo="Condiciones de uso">
            <p>
              Este sitio web tiene carácter informativo: presenta la actividad de FASOR, sus
              unidades y su forma de organización, y permite solicitar el alistamiento en la
              Asociación.
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
              serán competentes los juzgados y tribunales de Valladolid, salvo que la ley disponga
              otro fuero.
            </p>
          </SeccionLegal>
        </div>
      </div>
    </div>
  );
}
