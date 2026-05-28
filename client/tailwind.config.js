/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#050b14', 
        darkCard: '#0b1426', 
        glassBorder: 'rgba(6, 182, 212, 0.15)', 
        brandPrimary: '#06b6d4', 
        brandSecondary: '#3b82f6', 
        brandAccent: '#0ea5e9', 
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(6, 182, 212, 0.2)', 
        glowBlue: '0 0 25px rgba(59, 130, 246, 0.3)', 
      }
    },
  },
  plugins: [],
}
