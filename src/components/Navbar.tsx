import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Shield,
  Medal,
  Target,
  Scale,
  Flame,
  Handshake,
  ExternalLink,
  X,
  Menu,
  type LucideIcon,
} from 'lucide-react';
import fasorLogo from '../assets/fasor.jpg';

// Configuración de navegación: las 7 rutas del sitio (sin submenús)
const navigationItems = [
  { path: '/', label: 'Inicio', icon: Home },
  { path: '/unidades', label: 'Unidades', icon: Shield },
  { path: '/organizacion', label: 'Organización', icon: Medal },
  { path: '/actuacion', label: 'Actuación', icon: Target },
  { path: '/entidad', label: 'Entidad', icon: Scale },
  { path: '/abeiro', label: 'Abeiro', icon: Flame },
  { path: '/unete', label: 'Únete', icon: Handshake },
] as const;

// Componente del logo (sello FASOR pequeño)
const Logo = React.memo(() => (
  <NavLink
    to="/"
    end
    className="group flex items-center gap-3 leading-none transition-all duration-300"
    aria-label="FASOR - Inicio"
  >
    <span className="subtle-glow flex h-10 w-10 shrink-0 items-center justify-center drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
      <img
        src={fasorLogo}
        alt="Sello de FASOR"
        className="h-full w-full rounded-full object-cover brightness-110 transition-all duration-300 group-hover:brightness-125"
        loading="eager"
      />
    </span>
    <span className="hidden font-display text-xl font-semibold leading-none text-alanizGold-600 transition-colors duration-300 group-hover:text-alanizGold-500 lg:inline-block">
      FASOR
    </span>
  </NavLink>
));

// Componente de link de navegación simple
const NavItem = React.memo(
  ({
    path,
    label,
    icon,
    onClick,
  }: {
    path: string;
    label: string;
    icon: LucideIcon;
    onClick?: () => void;
  }) => (
    <NavLink
      to={path}
      end={path === '/'}
      onClick={onClick}
      className={({ isActive }) => `
      relative flex items-center space-x-2 px-3 py-2 rounded-lg
      font-medium transition-all duration-300 group text-sm
      ${
        isActive
          ? 'text-alanizGold-500 bg-alanizGold-600/10'
          : 'text-alanizGold-600/80 hover:text-alanizGold-500 hover:bg-alanizGold-600/5'
      }
    `}
      aria-label={`Ir a ${label}`}
    >
      {({ isActive }) => (
        <>
          <span
            className="transition-transform duration-300 group-hover:scale-110"
            aria-hidden="true"
          >
            {React.createElement(icon, { className: 'w-4 h-4' })}
          </span>
          <span className="text-sm font-semibold tracking-wide">{label}</span>
          {isActive && (
            <div
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2
                          w-6 h-0.5 bg-alanizGold-600 rounded-full"
              aria-hidden="true"
            ></div>
          )}
          <div
            className="absolute inset-0 bg-alanizGold-600/10 rounded-lg scale-0
                        group-hover:scale-100 transition-transform duration-300 -z-10"
            aria-hidden="true"
          ></div>
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
    className="relative flex items-center space-x-2 px-3 py-2 rounded-lg
               font-medium transition-all duration-300 group text-sm
               text-alanizGold-600/80 hover:text-alanizGold-500 hover:bg-alanizGold-600/5"
    aria-label="Ir a la web de la Casa Alaniz (se abre en una pestaña nueva)"
  >
    <span className="transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
      <ExternalLink className="w-4 h-4" />
    </span>
    <span className="text-sm font-semibold tracking-wide">Casa Alaniz</span>
  </a>
);

// Componente del menú móvil
const MobileMenu = React.memo(({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <div
      className={`fixed inset-0 z-[99999] lg:hidden transition-opacity duration-300
                     ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación móvil"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-alanizGreen-950/90 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Menu panel */}
      <div
        className={`absolute top-0 right-0 h-full w-80 max-w-[85vw]
                       bg-gradient-to-b from-alanizGreen-800 to-alanizGreen-900
                       border-l border-alanizGold-600/20 shadow-2xl
                       transform transition-transform duration-300 ease-out
                       ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-alanizGold-600/20">
          <Logo />
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="p-2 text-alanizGold-600 hover:text-alanizGold-500
                       hover:bg-alanizGold-600/10 rounded-lg transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-alanizGold-600"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation */}
        <nav
          className="p-6 space-y-2 overflow-y-auto max-h-[calc(100vh-120px)]"
          role="navigation"
          aria-label="Navegación principal"
        >
          {navigationItems.map((item) => (
            <NavItem
              key={item.path}
              path={item.path}
              label={item.label}
              icon={item.icon}
              onClick={onClose}
            />
          ))}
          <CasaAlanizLink onClick={onClose} />
        </nav>

        {/* Footer info */}
        <div
          className="absolute bottom-0 left-0 right-0 p-6
                        border-t border-alanizGold-600/20"
        >
          <p className="text-xs text-alanizGold-600/60 text-center italic">
            Disciplina • Valor • Servicio
          </p>
        </div>
      </div>
    </div>
  );
});

// Componente principal del Navbar
export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Efecto de scroll para el navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Manejar ESC key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-[99998] transition-all duration-300
                    ${
                      isScrolled
                        ? 'bg-alanizGreen-950/95 backdrop-blur-md shadow-lg border-b border-alanizGold-600/20'
                        : 'bg-alanizGreen-950/90 backdrop-blur-sm'
                    }`}
        role="banner"
      >
        <div className="content-container">
          <nav
            className="flex items-center justify-between h-16 lg:h-20"
            role="navigation"
            aria-label="Navegación principal"
          >
            {/* Logo */}
            <Logo />

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 ml-12">
              {navigationItems.map((item) => (
                <NavItem key={item.path} path={item.path} label={item.label} icon={item.icon} />
              ))}
              <CasaAlanizLink />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              aria-label={
                isMobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'
              }
              aria-expanded={isMobileMenuOpen}
              className="lg:hidden p-2 text-alanizGold-600 hover:text-alanizGold-500
                         hover:bg-alanizGold-600/10 rounded-lg transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-alanizGold-600 focus:ring-opacity-50"
            >
              <Menu className="w-6 h-6" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
    </>
  );
}
