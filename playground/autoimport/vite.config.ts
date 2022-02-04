import { resolve } from 'path'
import { defineConfig } from 'vite'
import autoImport from 'unplugin-auto-import/vite'
import terminal from '../../src'

export default defineConfig({
  plugins: [
    terminal(),
    autoImport({
      imports: [
        {
          'virtual:terminal': ['terminal'],
        },
      ],
    }),
  ],
  build: {
    outDir: resolve(__dirname, '../../dist/playground/basic'),
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
