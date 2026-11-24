import { Router } from 'express'
import { prisma } from '../db.js'
import { requireAdmin } from '../access.js'
import { HttpError } from '../errors.js'
import { Role } from '../generated/prisma/enums.ts'
import { serializeUser, teamSelect } from '../serializers.js'
import { isId, readBody, readChoice } from '../validation.js'

export const usersRouter = Router()

usersRouter.use(requireAdmin)

const userInclude = { memberships: { include: { team: teamSelect }, orderBy: { team: { name: 'asc' } } } }
const serializeWithTeams = user => ({ ...serializeUser(user), teams: user.memberships.map(membership => membership.team) })

usersRouter.get('/', async (request, response) => {
  const users = await prisma.user.findMany({ include: userInclude, orderBy: { name: 'asc' } })
  response.json(users.map(serializeWithTeams))
})

usersRouter.patch('/:id', async (request, response) => {
  const role = readChoice(readBody(request).role, 'Role', Object.values(Role))
  const updated = await prisma.$transaction(async tx => {
    const admins = await tx.$queryRaw`SELECT id FROM "User" WHERE role = 'ADMIN' FOR UPDATE`
    const user = isId(request.params.id) && await tx.user.findUnique({ where: { id: request.params.id } })
    if (!user) throw new HttpError(404, 'User not found.')
    if (user.role === 'ADMIN' && role === 'MEMBER' && admins.length <= 1) {
      throw new HttpError(400, 'There must be at least one admin.')
    }
    return tx.user.update({ where: { id: user.id }, data: { role }, include: userInclude })
  }, { maxWait: 10000, timeout: 20000 })
  response.json(serializeWithTeams(updated))
})
