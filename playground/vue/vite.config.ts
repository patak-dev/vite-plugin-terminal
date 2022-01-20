import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import terminal from '../../src'

export default defineConfig({
  plugins: [
    vue(),
    terminal(),
  ],
})
