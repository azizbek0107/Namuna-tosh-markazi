import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { revenueAiMiddleware } from './server/revenueAi.js'
import { authMiddleware } from './server/auth.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env }
  return {
    server: { fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/.local-data/**'] } },
    plugins: [react(), {
      name: 'revenue-ai-api',
      configureServer(server) { server.middlewares.use(authMiddleware()); server.middlewares.use(revenueAiMiddleware(env)) },
      configurePreviewServer(server) { server.middlewares.use(authMiddleware()); server.middlewares.use(revenueAiMiddleware(env)) },
    }],
  }
})
