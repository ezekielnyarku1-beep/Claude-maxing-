import { createApp } from './app.js'
import { createDevAuthenticate } from './devAuthenticate.js'

const clientOrigin = process.env.CLIENT_ORIGIN
const devUserEmail = process.env.DEV_USER_EMAIL

if (!clientOrigin || !devUserEmail) {
  throw new Error('CLIENT_ORIGIN and DEV_USER_EMAIL must be set. Copy server/.env.example to server/.env and fill it in.')
}
if (process.env.NODE_ENV === 'production') {
  throw new Error('The development login (DEV_USER_EMAIL) cannot run in production. Real login arrives in Phase 5.')
}

const port = Number(process.env.PORT) || 4000

createApp({ clientOrigin, authenticate: createDevAuthenticate(devUserEmail) }).listen(port, error => {
  if (error) throw error
  console.log(`Overview Teams server running on http://localhost:${port} as ${devUserEmail}`)
})
