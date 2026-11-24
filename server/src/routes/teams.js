import { Router } from 'express'
import { prisma } from '../db.js'
import { findVisibleTeam, requireAdmin, visibleTeamsWhere } from '../access.js'
import { calculateProgress } from '../progress.js'
import { loadProgress } from '../progressQueries.js'
import { personSelect } from '../serializers.js'
import { readBody, readTeamKey, readText } from '../validation.js'

export const teamsRouter = Router()

const serializeTeam = (team, progress) => ({ id: team.id, key: team.key, name: team.name, progress })
const readTeamName = value => readText(value, 'Team name', { max: 60 })

teamsRouter.get('/', async (request, response) => {
  const teams = await prisma.team.findMany({ where: visibleTeamsWhere(request.user), orderBy: { name: 'asc' } })
  const progress = await loadProgress('teamId', teams.map(team => team.id))
  response.json(teams.map(team => serializeTeam(team, progress.get(team.id))))
})

teamsRouter.get('/:key', async (request, response) => {
  const team = await findVisibleTeam(request.user, request.params.key)
  const [members, progress] = await Promise.all([
    prisma.user.findMany({ where: { memberships: { some: { teamId: team.id } } }, ...personSelect, orderBy: { name: 'asc' } }),
    loadProgress('teamId', [team.id]),
  ])
  response.json({ ...serializeTeam(team, progress.get(team.id)), members })
})

teamsRouter.post('/', requireAdmin, async (request, response) => {
  const body = readBody(request)
  const team = await prisma.team.create({ data: { key: readTeamKey(body.key), name: readTeamName(body.name) } })
  response.status(201).json({ ...serializeTeam(team, calculateProgress({})), members: [] })
})

teamsRouter.patch('/:key', requireAdmin, async (request, response) => {
  const body = readBody(request)
  const team = await findVisibleTeam(request.user, request.params.key)
  const updated = await prisma.team.update({ where: { id: team.id }, data: { name: readTeamName(body.name) } })
  const progress = await loadProgress('teamId', [team.id])
  response.json(serializeTeam(updated, progress.get(team.id)))
})
