import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true, // it means to change the origin of the host or domain of the request to the target URL. here's an example: if your frontend is running on http://localhost:3000 and you make a request to /api/data, with changeOrigin set to true, the request will appear to come from http://localhost:5000 instead of http://localhost:3000.
        secure: false // in simple terms, setting secure to false allows the proxy to accept and work with self-signed or invalid SSL certificates without throwing errors.
      }
    }
  }
})
