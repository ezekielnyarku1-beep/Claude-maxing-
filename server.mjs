import { createServer } from 'node:http'
import { resolve } from 'node:path'
import express from 'express'
import { toNodeHandler } from 'better-auth/node'
import { auth, pool } from './server/auth.mjs'

const app = express()
const httpServer = createServer(app)
const isProduction = process.argv.includes('--production') || process.env.NODE_ENV === 'production'

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
}

const port = Number(isProduction ? process.env.PORT ?? 5175 : process.env.API_PORT ?? 3001)
const host = process.env.HOST ?? '127.0.0.1'

httpServer.listen(port, host, () => {
  console.log(`Overview Teams auth server listening on http://${host}:${port}`)
})

async function shutdown() {
  await new Promise(resolveClose => httpServer.close(resolveClose))
  await pool.end()
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)
