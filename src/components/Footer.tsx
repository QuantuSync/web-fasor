import { Mail, MapPin, FileCheck, Shield, ArrowUp, ExternalLink } from 'lucide-react';

// Datos registrales resumidos de la entidad
const RegistryInfo = () => (
  <div className="space-y-3">
    <h3 className="text-lg font-display font-semibold text-alanizGold-600 mb-4">
      Datos Registrales
    </h3>

    <div className="flex items-center space-x-3 text-sm text-parchment-300">
      <FileCheck className="w-4 h-4 text-alanizGold-600 flex-shrink-0" aria-hidden="true" />
      <span>
        Registro de Asociaciones de la Delegación Territorial de Valladolid — nº 0006429, sección
        Primera
      </span>
    </div>

    <div className="flex items-center space-x-3 text-sm text-parchment-300">
      <MapPin className="w-4 h-4 text-alanizGold-600 flex-shrink-0" aria-hidden="true" />
      <span>C/ Ribera de Castronuño 12 – Aldeamayor de San Martín (Valladolid)</span>
    </div>

    <div className="flex items-center space-x-3 text-sm text-parchment-300">
      <Mail className="w-4 h-4 text-alanizGold-600 flex-shrink-0" aria-hidden="true" />
      <a
        href="/unete"
        className="hover:text-alanizGold-600 transition-colors duration-200 underline-offset-2 hover:underline"
      >
        Cómo unirte a FASOR
      </a>
    </div>

    <div className="flex items-center space-x-3 text-sm text-parchment-300">
      <ExternalLink className="w-4 h-4 text-alanizGold-600 flex-shrink-0" aria-hidden="true" />
      <a
        href="https://casaalaniz.es"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-alanizGold-600 transition-colors duration-200 underline-offset-2 hover:underline"
      >
        casaalaniz.es
      </a>
    </div>
  </div>
);

// Componente de enlaces rápidos
const QuickLinks = () => {
  const links = [
    { href: '/', label: 'Inicio' },
    { href: '/unidades', label: 'Unidades' },
    { href: '/organizacion', label: 'Organización' },
    { href: '/actuacion', label: 'Actuación' },
    { href: '/entidad', label: 'Entidad' },
    { href: '/abeiro', label: 'Abeiro' },
    { href: '/unete', label: 'Únete' },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-display font-semibold text-alanizGold-600 mb-4">Navegación</h3>
      <nav className="grid grid-cols-2 gap-2">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-sm text-parchment-300 hover:text-alanizGold-600
                       transition-colors duration-200 underline-offset-2 hover:underline
                       block py-1"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  );
};

// Información de la entidad
const EntityInfo = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 mb-4">
      <Shield className="h-6 w-6 shrink-0 text-alanizGold-600" aria-hidden="true" />
      <h3 className="m-0 text-lg font-display font-semibold leading-none text-alanizGold-600">
        FASOR
      </h3>
    </div>

    <p className="text-sm text-parchment-300 leading-relaxed mb-4">
      Fuerza de Auxilio, Soporte y Rescate: asociación sin ánimo de lucro de protección civil y
      respuesta ante emergencias, impulsada por la Casa Alaniz.
    </p>

    <div className="bg-alanizGreen-800/50 rounded-lg p-4 border border-alanizGold-600/20">
      <p className="text-sm text-alanizGold-600 font-medium italic text-center">
        «Donde la memoria arde, también nace la fuerza de proteger.»
      </p>
      <p className="text-xs text-parchment-400 text-center mt-1">Disciplina • Valor • Servicio</p>
    </div>
  </div>
);

// Componente principal del Footer
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative bg-gradient-to-t from-alanizGreen-950 via-alanizGreen-900 to-alanizGreen-800
                      border-t border-alanizGold-600/20"
    >
      {/* Patrón decorativo superior */}
      <div
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r
                      from-transparent via-alanizGold-600 to-transparent opacity-50"
      ></div>

      <div className="content-container">
        {/* Contenido principal del footer */}
        <div className="py-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Información de la entidad */}
            <div>
              <EntityInfo />
            </div>

            {/* Enlaces rápidos */}
            <div>
              <QuickLinks />
            </div>

            {/* Datos registrales */}
            <div>
              <RegistryInfo />
            </div>
          </div>
        </div>

        {/* Footer inferior */}
        <div className="border-t border-alanizGold-600/15 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright y año */}
            <div className="text-center md:text-left">
              <p className="text-sm text-parchment-300">
                © {currentYear} FASOR —
                <span className="italic text-alanizGold-600 ml-1">
                  Fuerza de Auxilio, Soporte y Rescate
                </span>
              </p>
              <p className="text-xs text-parchment-400 mt-1">
                Asociación inscrita con el nº 0006429, sección Primera. Impulsada por la{' '}
                <a
                  href="https://casaalaniz.es"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-alanizGold-600 transition-colors duration-200 underline-offset-2 hover:underline"
                >
                  Casa Alaniz
                </a>
                .
              </p>
            </div>

            {/* Subir */}
            <div className="flex items-center space-x-6 text-xs text-parchment-400">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-alanizGold-600 transition-colors duration-200
                           underline-offset-2 hover:underline"
              >
                <span className="inline-flex items-center gap-1">
                  Subir <ArrowUp className="w-3 h-3" aria-hidden="true" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Elementos decorativos de fondo */}
      <div
        className="absolute bottom-0 left-1/4 w-32 h-32 bg-alanizGold-600/5
                      rounded-full blur-2xl -z-10"
      ></div>
      <div
        className="absolute bottom-0 right-1/4 w-48 h-48 bg-alanizGold-600/3
                      rounded-full blur-3xl -z-10"
      ></div>
    </footer>
  );
}
