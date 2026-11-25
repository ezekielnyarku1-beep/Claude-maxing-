import { after, before, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { prisma } from '../src/db.js'
import { admin, createFixtures, desMember, engMember, resetDatabase, startServer } from './helpers.js'

let server
let fixtures

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

const filter = { priorities: ['URGENT', 'HIGH'], assigneeIds: [], labelIds: [], showClosed: false }
const save = (as, body) => server.call('POST', '/api/views', { as, body })

test('people save their own views and only they can see them', async () => {
  const created = await save(engMember, { name: 'Urgent work', teamKey: 'ENG', filter })
  assert.equal(created.status, 201)
  assert.deepEqual(created.body.team, { id: fixtures.eng.id, key: 'ENG', name: 'Engineering' })
  assert.deepEqual(created.body.filter, filter)
  await save(desMember, { name: 'Design work', teamKey: null, filter })

  const mine = await server.call('GET', '/api/views', { as: engMember })
  assert.deepEqual(mine.body.map(view => view.name), ['Urgent work'])
  const adminViews = await server.call('GET', '/api/views', { as: admin })
  assert.deepEqual(adminViews.body, [])

  const id = created.body.id
  assert.equal((await server.call('GET', `/api/views/${id}`, { as: desMember })).status, 404)
  assert.equal((await server.call('PATCH', `/api/views/${id}`, { as: admin, body: { name: 'Taken' } })).status, 404)
  assert.equal((await server.call('DELETE', `/api/views/${id}`, { as: desMember })).status, 404)
})

test('views are checked before saving', async () => {
  assert.equal((await save(engMember, { name: ' ', filter })).status, 400)
  assert.equal((await save(engMember, { name: 'Bad', filter: { ...filter, priorities: ['SOON'] } })).status, 400)
  assert.equal((await save(engMember, { name: 'Bad', filter: { ...filter, showClosed: 'yes' } })).status, 400)
  assert.equal((await save(engMember, { name: 'Bad', filter: { ...filter, labelIds: ['nope'] } })).status, 400)
  assert.equal((await save(engMember, { name: 'Bad', filter: null })).status, 400)
  assert.equal((await save(engMember, { name: 'Other team', teamKey: 'DES', filter })).status, 404)
})

test('owners can rename, update and delete their views', async () => {
  const { body: view } = await save(engMember, { name: 'Mine', filter })
  const renamed = await server.call('PATCH', `/api/views/${view.id}`, {
    as: engMember,
    body: { name: 'Renamed', teamKey: 'ENG', filter: { ...filter, showClosed: true } },
  })
  assert.equal(renamed.status, 200)
  assert.equal(renamed.body.name, 'Renamed')
  assert.equal(renamed.body.team.key, 'ENG')
  assert.equal(renamed.body.filter.showClosed, true)
  assert.equal((await server.call('PATCH', `/api/views/${view.id}`, { as: engMember, body: {} })).status, 400)
  assert.equal((await server.call('DELETE', `/api/views/${view.id}`, { as: engMember })).status, 204)
  assert.equal((await server.call('GET', `/api/views/${view.id}`, { as: engMember })).status, 404)
})

test('a view for a team you left is hidden', async () => {
  const { body: view } = await save(engMember, { name: 'Eng only', teamKey: 'ENG', filter })
  await prisma.teamMember.deleteMany({ where: { userId: fixtures.engUser.id } })
  assert.deepEqual((await server.call('GET', '/api/views', { as: engMember })).body, [])
  assert.equal((await server.call('GET', `/api/views/${view.id}`, { as: engMember })).status, 404)
})

test('removing someone from a team deletes their views for that team, so they do not count against the limit', async () => {
  await save(engMember, { name: 'Eng only', teamKey: 'ENG', filter })
  await save(engMember, { name: 'Everywhere', teamKey: null, filter })
  const removed = await server.call('DELETE', `/api/teams/ENG/members/${fixtures.engUser.id}`, { as: admin })
  assert.equal(removed.status, 200)
  assert.deepEqual(await prisma.savedView.findMany({ where: { ownerId: fixtures.engUser.id }, select: { name: true } }), [{ name: 'Everywhere' }])
})
