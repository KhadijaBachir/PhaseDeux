import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // on force 127.0.0.1
    port: 5173,        // port de Vite
    open: false        // empêche l'ouverture auto du navigateur
  }
})
