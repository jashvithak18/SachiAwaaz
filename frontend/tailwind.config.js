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
          text: '#132219',
          secondary: '#476150',
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
          500: '#476150',
          600: '#2C4235',
          700: '#22382A',
          800: '#132219',
          900: '#132219',
          950: '#0B140F',
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
