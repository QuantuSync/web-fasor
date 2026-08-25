/** @type {import('tailwindcss').Config} */
// Sistema de diseño FASOR «Verde Táctico Evolucionado».
// El dorado es TINTA (líneas de 1px, texto, contornos): prohibidos glows,
// sombras doradas y degradados de relleno. El borde dorado estándar del
// sitio es `border-fasor-gold/25` (= rgba(201,165,74,0.25)).
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    // Tope global de 4px. `full` se conserva SOLO para formas intrínsecamente
    // circulares: escudos y el punto del indicador de estado.
    borderRadius: {
      none: '0',
      sm: '2px',
      DEFAULT: '4px',
      md: '4px',
      lg: '4px',
      xl: '4px',
      '2xl': '4px',
      '3xl': '4px',
      full: '9999px',
    },
    extend: {
      colors: {
        fasor: {
          bg: '#0C1710', // fondo base (verde casi negro)
          surface: '#12211A', // superficie 1: paneles, bandas alternas
          surface2: '#1A2E23', // superficie 2: elevación, hover
          line: '#24382C', // borde neutro
          gold: '#C9A54A', // dorado tinta
          bone: '#EDE8DA', // texto principal
          sage: '#9AA694', // texto secundario
        },
        // Semánticos del Protocolo de Activación (única excepción cromática)
        estado: {
          verde: '#7FB069',
          ambar: '#E0A83C',
          rojo: '#D65A4A',
        },
      },
      fontFamily: {
        display: ['"Saira Condensed"', '"Arial Narrow"', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', '"Cascadia Mono"', 'Consolas', '"Courier New"', 'monospace'],
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'fade-in-down': 'fadeInDown 0.8s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.6s ease-out',
        // Única excepción a «el dorado es tinta»: el destello de la pestaña Academy
        'destello-academy': 'destelloAcademy 2.6s ease-in-out infinite',
        // Apertura de la vista ampliada de unidad (fondo y panel). Breve y
        // sobria; con prefers-reduced-motion queda anulada desde index.css.
        'aparecer-fondo': 'fadeIn 0.18s ease-out',
        'aparecer-panel': 'aparecerPanel 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        // Latido de opacidad con un halo dorado muy leve. Solo lo usa la
        // pestaña Academy de la Navbar (ver CLAUDE.md).
        aparecerPanel: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        destelloAcademy: {
          '0%, 100%': { opacity: '1', textShadow: '0 0 0 rgba(201, 165, 74, 0)' },
          '50%': { opacity: '0.82', textShadow: '0 0 12px rgba(201, 165, 74, 0.55)' },
        },
      },
      screens: {
        xs: '475px',
      },
    },
  },
  plugins: [],
};
