/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './context/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        slime: '0 20px 80px rgba(34,197,94,.18)'
      }
    },
  },
  plugins: [],
}
