import { useEffect, type ReactNode } from 'react';

// Enlace mailto reutilizado en varias secciones
const EmailContacto = () => (
  <a
    href="mailto:contacto@fasor.es"
    className="text-fasor-gold underline underline-offset-2 hover:text-fasor-bone"
  >
    contacto@fasor.es
  </a>
);

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

// Política de privacidad (RGPD) en lenguaje claro: responsable, finalidad,
// base jurídica, destinatarios, conservación y derechos.
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
    <div>
      {/* Cabecera de página */}
      <header className="content-container pt-14 md:pt-20">
        <div className="observe-me opacity-0 translate-y-8">
          <p className="etiqueta mb-3">FASOR</p>
          <h1 className="font-display text-5xl font-bold uppercase tracking-tight text-fasor-bone md:text-6xl">
            Política de Privacidad
          </h1>
          <div className="linea-fade mt-6" aria-hidden="true"></div>
          <p className="mt-6 max-w-2xl leading-relaxed text-fasor-sage">
            Aquí te explicamos, de forma clara, qué hacemos con tus datos cuando usas el formulario
            de alistamiento.
          </p>
        </div>
      </header>

      <div className="content-container py-14 md:py-20">
        <div className="max-w-2xl space-y-10">
          <SeccionLegal numero="01" titulo="¿Quién es el responsable?">
            <p>
              FASOR – Fuerza de Auxilio, Soporte y Rescate, asociación inscrita en el Registro de
              Asociaciones de la Delegación Territorial de Valladolid con el número 0006429, sección
              Primera. Contacto: <EmailContacto />.
            </p>
          </SeccionLegal>

          <SeccionLegal numero="02" titulo="¿Qué datos tratamos y para qué?">
            <p>
              Los que escribes en el formulario de alistamiento: nombre, email, teléfono (si lo
              indicas), provincia o municipio, unidad de interés y tu motivación. Los usamos solo
              para gestionar tu solicitud de alistamiento y ponernos en contacto contigo. No los
              usamos para publicidad ni los vendemos a nadie.
            </p>
          </SeccionLegal>

          <SeccionLegal numero="03" titulo="¿Con qué base legal?">
            <p>
              Tu consentimiento: la casilla que marcas antes de enviar el formulario. Puedes
              retirarlo en cualquier momento escribiendo a <EmailContacto />, sin que ello afecte a
              lo tratado hasta entonces.
            </p>
          </SeccionLegal>

          <SeccionLegal numero="04" titulo="¿Quién recibe tus datos?">
            <p>
              El formulario se envía a través de Web3Forms, el proveedor que recibe el mensaje y nos
              lo hace llegar por email. No cedemos tus datos a nadie más, salvo obligación legal.
            </p>
          </SeccionLegal>

          <SeccionLegal numero="05" titulo="¿Cuánto tiempo los conservamos?">
            <p>
              Mientras tramitamos tu solicitud. Si ingresas en FASOR, mientras dure tu relación con
              la Asociación; si no, los eliminamos una vez resuelta la solicitud.
            </p>
          </SeccionLegal>

          <SeccionLegal numero="06" titulo="Tus derechos">
            <p>
              Puedes pedirnos acceso a tus datos, corregirlos, suprimirlos, oponerte a su
              tratamiento, limitarlo o llevártelos (portabilidad). Basta con escribir a{' '}
              <EmailContacto /> indicando qué derecho quieres ejercer.
            </p>
            <p>
              Si crees que no te hemos atendido bien, puedes reclamar ante la Agencia Española de
              Protección de Datos (aepd.es).
            </p>
          </SeccionLegal>

          <SeccionLegal numero="07" titulo="Menores">
            <p>
              El formulario de alistamiento está reservado a mayores de 18 años; por eso te pedimos
              que lo declares antes de enviarlo.
            </p>
          </SeccionLegal>
        </div>
      </div>
    </div>
  );
}
