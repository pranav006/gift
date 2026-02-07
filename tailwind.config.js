/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      colors: {
        cream: { DEFAULT: '#f5f0eb', muted: '#e8e2dc', dark: '#d4ccc4' },
        burgundy: { DEFAULT: '#6b2d3c', light: '#8b4a54', dark: '#4a1c28' },
        gold: { DEFAULT: '#c9a962', muted: '#b8985c' },
      },
      transitionDuration: { 400: '400ms', 600: '600ms', 800: '800ms' },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.12)',
        'soft': '0 24px 48px -12px rgba(0,0,0,0.25)',
        'glow': '0 0 40px rgba(201, 169, 98, 0.15)',
      },
    },
  },
  plugins: [],
}
