import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const allowedHosts = env.ALLOWED_HOSTS ? env.ALLOWED_HOSTS.split(',') : []

  return {
    plugins: [react()],
    server: {
      host: true, // Expose to network
      allowedHosts: allowedHosts,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        }
      }
    }
  }
})