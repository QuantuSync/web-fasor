import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScrollText, ClipboardCheck, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { categoriasSocios, derechosSocios, deberesSocios } from '../data/socios';
import { unidades } from '../data/unidades';

// Access key de Web3Forms: es pública por diseño (identifica el buzón de destino,
// no da acceso a nada). Sustituir el placeholder por la clave real.
const WEB3FORMS_ACCESS_KEY = 'WEB3FORMS_ACCESS_KEY';

type EstadoEnvio = 'inicial' | 'enviando' | 'exito' | 'error';

// Estado del formulario de alistamiento
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

// Formulario de alistamiento: envío a Web3Forms con fetch en el handler (regla SSG),
// validación en cliente y estados de envío anunciados en una región aria-live.
function FormularioAlistamiento() {
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
          subject: 'Nueva solicitud de alistamiento - FASOR',
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

  const clasesCampo =
    'w-full px-4 py-3 bg-alanizGreen-800/50 border border-alanizGold-600/30 rounded-lg ' +
    'text-parchment-100 placeholder-parchment-400 focus:border-alanizGold-600 ' +
    'focus:bg-alanizGreen-800/70 transition-all duration-300';

  return (
    <form className="form-elegant" onSubmit={handleSubmit} noValidate={false}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            placeholder="Valladolid / Aldeamayor de San Martín"
            value={solicitud.localidad}
            onChange={(e) => actualizar('localidad', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="unidad">Unidad de interés</label>
        <select
          id="unidad"
          className={clasesCampo}
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
        {/* display:flex inline: .form-elegant label (block) gana a la utilidad flex */}
        <label
          className="items-start gap-3 !text-parchment-300 font-normal cursor-pointer"
          style={{ display: 'flex' }}
        >
          <input
            type="checkbox"
            required
            checked={solicitud.aceptaPrivacidad}
            onChange={(e) => actualizar('aceptaPrivacidad', e.target.checked)}
            className="mt-1 !w-4 h-4 !p-0 shrink-0 accent-[#d4af37]"
          />
          <span className="text-sm">
            He leído y acepto la{' '}
            <Link
              to="/privacidad"
              className="text-alanizGold-500 underline underline-offset-2 hover:text-alanizGold-400"
            >
              Política de Privacidad
            </Link>{' '}
            *
          </span>
        </label>
        <label
          className="items-start gap-3 !text-parchment-300 font-normal cursor-pointer"
          style={{ display: 'flex' }}
        >
          <input
            type="checkbox"
            required
            checked={solicitud.mayorEdad}
            onChange={(e) => actualizar('mayorEdad', e.target.checked)}
            className="mt-1 !w-4 h-4 !p-0 shrink-0 accent-[#d4af37]"
          />
          <span className="text-sm">Declaro ser mayor de 18 años *</span>
        </label>
      </div>

      <div className="stack-centered space-y-4">
        <button type="submit" className="btn-alaniz" disabled={estado === 'enviando'}>
          <Send className="mr-2 h-5 w-5" aria-hidden="true" />
          {estado === 'enviando' ? 'Enviando solicitud...' : 'Enviar solicitud'}
        </button>

        {/* Región viva: anuncia el resultado del envío a lectores de pantalla */}
        <div aria-live="polite" role="status" className="min-h-[1.5rem] text-center">
          {estado === 'exito' && (
            <p className="inline-flex items-center gap-2 text-sm text-alanizGold-500">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              Solicitud enviada correctamente. Te contactaremos en cuanto la Junta Directiva la
              valore.
            </p>
          )}
          {estado === 'error' && (
            <p className="inline-flex items-center gap-2 text-sm text-red-300/80">
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
              No se pudo enviar la solicitud. Inténtalo de nuevo en unos minutos.
            </p>
          )}
        </div>
      </div>
    </form>
  );
}

// Página de Únete: categorías de socios (art. 15), derechos y deberes (arts. 16-17)
// según el texto literal de los estatutos, cómo alistarse y formulario de alistamiento.
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
    <div className="min-h-screen py-16 md:py-24">
      <div className="content-container">
        <div className="stack-centered mb-12 observe-me opacity-0 translate-y-8">
          <h1 className="font-display text-4xl font-bold text-alanizGold-600 md:text-5xl">Únete</h1>
          <div className="rule-gold mt-4" aria-hidden="true"></div>
          <p className="mt-4 max-w-2xl text-center text-lg leading-relaxed text-parchment-300">
            FASOR crece con personas dispuestas a servir. Conoce las categorías de socios, tus
            derechos y deberes, y envía tu solicitud de alistamiento.
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-12">
          <div
            className="card-elegant observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '200ms' }}
          >
            <h2 className="text-2xl font-display font-semibold text-alanizGold-600 mb-2">
              Categorías de Socios
            </h2>
            <p className="text-sm text-parchment-400 mb-6">
              Según el artículo 15 de los estatutos.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categoriasSocios.map((categoria) => (
                <div
                  key={categoria.nombre}
                  className="stack-centered rounded-lg border border-alanizGold-600/30 bg-alanizGreen-900/50 p-6"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 border-2 border-alanizGold-600 bg-transparent rounded-full mb-4">
                    <categoria.icono className="w-5 h-5 text-alanizGold-600" aria-hidden="true" />
                  </div>
                  <h3 className="font-display font-semibold text-alanizGold-500 mb-2">
                    {categoria.nombre}
                  </h3>
                  <p className="text-sm text-parchment-300 text-center">{categoria.descripcion}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="card-elegant observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '400ms' }}
          >
            <h2 className="text-2xl font-display font-semibold text-alanizGold-600 mb-2">
              Derechos y Deberes
            </h2>
            <p className="text-sm text-parchment-400 mb-6">
              Según los artículos 16 y 17 de los estatutos.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-alanizGreen-900/50 rounded-lg p-6 border border-alanizGold-600/30">
                <h3 className="font-display font-semibold text-alanizGold-500 mb-4 flex items-center">
                  <ScrollText className="w-5 h-5 mr-2 text-alanizGold-600" aria-hidden="true" />
                  Derechos de los socios
                </h3>
                <ul className="space-y-3">
                  {derechosSocios.map((derecho) => (
                    <li key={derecho} className="flex items-start gap-3">
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-alanizGold-600"
                        aria-hidden="true"
                      ></span>
                      <span className="text-sm leading-relaxed text-parchment-300">{derecho}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-alanizGreen-900/50 rounded-lg p-6 border border-alanizGold-600/30">
                <h3 className="font-display font-semibold text-alanizGold-500 mb-4 flex items-center">
                  <ClipboardCheck className="w-5 h-5 mr-2 text-alanizGold-600" aria-hidden="true" />
                  Deberes de los socios
                </h3>
                <ul className="space-y-3">
                  {deberesSocios.map((deber) => (
                    <li key={deber} className="flex items-start gap-3">
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-alanizGold-600"
                        aria-hidden="true"
                      ></span>
                      <span className="text-sm leading-relaxed text-parchment-300">{deber}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div
            className="card-elegant observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '600ms' }}
          >
            <h2 className="text-2xl font-display font-semibold text-alanizGold-600 mb-6 text-center">
              Cómo Alistarse
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="stack-centered">
                <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-alanizGold-600 bg-transparent rounded-full mb-4">
                  <span className="text-alanizGold-600 text-xl font-bold">1</span>
                </div>
                <h3 className="font-display font-semibold text-alanizGold-500 mb-3">
                  Envía tu solicitud
                </h3>
                <p className="text-sm text-parchment-300 text-center">
                  Rellena el formulario de alistamiento con tus datos y tu motivación.
                </p>
              </div>

              <div className="stack-centered">
                <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-alanizGold-600 bg-transparent rounded-full mb-4">
                  <span className="text-alanizGold-600 text-xl font-bold">2</span>
                </div>
                <h3 className="font-display font-semibold text-alanizGold-500 mb-3">Valoración</h3>
                <p className="text-sm text-parchment-300 text-center">
                  La Junta Directiva valora tu solicitud y te contacta para conocerte.
                </p>
              </div>

              <div className="stack-centered">
                <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-alanizGold-600 bg-transparent rounded-full mb-4">
                  <span className="text-alanizGold-600 text-xl font-bold">3</span>
                </div>
                <h3 className="font-display font-semibold text-alanizGold-500 mb-3">
                  Incorporación
                </h3>
                <p className="text-sm text-parchment-300 text-center">
                  Ingresas como Cadete en Formación y comienzas tu instrucción.
                </p>
              </div>
            </div>
          </div>

          <div
            className="card-elegant border-2 border-alanizGold-600/40 observe-me opacity-0 translate-y-8"
            style={{ animationDelay: '800ms' }}
          >
            <h2 className="text-2xl font-display font-semibold text-alanizGold-600 mb-6 text-center">
              Formulario de Alistamiento
            </h2>

            <FormularioAlistamiento />

            <p className="mt-8 text-center text-xs leading-relaxed text-parchment-400">
              La admisión de socios corresponde a la Junta Directiva. La pertenencia a FASOR está
              sujeta al régimen disciplinario previsto en los estatutos (arts. 11, 18 y 19).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
