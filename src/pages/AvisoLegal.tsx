import { useEffect } from 'react';

// Aviso legal: identificación del titular, condiciones de uso, propiedad
// intelectual, enlaces externos y legislación aplicable.
// [EMAIL-FASOR] es un placeholder pendiente del dato real.
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
    <div className="min-h-screen py-16 md:py-24">
      <div className="content-container">
        <div className="stack-centered mb-12 observe-me opacity-0 translate-y-8">
          <h1 className="font-display text-4xl font-bold text-alanizGold-600 md:text-5xl">
            Aviso Legal
          </h1>
          <div className="rule-gold mt-4" aria-hidden="true"></div>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          <div
            className="card-elegant observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '200ms' }}
          >
            <h2 className="text-xl font-display font-semibold text-alanizGold-600 mb-4">
              Titular del sitio
            </h2>
            <div className="space-y-2 text-sm leading-relaxed text-parchment-300">
              <p>
                <strong className="text-parchment-100">Denominación:</strong> FASOR – Fuerza de
                Auxilio, Soporte y Rescate
              </p>
              <p>
                <strong className="text-parchment-100">Naturaleza jurídica:</strong> asociación sin
                ánimo de lucro con personalidad jurídica propia (art. 22 CE; Ley Orgánica 1/2002, de
                22 de marzo)
              </p>
              <p>
                <strong className="text-parchment-100">NIF:</strong> G93758183
              </p>
              <p>
                <strong className="text-parchment-100">Domicilio social:</strong> C/ Ribera de
                Castronuño 12 – Aldeamayor de San Martín (Valladolid)
              </p>
              <p>
                <strong className="text-parchment-100">Inscripción registral:</strong> Registro de
                Asociaciones de la Delegación Territorial de Valladolid (Junta de Castilla y León),
                número 0006429, sección Primera
              </p>
              <p>
                <strong className="text-parchment-100">Contacto:</strong> [EMAIL-FASOR]
              </p>
            </div>
          </div>

          <div
            className="card-elegant observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '300ms' }}
          >
            <h2 className="text-xl font-display font-semibold text-alanizGold-600 mb-4">
              Condiciones de uso
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-parchment-300">
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
                garantizar la ausencia de errores ni la disponibilidad ininterrumpida del sitio, y
                se reserva el derecho a modificar sus contenidos sin previo aviso.
              </p>
            </div>
          </div>

          <div
            className="card-elegant observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '400ms' }}
          >
            <h2 className="text-xl font-display font-semibold text-alanizGold-600 mb-4">
              Propiedad intelectual
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-parchment-300">
              <p>
                Los textos, el sello de FASOR, los emblemas de sus unidades y el resto de elementos
                gráficos de este sitio pertenecen a FASOR o a la Casa Alaniz. No está permitida su
                reproducción, distribución o transformación sin autorización expresa, salvo para uso
                personal y privado.
              </p>
            </div>
          </div>

          <div
            className="card-elegant observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '500ms' }}
          >
            <h2 className="text-xl font-display font-semibold text-alanizGold-600 mb-4">
              Enlaces externos
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-parchment-300">
              <p>
                Este sitio enlaza con páginas de terceros, como casaalaniz.es o el visor del
                proyecto Abeiro (abeiro.vercel.app). FASOR no se hace responsable del contenido ni
                de las prácticas de privacidad de esos sitios.
              </p>
            </div>
          </div>

          <div
            className="card-elegant observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '600ms' }}
          >
            <h2 className="text-xl font-display font-semibold text-alanizGold-600 mb-4">
              Legislación aplicable
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-parchment-300">
              <p>
                Este aviso legal se rige por la legislación española. Para cualquier controversia
                serán competentes los juzgados y tribunales de Valladolid, salvo que la ley disponga
                otro fuero.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
