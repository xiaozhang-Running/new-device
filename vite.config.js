import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dns from 'node:dns'

// 修复 DNS 解析顺序问题
dns.setDefaultResultOrder('verbatim')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5179,
    strictPort: true,
    hmr: {
      host: 'localhost',
      port: 5179
    },
    proxy: {
      '/api': {
        target: 'http://192.168.10.72:5059',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
})
