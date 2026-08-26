import { useEffect, type ReactNode } from 'react';
import CorreoEnlace from '../components/CorreoEnlace';

// Enlace mailto reutilizado en varias secciones (tratamiento único del sitio)
const EmailContacto = () => <CorreoEnlace email="contacto@fasor.es" />;

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
            de ingreso y cuando entras en la zona interna de la entidad.
          </p>
        </div>
      </header>

      <div className="content-container py-14 md:py-20">
        <div className="max-w-2xl space-y-10">
          <SeccionLegal numero="01" titulo="¿Quién es el responsable?">
            <p>
              FASOR, Fuerza de Auxilio, Soporte y Rescate, entidad inscrita con el número 0006429,
              sección Primera. Puedes escribirnos a <EmailContacto />.
            </p>
          </SeccionLegal>

          <SeccionLegal numero="02" titulo="¿Qué datos tratamos y para qué?">
            <p>
              Los que escribes en el formulario de ingreso, es decir, nombre, email, teléfono (si lo
              indicas), provincia o municipio, unidad de interés y tu motivación. Los usamos solo
              para gestionar tu solicitud de ingreso y ponernos en contacto contigo. No los usamos
              para publicidad ni los vendemos a nadie.
            </p>
          </SeccionLegal>

          <SeccionLegal numero="03" titulo="¿Con qué base legal?">
            <p>
              Tu consentimiento, que das al marcar la casilla antes de enviar el formulario. Puedes
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
              la entidad; si no, los eliminamos una vez resuelta la solicitud.
            </p>
          </SeccionLegal>

          <SeccionLegal numero="06" titulo="Zona interna de acceso restringido">
            <p>
              La web tiene una zona interna reservada a los miembros de FASOR, que es la vía oficial
              de comunicación de la entidad. Para entrar hace falta una cuenta que crea la Junta
              Directiva, no hay registro abierto. FASOR es el responsable de este tratamiento, igual
              que del formulario de ingreso.
            </p>
            <p>
              De cada cuenta tratamos un identificador interno de acceso, la contraseña (que se
              guarda cifrada y no es legible ni para FASOR), el nombre del miembro, su rango, su
              unidad si tiene una asignada y si el alta sigue activa. Todo ello sirve para dar
              acceso a la zona interna y para saber quién entra.
            </p>
            <p>
              La base jurídica es tu relación con la entidad y el cumplimiento de los fines
              recogidos en los estatutos.
            </p>
            <p>
              Las altas, las bajas y las credenciales las gestionan desde la propia zona interna los
              cargos autorizados de la entidad, y cada uno alcanza solo a quien le corresponde, el
              Comandante a todos los miembros y cada Capitán de Unidad a los de su unidad. Ese
              límite no depende de lo que muestre la pantalla, lo aplica la propia base de datos.
            </p>
            <p>
              El servicio de acceso y la base de datos están alojados en Supabase, que actúa como
              proveedor por cuenta de FASOR. No cedemos estos datos a nadie más, salvo obligación
              legal.
            </p>
            <p>
              Cuando el buzón interno entre en servicio trataremos también el contenido de las
              comunicaciones internas, con la única finalidad de sostener esa comunicación oficial
              entre miembros.
            </p>
            <p>
              Conservamos estos datos mientras dure tu condición de miembro. Al causar baja, la
              cuenta se desactiva y deja de dar acceso, pero no se borra, para poder reactivarla si
              vuelves y para dejar constancia de quién ha formado parte de la entidad. Si nos pides
              la supresión, la atendemos como se explica en el apartado de tus derechos, salvo lo
              que haya que guardar por obligación legal.
            </p>
          </SeccionLegal>

          <SeccionLegal numero="07" titulo="Tus derechos">
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

          <SeccionLegal numero="08" titulo="Menores">
            <p>
              El formulario de ingreso está reservado a mayores de 18 años; por eso te pedimos que
              lo declares antes de enviarlo.
            </p>
          </SeccionLegal>
        </div>
      </div>
    </div>
  );
}
