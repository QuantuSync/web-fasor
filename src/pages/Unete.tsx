import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import TituloSeccion from '../components/TituloSeccion';
import Galon from '../components/Galon';
import { categoriasSocios, derechosSocios, deberesSocios } from '../data/socios';
import { unidades } from '../data/unidades';

// Access key de Web3Forms: es pública por diseño (identifica el buzón de destino,
// no da acceso a nada). El buzón receptor es privado y no se muestra en la web.
const WEB3FORMS_ACCESS_KEY = 'bae25a86-7969-4709-b895-fac73950ae82';

type EstadoEnvio = 'inicial' | 'enviando' | 'exito' | 'error';

// Estado del formulario de ingreso
interface Solicitud {
  nombre: string;
  email: string;
  telefono: string;
  localidad: string;
  unidad: string;
  motivacion: string;
  aceptaPrivacidad: boolean;
  mayorEdad: boolean;
  botcheck: string; // honeypot anti-spam de Web3Forms: debe quedar vacío
}

const SOLICITUD_VACIA: Solicitud = {
  nombre: '',
  email: '',
  telefono: '',
  localidad: '',
  unidad: 'Sin preferencia',
  motivacion: '',
  aceptaPrivacidad: false,
  mayorEdad: false,
  botcheck: '',
};

// Pasos del proceso de ingreso
const PASOS = [
  {
    titulo: 'Envía tu solicitud',
    descripcion: 'Rellena el formulario de ingreso con tus datos y tu motivación.',
  },
  {
    titulo: 'Valoración',
    descripcion: 'La Junta Directiva valora tu solicitud y te contacta para conocerte.',
  },
  {
    titulo: 'Incorporación',
    descripcion: 'Ingresas como Cadete en Formación y comienzas tu instrucción.',
  },
];

// Formulario de ingreso: envío a Web3Forms con fetch en el handler (regla SSG),
// validación en cliente y estados de envío anunciados en una región aria-live.
function FormularioIngreso() {
  const [solicitud, setSolicitud] = useState<Solicitud>(SOLICITUD_VACIA);
  const [estado, setEstado] = useState<EstadoEnvio>('inicial');

  const actualizar = (campo: keyof Solicitud, valor: string | boolean) => {
    setSolicitud((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Los required/type=email del navegador ya validan; esto es la red de seguridad.
    if (!solicitud.aceptaPrivacidad || !solicitud.mayorEdad) return;

    setEstado('enviando');
    try {
      const respuesta = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: 'Nueva solicitud de ingreso - FASOR',
          from_name: 'Web FASOR',
          nombre: solicitud.nombre,
          email: solicitud.email,
          telefono: solicitud.telefono || '(no indicado)',
          localidad: solicitud.localidad,
          unidad_de_interes: solicitud.unidad,
          motivacion: solicitud.motivacion,
          botcheck: solicitud.botcheck,
        }),
      });
      const datos = await respuesta.json();
      if (datos.success) {
        setEstado('exito');
        setSolicitud(SOLICITUD_VACIA);
      } else {
        setEstado('error');
      }
    } catch {
      setEstado('error');
    }
  };

  // Los checkboxes no llevan el estilo de etiqueta técnica de .form-tactico label
  const claseOpcionLegal =
    'items-start gap-3 !font-sans !normal-case !tracking-normal !text-fasor-sage font-normal cursor-pointer';

  return (
    <form className="form-tactico max-w-3xl" onSubmit={handleSubmit} noValidate={false}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="nombre">Nombre completo *</label>
          <input
            id="nombre"
            type="text"
            required
            autoComplete="name"
            placeholder="Tu nombre y apellidos"
            value={solicitud.nombre}
            onChange={(e) => actualizar('nombre', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="tu@email.com"
            value={solicitud.email}
            onChange={(e) => actualizar('email', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="telefono">Teléfono (opcional)</label>
          <input
            id="telefono"
            type="tel"
            autoComplete="tel"
            placeholder="600 000 000"
            value={solicitud.telefono}
            onChange={(e) => actualizar('telefono', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="localidad">Provincia / municipio *</label>
          <input
            id="localidad"
            type="text"
            required
            placeholder="Madrid / Getafe"
            value={solicitud.localidad}
            onChange={(e) => actualizar('localidad', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="unidad">Unidad de interés</label>
        <select
          id="unidad"
          value={solicitud.unidad}
          onChange={(e) => actualizar('unidad', e.target.value)}
        >
          <option>Sin preferencia</option>
          {unidades.map((unidad) => (
            <option key={unidad.id}>{unidad.nombre}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="motivacion">Motivación *</label>
        <textarea
          id="motivacion"
          required
          rows={5}
          placeholder="Cuéntanos por qué quieres unirte a FASOR y qué puedes aportar"
          value={solicitud.motivacion}
          onChange={(e) => actualizar('motivacion', e.target.value)}
        />
      </div>

      {/* Honeypot anti-spam: oculto para personas, los bots suelen rellenarlo */}
      <input
        type="checkbox"
        name="botcheck"
        tabIndex={-1}
        aria-hidden="true"
        className="hidden"
        checked={solicitud.botcheck === 'on'}
        onChange={(e) => actualizar('botcheck', e.target.checked ? 'on' : '')}
      />

      <div className="space-y-3">
        {/* display:flex inline: .form-tactico label (block) gana a la utilidad flex */}
        <label className={claseOpcionLegal} style={{ display: 'flex' }}>
          <input
            type="checkbox"
            required
            checked={solicitud.aceptaPrivacidad}
            onChange={(e) => actualizar('aceptaPrivacidad', e.target.checked)}
            className="mt-1 !w-4 h-4 !p-0 shrink-0 accent-[#C9A54A]"
          />
          <span className="text-sm">
            He leído y acepto la{' '}
            <Link
              to="/privacidad"
              className="text-fasor-gold underline underline-offset-2 hover:text-fasor-bone"
            >
              Política de Privacidad
            </Link>{' '}
            *
          </span>
        </label>
        <label className={claseOpcionLegal} style={{ display: 'flex' }}>
          <input
            type="checkbox"
            required
            checked={solicitud.mayorEdad}
            onChange={(e) => actualizar('mayorEdad', e.target.checked)}
            className="mt-1 !w-4 h-4 !p-0 shrink-0 accent-[#C9A54A]"
          />
          <span className="text-sm">Declaro ser mayor de 18 años *</span>
        </label>
      </div>

      <div className="space-y-4">
        <button type="submit" className="btn-solido" disabled={estado === 'enviando'}>
          <Send className="h-4 w-4" aria-hidden="true" />
          {estado === 'enviando' ? 'Enviando solicitud...' : 'Enviar solicitud'}
        </button>

        {/* Región viva: anuncia el resultado del envío a lectores de pantalla */}
        <div aria-live="polite" role="status" className="min-h-[1.5rem]">
          {estado === 'exito' && (
            <p className="m-0 inline-flex items-center gap-2 text-sm text-fasor-gold">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              Solicitud enviada correctamente. Te contactaremos en cuanto la Junta Directiva la
              valore.
            </p>
          )}
          {estado === 'error' && (
            <p className="m-0 inline-flex items-center gap-2 text-sm text-estado-rojo">
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
              No se pudo enviar la solicitud. Inténtalo de nuevo en unos minutos.
            </p>
          )}
        </div>
      </div>
    </form>
  );
}

// Únete: categorías de socios (art. 15), derechos y deberes (arts. 16-17)
// según el texto literal de los estatutos, cómo ingresar y formulario.
export default function Unete() {
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
            Únete
          </h1>
          <div className="linea-fade mt-6" aria-hidden="true"></div>
          <p className="mt-6 max-w-2xl leading-relaxed text-fasor-sage">
            FASOR crece con personas dispuestas a servir. Conoce las categorías de socios, tus
            derechos y deberes, y envía tu solicitud de ingreso.
          </p>
        </div>
      </header>

      {/* Categorías de socios */}
      <section className="content-container py-14 md:py-20">
        <div className="observe-me opacity-0 translate-y-8">
          <TituloSeccion
            numero="01"
            titulo="Categorías de Socios"
            intro="Según el artículo 15 de los estatutos."
          />
        </div>

        <div className="observe-me opacity-0 translate-y-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          {categoriasSocios.map((categoria) => (
            <div key={categoria.nombre} className="border-t-2 border-fasor-gold pt-5">
              <categoria.icono className="mb-3 h-6 w-6 text-fasor-gold" aria-hidden="true" />
              <h3 className="mb-2 font-display text-lg font-bold uppercase tracking-tight text-fasor-bone">
                {categoria.nombre}
              </h3>
              <p className="m-0 text-sm leading-relaxed text-fasor-sage">{categoria.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Derechos y deberes */}
      <section className="banda-superficie">
        <div className="content-container">
          <div className="observe-me opacity-0 translate-y-8">
            <TituloSeccion
              numero="02"
              titulo="Derechos y Deberes"
              intro="Según los artículos 16 y 17 de los estatutos."
            />
          </div>

          <div className="observe-me opacity-0 translate-y-8 grid grid-cols-1 gap-10 md:grid-cols-2">
            <div>
              <h3 className="mb-5 font-display text-lg font-bold uppercase tracking-tight text-fasor-bone">
                Derechos de los socios
              </h3>
              <ul className="m-0 list-none space-y-3 p-0">
                {derechosSocios.map((derecho) => (
                  <li key={derecho} className="flex items-start gap-3">
                    <Galon className="mt-1 h-3 w-2" />
                    <span className="text-sm leading-relaxed text-fasor-sage">{derecho}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-5 font-display text-lg font-bold uppercase tracking-tight text-fasor-bone">
                Deberes de los socios
              </h3>
              <ul className="m-0 list-none space-y-3 p-0">
                {deberesSocios.map((deber) => (
                  <li key={deber} className="flex items-start gap-3">
                    <Galon className="mt-1 h-3 w-2" />
                    <span className="text-sm leading-relaxed text-fasor-sage">{deber}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo ingresar */}
      <section className="banda">
        <div className="content-container">
          <div className="observe-me opacity-0 translate-y-8">
            <TituloSeccion numero="03" titulo="Cómo Ingresar" />
          </div>

          <div className="observe-me opacity-0 translate-y-8 grid grid-cols-1 gap-10 md:grid-cols-3">
            {PASOS.map((paso, i) => (
              <div key={paso.titulo} className="border-t border-fasor-line pt-5">
                <p className="m-0 mb-3 font-display text-5xl font-bold leading-none text-fasor-gold/60">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mb-2 font-display text-lg font-bold uppercase tracking-tight text-fasor-bone">
                  {paso.titulo}
                </h3>
                <p className="m-0 text-sm leading-relaxed text-fasor-sage">{paso.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulario de ingreso */}
      <section className="banda-superficie">
        <div className="content-container">
          <div className="observe-me opacity-0 translate-y-8">
            <TituloSeccion numero="04" titulo="Formulario de Ingreso" />
          </div>

          <div className="observe-me opacity-0 translate-y-8">
            <FormularioIngreso />

            <p className="mt-10 max-w-3xl text-xs leading-relaxed text-fasor-sage">
              La admisión de socios corresponde a la Junta Directiva. La pertenencia a FASOR está
              sujeta al régimen disciplinario previsto en los estatutos (arts. 11, 18 y 19).
            </p>

            {/* Vía alternativa al formulario */}
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-fasor-sage">
              También puedes escribirnos a{' '}
              <a
                href="mailto:ingreso@fasor.es"
                className="text-fasor-gold underline underline-offset-2 hover:text-fasor-bone"
              >
                ingreso@fasor.es
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
