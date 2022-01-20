import { resolve } from 'path'
import { defineConfig } from 'vite'
import terminal from '../../src'

export default defineConfig({
  plugins: [
    terminal(),
  ],
  build: {
    outDir: resolve(__dirname, '../../dist/playground/basic'),
    minify: true,
    emptyOutDir: true,
  },
})
