import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Served from a GitHub Pages project page at https://cvfesta.github.io/Down-Memory-Lane/,
// so assets must be referenced under that sub-path. If you move to a custom domain at the
// root (e.g. https://downmemorylane.com), change this back to '/'.
// https://vite.dev/config/
export default defineConfig({
  base: '/Down-Memory-Lane/',
  plugins: [react(), tailwindcss()],
})
