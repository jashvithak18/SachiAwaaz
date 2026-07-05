/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parakh: {
          bg: '#F6F4EF',
          card: '#FBFAF8',
          text: '#181818',
          secondary: '#666666',
          accent: '#3E5C4B',
          error: '#A1493F',
          border: '#E4E1DA',
        },
        brand: {
          50: '#FBFAF8',
          100: '#F6F4EF',
          200: '#E4E1DA',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#666666',
          600: '#4b4845',
          700: '#332f2c',
          800: '#181818',
          900: '#181818',
          950: '#FBFAF8',
        },
        accent: {
          blue: '#3E5C4B',
          teal: '#3E5C4B',
          green: '#3E5C4B',
          red: '#A1493F',
          amber: '#3E5C4B',
          yellow: '#3E5C4B',
        },
        lightBg: '#F6F4EF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
