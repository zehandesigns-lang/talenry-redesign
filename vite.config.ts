import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // GitHub Pages serves the site from a subpath, which the deploy workflow passes in; locally it's the root
  base: process.env.BASE_PATH || '/',
  server: { port: 5180, strictPort: true },
  build: {
    rollupOptions: {
      // The prototype, and the case study that walks through it. reel-plan.html is a working doc,
      // served by the dev server only, so it never ships with the portfolio.
      input: {
        main: new URL('./index.html', import.meta.url).pathname,
        caseStudy: new URL('./case-study.html', import.meta.url).pathname,
      },
    },
  },
})
