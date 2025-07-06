import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    // React Fast Refresh 최적화
    fastRefresh: false // 프로덕션 빌드에서는 불필요
  })],
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
    sourcemap: false,
    minify: 'esbuild',
    target: 'esnext',
    chunkSizeWarningLimit: 2000,
    // 더 극단적인 최적화
    reportCompressedSize: false, // 압축 크기 보고 비활성화로 빌드 속도 향상
    emptyOutDir: true,
    rollupOptions: {
      output: {
        chunkSizeWarningLimit: 2000,
        // 더 효율적인 청킹 전략
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@mui')) {
              return 'mui-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            return 'vendor';
          }
        }
      },
      // Rollup 옵션 최적화
      treeshake: {
        preset: 'smallest' // 더 공격적인 트리쉐이킹
      }
    },
    // 청크 크기 최적화
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
  },
  // 의존성 최적화 강화
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      '@mui/material',
      '@mui/icons-material',
      'axios',
      'dayjs'
    ],
    // 사전 번들링 최적화
    force: false,
    esbuildOptions: {
      target: 'esnext'
    }
  },
  // esbuild 최적화
  esbuild: {
    target: 'esnext',
    drop: ['console', 'debugger'], // 프로덕션에서 console/debugger 제거
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true
  }
})
