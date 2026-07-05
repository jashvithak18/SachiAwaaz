/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parakhBg: '#FFF8F2',
        parakhSurface: '#FFFDF9',
        parakhPrimary: '#7C3AED',
        parakhSecondary: '#F97316',
        parakhAccent: '#14B8A6',
        parakhHighlight: '#FBBF24',
        parakhText: '#1E1B18',
        parakhMuted: '#6B7280',
        parakhBorder: 'rgba(124,58,237,0.12)',
        
        brand: {
          50: '#FFFDF9',
          100: '#FFF8F2',
          200: 'rgba(124,58,237,0.12)',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#6B7280',
          600: '#4b4845',
          700: '#332f2c',
          800: '#1E1B18',
          900: '#1E1B18',
          950: '#FFFDF9',
        },
        accent: {
          blue: '#7C3AED',   // Royal Purple
          teal: '#14B8A6',   // Teal
          green: '#14B8A6',  // Teal (Success)
          red: '#DC2626',    // Red (Danger)
          amber: '#F97316',  // Soft Orange (Secondary)
          yellow: '#FBBF24', // Amber
        },
        lightBg: '#FFF8F2',  // Warm Ivory
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
