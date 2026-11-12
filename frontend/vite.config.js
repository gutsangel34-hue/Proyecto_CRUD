import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Permite abrir la app desde la URL compartida de VS Code (Ports)
    allowedHosts: ['.devtunnels.ms', '.trycloudflare.com', '.loca.lt'],
    // El frontend llama a /api y Vite lo reenvía al backend,
    // así solo hay que compartir el puerto 5173
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (ruta) => ruta.replace(/^\/api/, ''),
      },
    },
  },
})
