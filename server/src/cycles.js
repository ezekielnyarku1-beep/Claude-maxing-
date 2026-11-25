import { prisma } from './db.js'
import { IssueStatus } from './generated/prisma/enums.ts'

const dayInMs = 86400000
export const cycleLengths = [1, 2]
export const openStatuses = [IssueStatus.BACKLOG, IssueStatus.TODO, IssueStatus.IN_PROGRESS]

export const addDays = (date, days) => new Date(date.getTime() + days * dayInMs)

export function startOfTodayUtc() {
  return new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`)
}

export function cycleState(cycle, today) {
  if (cycle.endDate < today) return 'past'
  return cycle.startDate > today ? 'upcoming' : 'current'
}

function plannedCycles(team, last, today) {
  if (last && last.startDate > today) return []
  const length = team.cycleWeeks * 7
  let start = last && addDays(last.endDate, 1) > team.cycleStartDate ? addDays(last.endDate, 1) : team.cycleStartDate
  const periodsBehind = Math.floor((today - start) / (length * dayInMs))
  if (periodsBehind > 0) start = addDays(start, periodsBehind * length)

  const cycles = []
  let number = (last?.number ?? 0) + 1
  do {
    cycles.push({ teamId: team.id, number: number++, startDate: start, endDate: addDays(start, length - 1) })
    start = addDays(start, length)
  } while (cycles.at(-1).startDate <= today)
  return cycles
}

async function syncTeamCycles(team, today) {
  const last = await prisma.cycle.findFirst({ where: { teamId: team.id }, orderBy: { number: 'desc' } })
  const planned = plannedCycles(team, last, today)
  if (planned.length) await prisma.cycle.createMany({ data: planned, skipDuplicates: true })

  const current = await prisma.cycle.findFirst({
    where: { teamId: team.id, startDate: { lte: today }, endDate: { gte: today } },
  })
  if (current) {
    await prisma.issue.updateMany({
      where: { teamId: team.id, status: { in: openStatuses }, cycle: { endDate: { lt: today } } },
      data: { cycleId: current.id },
    })
  }
}

export async function syncCycles(teamWhere = {}) {
  const today = startOfTodayUtc()
  const teams = await prisma.team.findMany({ where: { ...teamWhere, cycleWeeks: { not: null } } })
  for (const team of teams) await syncTeamCycles(team, today)
}
