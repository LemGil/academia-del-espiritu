import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Academia del Espíritu',
        short_name: 'Academia',
        description: 'Portal de estudiantes — Ministerio Apostólico LemGil',
        theme_color: '#1A3A4A',
        background_color: '#F7F3E9',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-72x72.png',   sizes: '72x72',   type: 'image/png' },
          { src: 'icon-96x96.png',   sizes: '96x96',   type: 'image/png' },
          { src: 'icon-128x128.png', sizes: '128x128', type: 'image/png' },
          { src: 'icon-144x144.png', sizes: '144x144', type: 'image/png' },
          { src: 'icon-152x152.png', sizes: '152x152', type: 'image/png' },
          { src: 'icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-384x384.png', sizes: '384x384', type: 'image/png' },
          { src: 'icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ],
  build: {
    // Code-splitting: agrupa las librerías grandes en chunks propios para que
    // se descarguen una sola vez y se cacheen por separado del código de la app.
    // (Vite 8 usa Rolldown: manualChunks debe ser función, no objeto.)
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          const n = id.replace(/\\/g, "/");
          if (
            n.includes("node_modules/react-router-dom/") ||
            n.includes("node_modules/react-router/") ||
            n.includes("node_modules/react-dom/") ||
            n.includes("node_modules/react/")
          ) {
            return "vendor-react";
          }
          if (n.includes("node_modules/framer-motion/")) return "vendor-motion";
          if (n.includes("node_modules/@supabase/")) return "vendor-supabase";
          // Nota: jspdf/html2canvas NO se separan aquí a propósito: solo los usa
          // el panel de administración y el portal (chunks lazy); separarlos
          // provocaba que Rolldown los precargara junto al entry inicial.
        },
      },
    },
  },
})
