/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        accent: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
          light: '#eff6ff',
        },
      },
      animation: {
        'slide-in-right': 'slideInRight 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-in-left':  'slideInLeft  0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-in-up':    'slideInUp    0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'fade-in':        'fadeIn       0.18s ease',
        'pulse-soft':     'pulseSoft    2s ease-in-out infinite',
        'spin':           'spin         0.9s linear infinite',
      },
    },
  },
  plugins: [],
}
