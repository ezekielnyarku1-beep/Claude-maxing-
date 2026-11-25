import { after, before, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { prisma } from '../src/db.js'
import { addDays, startOfTodayUtc } from '../src/cycles.js'
import { addIssue, admin, createFixtures, desMember, engMember, resetDatabase, startServer } from './helpers.js'

let server
let fixtures
const today = startOfTodayUtc()
const day = offset => addDays(today, offset).toISOString().slice(0, 10)

before(async () => {
  server = await startServer()
})

beforeEach(async () => {
  await resetDatabase()
  fixtures = await createFixtures()
})

after(async () => {
  await server.close()
  await prisma.$disconnect()
})

const turnOn = (weeks, startDate) =>
  server.call('PATCH', '/api/teams/ENG', { as: admin, body: { cycleWeeks: weeks, cycleStartDate: startDate } })

test('only admins can turn cycles on, with a valid length and start date', async () => {
  const denied = await server.call('PATCH', '/api/teams/ENG', { as: engMember, body: { cycleWeeks: 1, cycleStartDate: day(0) } })
  assert.equal(denied.status, 403)
  assert.equal((await turnOn(3, day(0))).status, 400)
  assert.equal((await turnOn(1, null)).status, 400)
  const on = await turnOn(2, day(0))
  assert.equal(on.status, 200)
  assert.equal(on.body.cycleWeeks, 2)
  assert.equal(on.body.cycleStartDate, day(0))
  const change = await turnOn(1, day(0))
  assert.equal(change.status, 400)
})

test('the current and next cycle are created, skipping weeks with no cycle', async () => {
  await turnOn(1, day(-10))
  const response = await server.call('GET', '/api/teams/ENG/cycles', { as: engMember })
  assert.equal(response.status, 200)
  assert.deepEqual(response.body.map(cycle => [cycle.number, cycle.state, cycle.startDate, cycle.endDate]), [
    [2, 'upcoming', day(4), day(10)],
    [1, 'current', day(-3), day(3)],
  ])
  assert.equal(response.body[0].progress.issueCount, 0)
  const again = await server.call('GET', '/api/teams/ENG/cycles', { as: engMember })
  assert.equal(again.body.length, 2)
})

test('a start date in the future creates only the first cycle', async () => {
  await turnOn(1, day(5))
  const response = await server.call('GET', '/api/teams/ENG/cycles', { as: admin })
  assert.deepEqual(response.body.map(cycle => [cycle.number, cycle.state]), [[1, 'upcoming']])
})

test('people outside the team cannot see its cycles', async () => {
  await turnOn(1, day(0))
  const response = await server.call('GET', '/api/teams/ENG/cycles', { as: desMember })
  assert.equal(response.status, 404)
})

test('team members can put an issue in a current or upcoming cycle of the same team', async () => {
  await turnOn(1, day(-1))
  const [upcoming, current] = (await server.call('GET', '/api/teams/ENG/cycles', { as: engMember })).body
  const issue = await addIssue(fixtures.eng, fixtures.engUser, { title: 'Plan me', status: 'TODO' })
  const moved = await server.call('PATCH', `/api/issues/ENG-${issue.number}`, { as: engMember, body: { cycleId: upcoming.id } })
  assert.equal(moved.status, 200)
  assert.equal(moved.body.cycle.number, upcoming.number)

  const listed = await server.call('GET', `/api/issues?cycle=${current.id}`, { as: engMember })
  assert.equal(listed.body.length, 0)

  const past = await prisma.cycle.create({ data: { teamId: fixtures.eng.id, number: 99, startDate: addDays(today, -30), endDate: addDays(today, -24) } })
  const intoPast = await server.call('PATCH', `/api/issues/ENG-${issue.number}`, { as: engMember, body: { cycleId: past.id } })
  assert.equal(intoPast.status, 400)

  const detail = await server.call('GET', `/api/issues/ENG-${issue.number}`, { as: engMember })
  const last = detail.body.activity.at(-1)
  assert.deepEqual([last.field, last.fromValue, last.toValue], ['cycle', null, `Cycle ${upcoming.number}`])
})

test('a cycle from another team is refused', async () => {
  await server.call('PATCH', '/api/teams/DES', { as: admin, body: { cycleWeeks: 1, cycleStartDate: day(0) } })
  const [desCycle] = (await server.call('GET', '/api/teams/DES/cycles', { as: admin })).body
  const issue = await addIssue(fixtures.eng, fixtures.engUser, { title: 'Wrong team', status: 'TODO' })
  const response = await server.call('PATCH', `/api/issues/ENG-${issue.number}`, { as: admin, body: { cycleId: desCycle.id } })
  assert.equal(response.status, 400)
})

test('unfinished issues move to the current cycle when their cycle has ended', async () => {
  await prisma.team.update({ where: { id: fixtures.eng.id }, data: { cycleWeeks: 1, cycleStartDate: addDays(today, -14) } })
  const ended = await prisma.cycle.create({ data: { teamId: fixtures.eng.id, number: 1, startDate: addDays(today, -14), endDate: addDays(today, -8) } })
  await addIssue(fixtures.eng, fixtures.engUser, { title: 'Still open', status: 'IN_PROGRESS', cycleId: ended.id })
  await addIssue(fixtures.eng, fixtures.engUser, { title: 'Finished', status: 'DONE', cycleId: ended.id })

  const issues = (await server.call('GET', '/api/issues?team=ENG', { as: engMember })).body
  const byTitle = Object.fromEntries(issues.map(issue => [issue.title, issue]))
  assert.equal(byTitle['Still open'].cycle.number, 2)
  assert.equal(byTitle['Still open'].cycle.startDate, day(0))
  assert.equal(byTitle.Finished.cycle.number, 1)
})

test('turning cycles off removes upcoming cycles, and turning on again continues the numbers', async () => {
  await turnOn(1, day(-1))
  const [upcoming] = (await server.call('GET', '/api/teams/ENG/cycles', { as: admin })).body
  const issue = await addIssue(fixtures.eng, fixtures.engUser, { title: 'Next week', status: 'TODO', cycleId: upcoming.id })

  const off = await server.call('PATCH', '/api/teams/ENG', { as: admin, body: { cycleWeeks: null } })
  assert.equal(off.body.cycleWeeks, null)
  const remaining = (await server.call('GET', '/api/teams/ENG/cycles', { as: admin })).body
  assert.deepEqual(remaining.map(cycle => cycle.state), ['current'])
  const unplanned = await server.call('GET', `/api/issues/ENG-${issue.number}`, { as: admin })
  assert.equal(unplanned.body.cycle, null)

  const overlap = await turnOn(1, day(0))
  assert.equal(overlap.status, 400)
  const restarted = await turnOn(2, day(6))
  assert.equal(restarted.status, 200)
  const cycles = (await server.call('GET', '/api/teams/ENG/cycles', { as: admin })).body
  assert.deepEqual(cycles.map(cycle => [cycle.number, cycle.startDate]), [[2, day(6)], [1, day(-1)]])
})
