/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',                // <-- added
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Libre Caslon Display"', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}