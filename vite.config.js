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
        target: 'http://localhost:5059',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  },
  build: {
    // 优化构建输出
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // 启用代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          // 将第三方库分离到单独的 chunk
          vendor: ['react', 'react-dom', 'antd'],
          // 将图表库分离
          charts: ['echarts'],
          // 将工具库分离
          utils: ['axios', 'dayjs', 'moment']
        }
      }
    },
    // 启用源映射
    sourcemap: false
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['react', 'react-dom', 'antd', 'axios', 'dayjs', 'moment', 'echarts']
  }
})
