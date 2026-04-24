module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Google Sans', 'sans-serif'],
      },
      colors: {
        primary: '#3B82F6',
        secondary: '#1F2937',
      }
    },
  },
  plugins: [],
}
