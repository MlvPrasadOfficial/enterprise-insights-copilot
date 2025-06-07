/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#3C873A', // Node.js green
        'background': '#181A1B', // Almost black
        'accent': '#68A063',
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
