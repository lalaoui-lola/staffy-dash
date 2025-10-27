/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs personnalisées du client
        brand: {
          peach: '#F7C7BB',      // Rose pêche clair
          teal: '#175C64',       // Vert-bleu foncé
          light: '#EEF2F2',      // Gris très clair
          dark: '#0E3A40',       // Vert-bleu très foncé
          50: '#f0fafb',
          100: '#d9f2f4',
          200: '#b3e5e9',
          300: '#8dd8de',
          400: '#67cbd3',
          500: '#175C64',
          600: '#134a51',
          700: '#0f383d',
          800: '#0E3A40',
          900: '#0a2629',
        },
        accent: {
          50: '#fef5f3',
          100: '#fde9e5',
          200: '#fbd3cb',
          300: '#F7C7BB',
          400: '#f5b5a6',
          500: '#f3a391',
          600: '#f1917c',
          700: '#ef7f67',
          800: '#ed6d52',
          900: '#eb5b3d',
        },
      },
    },
  },
  plugins: [],
}
