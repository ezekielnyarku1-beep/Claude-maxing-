import { Router } from 'express'
import { prisma } from '../db.js'
import { findVisibleTeam, requireAdmin, visibleTeamsWhere } from '../access.js'
import { cycleLengths, cycleState, startOfTodayUtc, syncCycles } from '../cycles.js'
import { HttpError } from '../errors.js'
import { calculateProgress } from '../progress.js'
import { loadProgress } from '../progressQueries.js'
import { personSelect, serializeCycleRef, toDateString } from '../serializers.js'
import { isId, readBody, readChoice, readId, readOptionalDate, readTeamKey, readText } from '../validation.js'

export const teamsRouter = Router()

const serializeTeam = (team, progress) => ({
  id: team.id,
  key: team.key,
  name: team.name,
  cycleWeeks: team.cycleWeeks,
  cycleStartDate: toDateString(team.cycleStartDate),
  progress,
})
const readTeamName = value => readText(value, 'Team name', { max: 60 })
async function readCycleChange(team, body) {
  if (body.cycleWeeks === null) return { cycleWeeks: null, cycleStartDate: null }
  if (team.cycleWeeks) throw new HttpError(400, 'Turn cycles off before changing the length or start date.')
  const cycleWeeks = readChoice(body.cycleWeeks, 'Cycle length', cycleLengths)
  const cycleStartDate = readOptionalDate(body.cycleStartDate ?? '', 'Start date')
  const last = await prisma.cycle.findFirst({ where: { teamId: team.id }, orderBy: { number: 'desc' } })
  if (last && cycleStartDate <= last.endDate) {
    throw new HttpError(400, `The first cycle must start after ${toDateString(last.endDate)}, when the last cycle ends.`)
  }
  return { cycleWeeks, cycleStartDate }
}

const loadMembers = teamId =>
  prisma.user.findMany({ where: { memberships: { some: { teamId } } }, ...personSelect, orderBy: { name: 'asc' } })

teamsRouter.get('/', async (request, response) => {
  const teams = await prisma.team.findMany({ where: visibleTeamsWhere(request.user), orderBy: { name: 'asc' } })
  const progress = await loadProgress('teamId', teams.map(team => team.id))
  response.json(teams.map(team => serializeTeam(team, progress.get(team.id))))
})

teamsRouter.get('/:key', async (request, response) => {
  const team = await findVisibleTeam(request.user, request.params.key)
  const [members, progress] = await Promise.all([loadMembers(team.id), loadProgress('teamId', [team.id])])
  response.json({ ...serializeTeam(team, progress.get(team.id)), members })
})

teamsRouter.get('/:key/cycles', async (request, response) => {
  const team = await findVisibleTeam(request.user, request.params.key)
  await syncCycles({ id: team.id })
  const cycles = await prisma.cycle.findMany({ where: { teamId: team.id }, orderBy: { number: 'desc' } })
  const progress = await loadProgress('cycleId', cycles.map(cycle => cycle.id))
  const today = startOfTodayUtc()
  response.json(cycles.map(cycle => ({
    ...serializeCycleRef(cycle),
    state: cycleState(cycle, today),
    progress: progress.get(cycle.id),
  })))
})

teamsRouter.post('/', requireAdmin, async (request, response) => {
  const body = readBody(request)
  const team = await prisma.team.create({ data: { key: readTeamKey(body.key), name: readTeamName(body.name) } })
  response.status(201).json({ ...serializeTeam(team, calculateProgress({})), members: [] })
})

teamsRouter.patch('/:key', requireAdmin, async (request, response) => {
  const body = readBody(request)
  const team = await findVisibleTeam(request.user, request.params.key)
  const data = {
    ...('name' in body && { name: readTeamName(body.name) }),
    ...('cycleWeeks' in body && await readCycleChange(team, body)),
  }
  if (!Object.keys(data).length) throw new HttpError(400, 'There is nothing to change.')
  const updated = await prisma.$transaction(async tx => {
    if (data.cycleWeeks === null) {
      await tx.cycle.deleteMany({ where: { teamId: team.id, startDate: { gt: startOfTodayUtc() } } })
    }
    return tx.team.update({ where: { id: team.id }, data })
  })
  const progress = await loadProgress('teamId', [team.id])
  response.json(serializeTeam(updated, progress.get(team.id)))
})

teamsRouter.post('/:key/members', requireAdmin, async (request, response) => {
  const userId = readId(readBody(request).userId, 'User')
  const team = await findVisibleTeam(request.user, request.params.key)
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new HttpError(404, 'User not found.')
  const existing = await prisma.teamMember.findUnique({ where: { teamId_userId: { teamId: team.id, userId } } })
  if (existing) throw new HttpError(409, `${user.name} is already in this team.`)
  await prisma.teamMember.create({ data: { teamId: team.id, userId } })
  response.status(201).json(await loadMembers(team.id))
})

teamsRouter.delete('/:key/members/:userId', requireAdmin, async (request, response) => {
  const team = await findVisibleTeam(request.user, request.params.key)
  const { count } = isId(request.params.userId)
    ? await prisma.teamMember.deleteMany({ where: { teamId: team.id, userId: request.params.userId } })
    : { count: 0 }
  if (!count) throw new HttpError(404, 'That person is not in this team.')
  response.json(await loadMembers(team.id))
})
