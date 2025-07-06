import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // 프로덕션에서는 소스맵 비활성화로 빌드 속도 향상
    minify: 'esbuild', // 더 빠른 미니파이어 사용
    rollupOptions: {
      output: {
        chunkSizeWarningLimit: 1000,
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@mui/material', '@mui/icons-material'],
          utils: ['axios', 'dayjs']
        }
      }
    },
    // 빌드 성능 최적화
    target: 'esnext',
    chunkSizeWarningLimit: 1000,
  },
  // 의존성 최적화
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@mui/material', 'axios']
  }
})
