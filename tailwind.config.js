/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta principal Casa Alaniz
        alanizGreen: {
          50: '#f0f4f1',
          100: '#dae6dc',
          200: '#b8d0bd',
          300: '#8fb497',
          400: '#659571',
          500: '#4a7555',
          600: '#3a5d43',
          700: '#2f4a36',
          800: '#243a2b',
          900: '#1a2d20',
          950: '#0d1e12', // Color original
        },
        alanizGold: {
          50: '#fefbf3',
          100: '#fef4e1',
          200: '#fce8c2',
          300: '#f8d498',
          400: '#f3be6c',
          500: '#eea445',
          600: '#d4af37', // Color original
          700: '#b8941f',
          800: '#9a7719',
          900: '#7f6117',
          950: '#4a3708',
        },
        parchment: {
          50: '#fdfdfc',
          100: '#f9f6ef', // Color original
          200: '#f4ede0',
          300: '#ede0ca',
          400: '#e4cfad',
          500: '#d8bb8d',
          600: '#c9a16a',
          700: '#b88549',
          800: '#956a39',
          900: '#785530',
        },
        // Colores de acento
        accent: {
          crimson: '#8B0000',
          silver: '#C0C0C0',
          ivory: '#FFFFF0',
          obsidian: '#0F0F0F',
        },
      },
      fontFamily: {
        serif: ['"Quantic Sci"', 'serif'],
        display: ['"Quantic Sci Display"', '"Quantic Sci"', 'serif'],
        sans: ['system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
        '7xl': ['4.5rem', { lineHeight: '1.1' }],
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
      },
      dropShadow: {
        gold: '0 0 6px #d4af37',
        'gold-lg': '0 0 12px #d4af37',
        'gold-xl': '0 0 20px #d4af3780',
        green: '0 0 6px #0d1e12',
        text: '2px 2px 4px rgba(13, 30, 18, 0.8)',
        glow: '0 0 20px rgba(212, 175, 55, 0.5)',
      },
      boxShadow: {
        'inner-gold': 'inset 0 2px 4px 0 rgba(212, 175, 55, 0.1)',
        glow: '0 0 20px rgba(212, 175, 55, 0.3)',
        'glow-lg': '0 0 30px rgba(212, 175, 55, 0.4)',
        elegant: '0 10px 25px -3px rgba(13, 30, 18, 0.3), 0 4px 6px -2px rgba(13, 30, 18, 0.05)',
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #d4af37 0%, #f3d673 100%)',
        'gradient-green': 'linear-gradient(135deg, #0d1e12 0%, #243a2b 50%, #0d1e12 100%)',
        'gradient-parchment': 'linear-gradient(135deg, #f9f6ef 0%, #f4ede0 100%)',
        'heraldic-pattern':
          'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.05) 0%, transparent 70%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'fade-in-down': 'fadeInDown 0.8s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.6s ease-out',
        glow: 'glow 2s ease-in-out infinite alternate',
        float: 'float 6s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
        glow: {
          '0%': { filter: 'drop-shadow(0 0 5px #d4af37)' },
          '100%': { filter: 'drop-shadow(0 0 20px #d4af37)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGold: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionProperty: {
        height: 'height',
        spacing: 'margin, padding',
      },
      screens: {
        xs: '475px',
      },
    },
  },
  plugins: [],
};
