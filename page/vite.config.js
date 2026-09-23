import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Render serves the static site from the domain root (unlike GitHub Pages).
  base: '/',
  plugins: [react()],
})
