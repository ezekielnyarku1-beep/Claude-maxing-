import { prisma } from './db.js'
import { HttpError } from './errors.js'

export function isAdmin(user) {
  return user.role === 'ADMIN'
}

export function requireAdmin(request, response, next) {
  if (!isAdmin(request.user)) throw new HttpError(403, 'Only admins can do this.')
  next()
}

export function visibleTeamsWhere(user) {
  return isAdmin(user) ? {} : { members: { some: { userId: user.id } } }
}

export async function findVisibleTeam(user, key) {
  const team = await prisma.team.findFirst({ where: { key, ...visibleTeamsWhere(user) } })
  if (!team) throw new HttpError(404, 'Team not found.')
  return team
}

const identifierPattern = /^([A-Z][A-Z0-9]{1,9})-(\d{1,9})$/

export const teamKeyOf = identifier => identifierPattern.exec(identifier)?.[1] ?? null

export async function findVisibleIssue(user, identifier, include) {
  const match = identifierPattern.exec(identifier)
  const issue = match && await prisma.issue.findFirst({
    where: { number: Number(match[2]), team: { key: match[1], ...visibleTeamsWhere(user) } },
    include,
  })
  if (!issue) throw new HttpError(404, 'Issue not found.')
  return issue
}
