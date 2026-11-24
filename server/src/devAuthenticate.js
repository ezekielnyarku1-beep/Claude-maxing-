import { prisma } from './db.js'
import { HttpError } from './errors.js'

export function createDevAuthenticate(email) {
  return async (request, response, next) => {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      throw new HttpError(401, 'The development user was not found. Check DEV_USER_EMAIL in server/.env and run the seed.')
    }
    request.user = user
    next()
  }
}
