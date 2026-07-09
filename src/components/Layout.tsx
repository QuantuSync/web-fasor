import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

// Botón de volver arriba: cuadrado de contorno dorado, sin sombras
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-40 rounded-sm border border-fasor-gold/60 bg-fasor-surface
                 p-3 text-fasor-gold transition-colors duration-200 hover:bg-fasor-surface2"
      aria-label="Volver arriba"
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
};

// Indicador de carga en transiciones: línea dorada de 1px bajo el borde superior
const LoadingBar = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [location]);

  if (!loading) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-[9999] h-px overflow-hidden">
      <div className="linea-fade h-px w-full"></div>
    </div>
  );
};

// Layout principal: fondo plano (sin patrones animados ni elementos flotantes),
// navbar fina, contenido y footer a bandas.
export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // IntersectionObserver global para las animaciones de entrada (.observe-me)
  useEffect(() => {
    if (!mounted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0.1 }
    );

    const elementsToObserve = document.querySelectorAll('.observe-me');
    elementsToObserve.forEach((el) => {
      el.classList.add('opacity-0', 'translate-y-8');
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
      elementsToObserve.forEach((el) => {
        el.style.opacity = '';
        el.style.transform = '';
      });
    };
  }, [mounted, location]);

  // Skip link para accesibilidad
  const SkipLink = () => (
    <a
      href="#main-content"
      className="sr-only z-[9999] rounded-sm bg-fasor-gold px-4 py-2 font-display text-sm
                 font-semibold uppercase text-fasor-bg focus:not-sr-only focus:absolute
                 focus:left-4 focus:top-4"
    >
      Saltar al contenido principal
    </a>
  );

  return (
    <div className="relative flex min-h-screen flex-col bg-fasor-bg">
      <SkipLink />
      <LoadingBar />

      <div className="relative z-[9998]">
        <Navbar />
      </div>

      <main id="main-content" className="relative z-10 flex-grow" role="main">
        <div className={`transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          {children}
        </div>
      </main>

      <Footer />
      <ScrollToTopButton />
    </div>
  );
}
