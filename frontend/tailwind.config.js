/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta estilo Notion/SaaS
        brand: {
          50: '#f5f7fa',
          100: '#eef2f7',
          600: '#2563eb', // Azul profesional
          900: '#0f172a', // Slate oscuro para textos
        },
      },
    },
  },
  plugins: [],
}
