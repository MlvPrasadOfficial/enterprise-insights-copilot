/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary palette from Craftify inspiration
        'primary': {
          DEFAULT: '#4E3CFA',
          50: '#F4F7FE',
          100: '#E8EFFD',
          200: '#D1DFFA',
          300: '#A37CFE',
          400: '#7C5CFC',
          500: '#4E3CFA',
          600: '#3B2EF8',
          700: '#2821E6',
          800: '#1F1BCC',
          900: '#1A17B3',
        },
        'secondary': {
          DEFAULT: '#A37CFE',
          50: '#F5F2FF',
          100: '#EDE7FF',
          200: '#DDD2FF',
          300: '#A37CFE',
          400: '#8F5BFD',
          500: '#7B3AFC',
          600: '#6B22F8',
          700: '#5A1AE6',
          800: '#4A16CC',
          900: '#3E14B3',
        },
        // Neutral colors
        'background': '#020117',
        'surface': '#1a0b2e',
        'accent': '#68A063',
        // Glassmorphism colors
        'glass': {
          'white': 'rgba(255, 255, 255, 0.1)',
          'border': 'rgba(255, 255, 255, 0.2)',
        }
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4E3CFA 0%, #A37CFE 100%)',
        'gradient-surface': 'linear-gradient(135deg, #020117 0%, #1a0b2e 50%, #3d1a78 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};
