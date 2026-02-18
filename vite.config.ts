import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fetchFirebaseWebApps } from './src/server/listAppsServer'
import { listUsers, updateUserRole } from './src/app/services/listUsers'
import { getAdmin } from './src/lib/firebase'

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
        const enforceAdminAuth =
          process.env.VITE_ENFORCE_ADMIN_AUTH === 'true' || process.env.NODE_ENV === 'production'

        const readJsonBody = async (req: import('node:http').IncomingMessage): Promise<unknown> => {
          const chunks: Buffer[] = []
          for await (const chunk of req) {
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
          }

          const raw = Buffer.concat(chunks).toString('utf8').trim()
          return raw ? (JSON.parse(raw) as unknown) : {}
        }

        const requireAdmin = async (req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse) => {
          if (!enforceAdminAuth) {
            return true
          }

          const authorization = req.headers.authorization
          if (!authorization?.startsWith('Bearer ')) {
            res.statusCode = 401
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Missing bearer token' }))
            return false
          }

          const token = authorization.slice('Bearer '.length).trim()
          if (!token) {
            res.statusCode = 401
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Missing bearer token' }))
            return false
          }

          try {
            const decoded = await getAdmin().auth().verifyIdToken(token, true)
            const role = typeof decoded.role === 'string' ? decoded.role.toLowerCase() : ''
            const isAdmin = decoded.admin === true || role === 'admin' || role === 'owner'

            if (!isAdmin) {
              res.statusCode = 403
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Admin access required' }))
              return false
            }
            return true
          } catch {
            res.statusCode = 401
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Invalid or expired token' }))
            return false
          }
        }

        server.middlewares.use('/api/listApps', async (req, res) => {
          if (req.method !== 'GET') {
            res.statusCode = 405
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }

          if (!(await requireAdmin(req, res))) {
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

        server.middlewares.use('/api/users', async (req, res) => {
          if (req.method !== 'GET' && req.method !== 'PATCH') {
            res.statusCode = 405
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }

          if (!(await requireAdmin(req, res))) {
            return
          }

          try {
            if (req.method === 'GET') {
              const url = new URL(req.url ?? '', 'http://localhost')
              const pageSize = url.searchParams.get('pageSize')
              const pageToken = url.searchParams.get('pageToken')
              const emailContains = url.searchParams.get('emailContains')
              const disabled = url.searchParams.get('disabled')

              const data = await listUsers({
                pageSize: pageSize ? Number(pageSize) : undefined,
                pageToken: pageToken ?? undefined,
                emailContains: emailContains ?? undefined,
                disabled:
                  disabled === 'true' || disabled === 'false'
                    ? disabled
                    : undefined,
              })

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(data))
              return
            }

            const payload = (await readJsonBody(req)) as { uid?: string; role?: string }
            const uid = payload.uid?.trim()
            const role = payload.role?.trim()

            if (!uid || !role) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'uid and role are required' }))
              return
            }

            const allowedRoles = new Set(['Owner', 'Admin', 'Editor', 'Viewer', 'User'])
            if (!allowedRoles.has(role)) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Invalid role' }))
              return
            }

            await updateUserRole(uid, role)
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          } catch (error) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                error: error instanceof Error ? error.message : 'Failed to list users',
              })
            )
          }
        })
      },
    },
  ],
})
