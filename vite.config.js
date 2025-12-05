import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5174'
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setupTests.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      lines: 75,
      functions: 75,
      branches: 75,
      statements: 75,
      include: ['src/app/components/**/*.{js,jsx}', 'src/app/Context/**/*.{js,jsx}'],
      exclude: ['src/**/*.css', 'src/pages/**', 'server/**', 'cypress/**']
    }
  }
})
