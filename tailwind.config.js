/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Lato"', 'sans-serif'],
      },
      colors: {
        christmas: {
          red: '#4a0404',      // Deep velvet red
          green: '#0f2f18',    // Deep pine green
          gold: '#d4af37',     // Metallic gold
          cream: '#f8f5e6',    // Paper cream
          dark: '#1a1a1a',     // Soft black
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
