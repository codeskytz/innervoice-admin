import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    cors: {
      origin: ['http://localhost:8000', 'http://192.168.1.35:8000'],
      credentials: true,
    },
  },
})
