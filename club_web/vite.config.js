import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBase = env.VITE_API_BASE_URL || 'https://cecille-insertional-keva.ngrok-free.dev'
  const backendBase = apiBase.replace(/\/api$/, '')
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: apiBase,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        // Static files served by backend: /files/**
        '/files': {
          target: backendBase,
          changeOrigin: true
        }
      }
    }
  }
})
