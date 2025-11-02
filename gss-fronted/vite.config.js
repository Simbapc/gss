import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    // 生成的文件名包含哈希值，避免缓存问题
    rollupOptions: {
      output: {
        // 为chunk文件添加哈希值
        chunkFileNames: 'assets/[name]-[hash].js',
        // 为入口文件添加哈希值
        entryFileNames: 'assets/[name]-[hash].js',
        // 为资源文件添加哈希值
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  server: {
    // 开发服务器配置
    host: '0.0.0.0',
    // port: 3000,
    // 强制浏览器不缓存开发服务器资源
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  }
})
