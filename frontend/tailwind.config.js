module.exports = {
  darkMode: 'class', // enable class-based dark mode
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: 'hsl(170, 80%, 45%)', // teal accent color
        background: 'hsl(210, 15%, 12%)', // dark background
        surface: 'hsl(210, 15%, 18%)', // card surface
      },
    },
  },
  plugins: [],
}
