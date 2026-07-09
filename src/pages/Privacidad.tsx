import { useEffect } from 'react';

// Política de privacidad (RGPD) en lenguaje claro: responsable, finalidad,
// base jurídica, destinatarios, conservación y derechos.
// [EMAIL-FASOR] es un placeholder pendiente del dato real.
export default function Privacidad() {
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
            Política de Privacidad
          </h1>
          <div className="rule-gold mt-4" aria-hidden="true"></div>
          <p className="mt-4 max-w-2xl text-center text-lg leading-relaxed text-parchment-300">
            Aquí te explicamos, de forma clara, qué hacemos con tus datos cuando usas el formulario
            de alistamiento.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          <div
            className="card-elegant observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '200ms' }}
          >
            <h2 className="text-xl font-display font-semibold text-alanizGold-600 mb-4">
              ¿Quién es el responsable?
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-parchment-300">
              <p>
                FASOR – Fuerza de Auxilio, Soporte y Rescate, asociación inscrita en el Registro de
                Asociaciones de la Delegación Territorial de Valladolid con el número 0006429,
                sección Primera, con domicilio en C/ Ribera de Castronuño 12 – Aldeamayor de San
                Martín (Valladolid). Contacto: [EMAIL-FASOR].
              </p>
            </div>
          </div>

          <div
            className="card-elegant observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '300ms' }}
          >
            <h2 className="text-xl font-display font-semibold text-alanizGold-600 mb-4">
              ¿Qué datos tratamos y para qué?
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-parchment-300">
              <p>
                Los que escribes en el formulario de alistamiento: nombre, email, teléfono (si lo
                indicas), provincia o municipio, unidad de interés y tu motivación. Los usamos solo
                para gestionar tu solicitud de alistamiento y ponernos en contacto contigo. No los
                usamos para publicidad ni los vendemos a nadie.
              </p>
            </div>
          </div>

          <div
            className="card-elegant observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '400ms' }}
          >
            <h2 className="text-xl font-display font-semibold text-alanizGold-600 mb-4">
              ¿Con qué base legal?
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-parchment-300">
              <p>
                Tu consentimiento: la casilla que marcas antes de enviar el formulario. Puedes
                retirarlo en cualquier momento escribiendo a [EMAIL-FASOR], sin que ello afecte a lo
                tratado hasta entonces.
              </p>
            </div>
          </div>

          <div
            className="card-elegant observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '500ms' }}
          >
            <h2 className="text-xl font-display font-semibold text-alanizGold-600 mb-4">
              ¿Quién recibe tus datos?
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-parchment-300">
              <p>
                El formulario se envía a través de Web3Forms, el proveedor que recibe el mensaje y
                nos lo hace llegar por email. No cedemos tus datos a nadie más, salvo obligación
                legal.
              </p>
            </div>
          </div>

          <div
            className="card-elegant observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '600ms' }}
          >
            <h2 className="text-xl font-display font-semibold text-alanizGold-600 mb-4">
              ¿Cuánto tiempo los conservamos?
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-parchment-300">
              <p>
                Mientras tramitamos tu solicitud. Si ingresas en FASOR, mientras dure tu relación
                con la Asociación; si no, los eliminamos una vez resuelta la solicitud.
              </p>
            </div>
          </div>

          <div
            className="card-elegant observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '700ms' }}
          >
            <h2 className="text-xl font-display font-semibold text-alanizGold-600 mb-4">
              Tus derechos
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-parchment-300">
              <p>
                Puedes pedirnos acceso a tus datos, corregirlos, suprimirlos, oponerte a su
                tratamiento, limitarlo o llevártelos (portabilidad). Basta con escribir a
                [EMAIL-FASOR] indicando qué derecho quieres ejercer.
              </p>
              <p>
                Si crees que no te hemos atendido bien, puedes reclamar ante la Agencia Española de
                Protección de Datos (aepd.es).
              </p>
            </div>
          </div>

          <div
            className="card-elegant observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '800ms' }}
          >
            <h2 className="text-xl font-display font-semibold text-alanizGold-600 mb-4">Menores</h2>
            <div className="space-y-3 text-sm leading-relaxed text-parchment-300">
              <p>
                El formulario de alistamiento está reservado a mayores de 18 años; por eso te
                pedimos que lo declares antes de enviarlo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
