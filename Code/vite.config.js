import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Dev proxy: the React app talks to the Node/MySQL server on :4000 (REST + Socket.IO)
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:4000', '/socket.io': { target: 'http://localhost:4000', ws: true } } },
})
