import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

// Componente de scroll to top
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-40 p-3 bg-alanizGold-600 text-alanizGreen-950
                 rounded-full shadow-lg hover:shadow-glow transition-all duration-300
                 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2
                 focus:ring-alanizGold-600 focus:ring-opacity-50"
      aria-label="Volver arriba"
    >
      <ArrowUp className="w-5 h-5" aria-hidden="true" />
    </button>
  );
};

// Loading bar para transiciones de página
const LoadingBar = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [location]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-alanizGreen-900">
      <div
        className="h-full bg-gradient-to-r from-alanizGold-600 to-alanizGold-400
                      animate-pulse transition-all duration-600 ease-out"
        style={{ width: '100%' }}
      ></div>
    </div>
  );
};

// Componente principal de Layout
export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  // Efecto para marcar el componente como montado
  useEffect(() => {
    setMounted(true);
  }, []);

  // Efecto para aplicar clases específicas según la ruta
  useEffect(() => {
    const body = document.body;

    // Limpiar clases anteriores
    body.classList.remove(
      'page-home',
      'page-unidades',
      'page-organizacion',
      'page-actuacion',
      'page-entidad',
      'page-abeiro',
      'page-unete'
    );

    // Aplicar clase según la ruta actual
    const routeClasses: Record<string, string> = {
      '/': 'page-home',
      '/unidades': 'page-unidades',
      '/organizacion': 'page-organizacion',
      '/actuacion': 'page-actuacion',
      '/entidad': 'page-entidad',
      '/abeiro': 'page-abeiro',
      '/unete': 'page-unete',
    };

    const pageClass = routeClasses[location.pathname];
    if (pageClass) {
      body.classList.add(pageClass);
    }

    body.style.background = '';

    return () => {
      // Cleanup
      body.style.background = '';
    };
  }, [location]);

  // Hook para manejar el intersection observer para animaciones
  useEffect(() => {
    if (!mounted) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    // Observar elementos que tengan la clase 'observe-me'
    const elementsToObserve = document.querySelectorAll('.observe-me');
    elementsToObserve.forEach((el) => {
      // Asegurar que el elemento tenga las clases iniciales correctas
      el.classList.add('opacity-0', 'translate-y-8');
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
      // Limpiar estilos inline al desmontar
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
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
                 bg-alanizGold-600 text-alanizGreen-950 px-4 py-2 rounded-lg
                 font-semibold z-[9999] transition-all duration-200"
    >
      Saltar al contenido principal
    </a>
  );

  // Background pattern component
  const BackgroundPattern = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Patrón sutil de fondo */}
      <div className="absolute inset-0 bg-heraldic"></div>

      {/* Elementos decorativos */}
      <div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-alanizGold-600/5
                      rounded-full blur-3xl animate-float"
        style={{ animationDelay: '0s', animationDuration: '8s' }}
      ></div>
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-alanizGold-600/3
                      rounded-full blur-3xl animate-float"
        style={{ animationDelay: '2s', animationDuration: '12s' }}
      ></div>

      {/* Vignette effect */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-alanizGreen-950/20
                      via-transparent to-alanizGreen-950/20"
      ></div>
      <div
        className="absolute inset-0 bg-gradient-to-t from-alanizGreen-950/30
                      via-transparent to-alanizGreen-950/30"
      ></div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Skip link para accesibilidad */}
      <SkipLink />

      {/* Loading bar */}
      <LoadingBar />

      {/* Background pattern */}
      <BackgroundPattern />

      {/* Header - Z-INDEX MUY ALTO para evitar solapamiento */}
      <div className="relative z-[9998]">
        <Navbar />
      </div>

      {/* Main content */}
      <main id="main-content" className="flex-grow relative z-10" role="main">
        {/* Container con animación suave */}
        <div className={`transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          {children}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Scroll to top button */}
      <ScrollToTopButton />
    </div>
  );
}
