export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        gold: {
          50: "#fffbf0",
          100: "#fff8e1",
          200: "#ffefc3",
          300: "#ffe4a5",
          400: "#ffd87d",
          500: "#f0c850",
          600: "#d4b042",
          700: "#b89834",
          800: "#9c8026",
          900: "#806818",
        },
        silver: {
          50: "#fafaf9",
          100: "#f5f5f3",
          200: "#ebe9e4",
          300: "#d4d2ca",
          400: "#b8b5ac",
          500: "#a0a09a",
          600: "#8a8982",
          700: "#74736b",
          800: "#5e5d57",
          900: "#484743",
        },
      },
    },
  },
  darkMode: 'class',
}
