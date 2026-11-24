import { Router } from 'express'
import { serializeUser } from '../serializers.js'

export const meRouter = Router()

meRouter.get('/', (request, response) => {
  response.json(serializeUser(request.user))
})
