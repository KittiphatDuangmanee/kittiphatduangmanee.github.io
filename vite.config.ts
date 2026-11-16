import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages user site: served from the domain root, so the base is '/'.
// Every public asset is still resolved through import.meta.env.BASE_URL
// (see src/lib/asset.ts), so moving to a project path is a one line change.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
})
