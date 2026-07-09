import { Mail, IdCard, FileCheck, ArrowUp, ExternalLink } from 'lucide-react';
import Galon from './Galon';

// Identidad de la entidad
const EntityInfo = () => (
  <div>
    <div className="mb-4 flex items-center gap-2">
      <Galon count={2} className="h-3 w-2" />
      <h3 className="m-0 font-display text-base font-bold uppercase tracking-[0.2em] text-fasor-bone">
        FASOR
      </h3>
    </div>

    <p className="mb-4 text-sm leading-relaxed text-fasor-sage">
      Fuerza de Auxilio, Soporte y Rescate: asociación sin ánimo de lucro de protección civil y
      respuesta ante emergencias, impulsada por la Casa Alaniz.
    </p>

    <p className="mb-1 text-sm italic leading-relaxed text-fasor-bone">
      «Donde la memoria arde, también nace la fuerza de proteger.»
    </p>
    <p className="m-0 font-mono text-[10px] tracking-[0.25em] text-fasor-gold">
      DISCIPLINA • VALOR • SERVICIO
    </p>
  </div>
);

// Enlaces de navegación
const QuickLinks = () => {
  const links = [
    { href: '/', label: 'Inicio' },
    { href: '/unidades', label: 'Unidades' },
    { href: '/organizacion', label: 'Organización' },
    { href: '/actuacion', label: 'Actuación' },
    { href: '/actualidad', label: 'Actualidad' },
    { href: '/entidad', label: 'Entidad' },
    { href: '/abeiro', label: 'Abeiro' },
    { href: '/unete', label: 'Únete' },
  ];

  return (
    <div>
      <h3 className="etiqueta mb-4">Navegación</h3>
      <nav className="grid grid-cols-2 gap-x-4 gap-y-2">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-sm text-fasor-sage underline-offset-2 hover:text-fasor-gold hover:underline"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  );
};

// Datos registrales resumidos (sin dirección postal, por la regla de privacidad)
const RegistryInfo = () => (
  <div>
    <h3 className="etiqueta mb-4">Datos Registrales</h3>
    <div className="space-y-3">
      <div className="flex items-start gap-3 text-sm text-fasor-sage">
        <FileCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-fasor-gold" aria-hidden="true" />
        <span>Inscrita en el Registro de Asociaciones con el número 0006429, sección Primera</span>
      </div>

      <div className="flex items-center gap-3 text-sm text-fasor-sage">
        <IdCard className="h-4 w-4 flex-shrink-0 text-fasor-gold" aria-hidden="true" />
        <span className="font-mono text-xs tracking-wider">NIF G93758183</span>
      </div>

      <div className="flex items-center gap-3 text-sm text-fasor-sage">
        <Mail className="h-4 w-4 flex-shrink-0 text-fasor-gold" aria-hidden="true" />
        <a href="/unete" className="underline-offset-2 hover:text-fasor-gold hover:underline">
          Cómo unirte a FASOR
        </a>
      </div>

      <div className="flex items-center gap-3 text-sm text-fasor-sage">
        <ExternalLink className="h-4 w-4 flex-shrink-0 text-fasor-gold" aria-hidden="true" />
        <a
          href="https://casaalaniz.es"
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 hover:text-fasor-gold hover:underline"
        >
          casaalaniz.es
        </a>
      </div>
    </div>
  </div>
);

// Footer sobrio a bandas, separadas por líneas doradas de 1px
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-fasor-gold/25 bg-fasor-surface">
      <div className="content-container">
        {/* Banda principal */}
        <div className="grid grid-cols-1 gap-10 py-12 md:grid-cols-3">
          <EntityInfo />
          <QuickLinks />
          <RegistryInfo />
        </div>
      </div>

      {/* Banda inferior */}
      <div className="border-t border-fasor-line">
        <div className="content-container flex flex-col items-center justify-between gap-4 py-5 md:flex-row">
          <div className="text-center md:text-left">
            <p className="m-0 text-xs text-fasor-sage">
              © {currentYear} FASOR — Fuerza de Auxilio, Soporte y Rescate
            </p>
            <p className="m-0 mt-1 text-xs text-fasor-sage">
              Asociación inscrita con el nº 0006429, sección Primera. Impulsada por la{' '}
              <a
                href="https://casaalaniz.es"
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-2 hover:text-fasor-gold hover:underline"
              >
                Casa Alaniz
              </a>
              .
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-fasor-sage">
            <a
              href="/aviso-legal"
              className="underline-offset-2 hover:text-fasor-gold hover:underline"
            >
              Aviso Legal
            </a>
            <a
              href="/privacidad"
              className="underline-offset-2 hover:text-fasor-gold hover:underline"
            >
              Privacidad
            </a>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="underline-offset-2 hover:text-fasor-gold hover:underline"
            >
              <span className="inline-flex items-center gap-1">
                Subir <ArrowUp className="h-3 w-3" aria-hidden="true" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
