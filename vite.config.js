import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Fix ESM/CJS interop issue with leaflet + react-leaflet under Vite 5+
  optimizeDeps: {
    include: ['leaflet'],
    exclude: ['react-leaflet'],
  },
  resolve: {
    dedupe: ['leaflet'],
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('recharts')) return 'charts'
          if (id.includes('leaflet')) return 'maps'
          if (id.includes('react-dom') || id.includes('react-router') || id.includes('/react/')) return 'react'
          return undefined
        },
      },
    },
  },
})
