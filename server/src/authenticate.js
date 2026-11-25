import { jwtVerify } from 'jose'
import { prisma } from './db.js'
import { HttpError } from './errors.js'

const keyServiceErrors = new Set(['ERR_JWKS_TIMEOUT', 'ERR_JWKS_INVALID', 'NO_CODE'])

async function readVerifiedClaims(request, { keySet, issuer }) {
  const [scheme, token] = (request.get('authorization') ?? '').split(' ')
  if (scheme !== 'Bearer' || !token) throw new HttpError(401, 'Sign in to continue.')
  try {
    const { payload } = await jwtVerify(token, keySet, { issuer, audience: issuer, algorithms: ['EdDSA'] })
    return payload
  } catch (error) {
    if (keyServiceErrors.has(error.code ?? 'NO_CODE')) {
      throw new HttpError(503, 'Sign-in could not be checked right now. Try again in a moment.', { cause: error })
    }
    throw new HttpError(401, 'Your session has ended. Sign in again.')
  }
}

async function findOrCreateUser(claims) {
  const linked = await prisma.user.findUnique({ where: { authUserId: claims.sub } })
  if (linked) return linked

  const email = String(claims.email ?? '').trim().toLowerCase()
  if (!email) throw new HttpError(401, 'Your account has no email address.')
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    if (existing.authUserId || claims.emailVerified !== true) {
      throw new HttpError(403, 'This email cannot be used yet. Ask an admin for help.')
    }
    return prisma.user.update({ where: { id: existing.id }, data: { authUserId: claims.sub } })
  }

  const name = String(claims.name ?? '').trim().slice(0, 80) || email
  try {
    return await prisma.user.create({ data: { authUserId: claims.sub, email, name } })
  } catch (error) {
    const createdMeanwhile = error.code === 'P2002' && await prisma.user.findUnique({ where: { authUserId: claims.sub } })
    if (createdMeanwhile) return createdMeanwhile
    throw error
  }
}

export function createAuthenticate({ keySet, issuer }) {
  return async (request, response, next) => {
    const claims = await readVerifiedClaims(request, { keySet, issuer })
    if (claims.banned === true) throw new HttpError(403, 'This account has been blocked.')
    request.user = await findOrCreateUser(claims)
    next()
  }
}
