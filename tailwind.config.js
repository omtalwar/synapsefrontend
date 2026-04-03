/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", 'system-ui', 'sans-serif'],
        mono: ["'Space Mono'", 'monospace'],
      },
      colors: {
        navy: { 900: '#0D1B2A', 800: '#1B2A4A', 700: '#243660' },
        accent: { DEFAULT: '#4A7FDB', light: '#6B9FEB' },
      },
      animation: {
        'fade-up': 'fadeUp 0.45s cubic-bezier(0.4,0,0.2,1) both',
        'fade-in': 'fadeIn 0.4s ease both',
        'scale-in': 'scaleIn 0.35s cubic-bezier(0.4,0,0.2,1) both',
        'slide-right': 'slideInRight 0.4s cubic-bezier(0.4,0,0.2,1) both',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
        'ping-slow': 'ping-slow 2s ease-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(18px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        scaleIn: {
          from: { opacity: 0, transform: 'scale(0.94)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
        slideInRight: {
          from: { opacity: 0, transform: 'translateX(24px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
