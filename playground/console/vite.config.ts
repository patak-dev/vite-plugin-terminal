import { resolve } from 'path'
import { defineConfig } from 'vite'
import terminal from 'vite-plugin-terminal'

export default defineConfig({
  plugins: [
    terminal({
      console: 'terminal',
      output: ['terminal', 'console'],
    }),
  ],
  build: {
    outDir: resolve(__dirname, '../../dist/playground/console'),
    minify: true,
    emptyOutDir: true,
  },
  preview: {
    port: 4173,
  },
  server: {
    open: true,
  },
})
