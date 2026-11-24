import { createServer } from 'node:http'
import { resolve } from 'node:path'
import express from 'express'
import { toNodeHandler } from 'better-auth/node'
import { createServer as createViteServer } from 'vite'
import { auth, isPasswordResetConfigured, pool } from './server/auth.mjs'

const app = express()
const httpServer = createServer(app)
const isProduction = process.argv.includes('--production') || process.env.NODE_ENV === 'production'
let vite

app.get('/api/app-config', (_request, response) => {
  response.json({ passwordResetEnabled: isPasswordResetConfigured })
})

app.post('/api/auth/request-password-reset', (_request, response, next) => {
  if (isPasswordResetConfigured) {
    next()
    return
  }

  response.status(503).json({ error: 'Password reset email is not configured.' })
})

app.all('/api/auth/*splat', toNodeHandler(auth))

if (isProduction) {
  const distPath = resolve('dist')
  app.use(express.static(distPath))
  app.use((request, response, next) => {
    if (request.method !== 'GET' || request.path.startsWith('/api/')) {
      next()
      return
    }

    response.sendFile(resolve(distPath, 'index.html'))
  })
} else {
  vite = await createViteServer({
    appType: 'spa',
    server: {
      middlewareMode: true,
      hmr: { server: httpServer },
    },
  })
  app.use(vite.middlewares)
}

const port = Number(process.env.PORT ?? 5173)
const host = process.env.HOST ?? '127.0.0.1'

httpServer.listen(port, host, () => {
  console.log(`Overview Teams auth server listening on http://${host}:${port}`)
})

async function shutdown() {
  await new Promise(resolveClose => httpServer.close(resolveClose))
  await vite?.close()
  await pool.end()
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)
