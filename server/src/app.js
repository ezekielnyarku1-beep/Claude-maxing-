import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

export function createApp({ clientOrigin }) {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: clientOrigin }))

  app.get('/api/health', (request, response) => {
    response.json({ status: 'ok' })
  })

  app.use((request, response) => {
    response.status(404).json({ error: 'Not found.' })
  })

  return app
}
