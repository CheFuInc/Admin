import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fetchFirebaseWebApps } from './src/server/listAppsServer'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/app'),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'list-apps-api',
      configureServer(server) {
        server.middlewares.use('/api/listApps', async (req, res) => {
          if (req.method !== 'GET') {
            res.statusCode = 405
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }

          try {
            const apps = await fetchFirebaseWebApps()
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ apps }))
          } catch (error) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                error: error instanceof Error ? error.message : 'Failed to list apps',
              })
            )
          }
        })
      },
    },
  ],
})
