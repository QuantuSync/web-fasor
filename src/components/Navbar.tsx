import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ExternalLink, X, Menu } from 'lucide-react';
import fasorLogo from '../assets/fasor.jpg';

// Navegación plana (sin submenús). /abeiro no va aquí: se llega desde
// Actualidad. Las rutas legales tampoco (van en el Footer).
const navigationItems = [
  { path: '/', label: 'Inicio' },
  { path: '/unidades', label: 'Unidades' },
  { path: '/organizacion', label: 'Organización' },
  { path: '/actuacion', label: 'Actuación' },
  { path: '/academy', label: 'Academy' },
  { path: '/actualidad', label: 'Actualidad' },
  { path: '/entidad', label: 'Entidad' },
  { path: '/unete', label: 'Únete' },
] as const;

// Logo: sello circular pequeño con filete fino + wordmark condensado
const Logo = React.memo(() => (
  <NavLink to="/" end className="group flex items-center gap-3" aria-label="FASOR - Inicio">
    <img
      src={fasorLogo}
      alt="Sello de FASOR"
      className="h-8 w-8 shrink-0 rounded-full border border-fasor-gold/40 object-cover"
      loading="eager"
    />
    <span className="font-display text-lg font-bold uppercase tracking-[0.2em] text-fasor-bone transition-colors duration-200 group-hover:text-fasor-gold">
      FASOR
    </span>
  </NavLink>
));

// Enlace de navegación: mayúsculas condensadas; el activo lleva subrayado
// dorado de 2px pegado a la línea inferior de la navbar.
const NavItem = React.memo(
  ({ path, label, onClick }: { path: string; label: string; onClick?: () => void }) => (
    <NavLink
      to={path}
      end={path === '/'}
      onClick={onClick}
      className={({ isActive }) => `
        relative flex h-full items-center px-3 font-display text-xs font-semibold uppercase
        tracking-[0.15em] transition-colors duration-200
        ${isActive ? 'text-fasor-gold' : 'text-fasor-sage hover:text-fasor-bone'}
      `}
      aria-label={`Ir a ${label}`}
    >
      {({ isActive }) => (
        <>
          {label}
          {isActive && (
            <span
              className="absolute inset-x-2 bottom-0 h-0.5 bg-fasor-gold"
              aria-hidden="true"
            ></span>
          )}
        </>
      )}
    </NavLink>
  )
);

// Enlace externo a la web de la Casa Alaniz
const CasaAlanizLink = ({ onClick }: { onClick?: () => void }) => (
  <a
    href="https://casaalaniz.es"
    target="_blank"
    rel="noopener noreferrer"
    onClick={onClick}
    className="flex items-center gap-1.5 px-3 font-display text-xs font-semibold uppercase
               tracking-[0.15em] text-fasor-sage transition-colors duration-200 hover:text-fasor-bone"
    aria-label="Ir a la web de la Casa Alaniz (se abre en una pestaña nueva)"
  >
    Casa Alaniz
    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
  </a>
);

// Menú móvil: panel plano sobre superficie, sin sombras decorativas
const MobileMenu = React.memo(({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  return (
    <div
      className={`fixed inset-0 z-[99999] transition-opacity duration-300 lg:hidden
                  ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación móvil"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-fasor-bg/90" onClick={onClose} aria-hidden="true"></div>

      {/* Panel */}
      <div
        className={`absolute right-0 top-0 h-full w-72 max-w-[85vw] border-l border-fasor-gold/25
                    bg-fasor-surface transition-transform duration-300 ease-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center justify-between border-b border-fasor-gold/25 p-5">
          <Logo />
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="rounded-sm p-2 text-fasor-gold transition-colors duration-200 hover:bg-fasor-surface2"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav
          className="max-h-[calc(100vh-140px)] space-y-1 overflow-y-auto p-5"
          role="navigation"
          aria-label="Navegación principal"
        >
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onClose}
              className={({ isActive }) => `
                block border-l-2 px-4 py-3 font-display text-sm font-semibold uppercase
                tracking-[0.15em] transition-colors duration-200
                ${
                  isActive
                    ? 'border-fasor-gold text-fasor-gold'
                    : 'border-transparent text-fasor-sage hover:border-fasor-gold/40 hover:text-fasor-bone'
                }
              `}
            >
              {item.label}
            </NavLink>
          ))}
          <a
            href="https://casaalaniz.es"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-2 border-l-2 border-transparent px-4 py-3 font-display
                       text-sm font-semibold uppercase tracking-[0.15em] text-fasor-sage
                       transition-colors duration-200 hover:text-fasor-bone"
          >
            Casa Alaniz
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </nav>

        <div className="absolute inset-x-0 bottom-0 border-t border-fasor-gold/25 p-5">
          <p className="m-0 text-center font-mono text-[10px] tracking-[0.25em] text-fasor-sage">
            DISCIPLINA • VALOR • SERVICIO
          </p>
        </div>
      </div>
    </div>
  );
});

// Navbar principal: fina, fondo base con línea inferior dorada de 1px
export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Manejar ESC key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen((prev) => !prev), []);
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  return (
    <>
      <header
        className="sticky top-0 z-[99998] border-b border-fasor-gold/25 bg-fasor-bg/95 backdrop-blur-sm"
        role="banner"
      >
        <div className="content-container">
          <nav
            className="flex h-14 items-center justify-between"
            role="navigation"
            aria-label="Navegación principal"
          >
            <Logo />

            {/* Navegación de escritorio */}
            <div className="hidden h-full items-center lg:flex">
              {navigationItems.map((item) => (
                <NavItem key={item.path} path={item.path} label={item.label} />
              ))}
              <span className="mx-2 h-4 w-px bg-fasor-gold/25" aria-hidden="true"></span>
              <CasaAlanizLink />
            </div>

            {/* Botón de menú móvil */}
            <button
              onClick={toggleMobileMenu}
              aria-label={
                isMobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'
              }
              aria-expanded={isMobileMenuOpen}
              className="rounded-sm p-2 text-fasor-gold transition-colors duration-200
                         hover:bg-fasor-surface lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </header>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
    </>
  );
}
