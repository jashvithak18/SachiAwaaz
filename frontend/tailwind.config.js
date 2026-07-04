/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B', // Confident deep slate blue for headings/branding
          900: '#0F172A',
        },
        accent: {
          blue: '#1D4ED8',   // Royal trustworthy blue for primary buttons
          teal: '#0D9488',   // Confident alternative
          green: '#16A34A',  // Clear green for verified/safe
          red: '#DC2626',    // Clear red for mismatch
          amber: '#D97706',  // Clear amber for AI flagged
        },
        lightBg: '#FAFAF9',  // Clean warm stone/off-white background
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
