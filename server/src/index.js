import { createApp } from './app.js'

const clientOrigin = process.env.CLIENT_ORIGIN
if (!clientOrigin) {
  throw new Error('CLIENT_ORIGIN is not set. Copy server/.env.example to server/.env and fill it in.')
}

const port = Number(process.env.PORT) || 4000

createApp({ clientOrigin }).listen(port, error => {
  if (error) throw error
  console.log(`Overview Teams server running on http://localhost:${port}`)
})
