import { after, before, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { prisma } from '../src/db.js'
import { admin, createFixtures, engMember, resetDatabase, startServer } from './helpers.js'

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

test('everyone signed in can read the shared labels', async () => {
  const response = await server.call('GET', '/api/labels', { as: engMember })
  assert.equal(response.status, 200)
  assert.deepEqual(response.body, [{ id: fixtures.bug.id, name: 'Bug', color: '#c2362b' }])
})

test('only admins can create and edit labels', async () => {
  const denied = await server.call('POST', '/api/labels', { as: engMember, body: { name: 'Docs', color: '#6b7385' } })
  assert.equal(denied.status, 403)
  const created = await server.call('POST', '/api/labels', { as: admin, body: { name: 'Docs', color: '#6B7385' } })
  assert.equal(created.status, 201)
  assert.equal(created.body.color, '#6b7385')

  const editDenied = await server.call('PATCH', `/api/labels/${created.body.id}`, { as: engMember, body: { name: 'X' } })
  assert.equal(editDenied.status, 403)
  const edited = await server.call('PATCH', `/api/labels/${created.body.id}`, { as: admin, body: { name: 'Documents' } })
  assert.equal(edited.body.name, 'Documents')
})

test('label colors and names are checked', async () => {
  const badColor = await server.call('POST', '/api/labels', { as: admin, body: { name: 'Docs', color: 'red' } })
  assert.equal(badColor.status, 400)
  const duplicate = await server.call('POST', '/api/labels', { as: admin, body: { name: 'Bug', color: '#000000' } })
  assert.equal(duplicate.status, 409)
  const missing = await server.call('PATCH', '/api/labels/not-an-id', { as: admin, body: { name: 'X' } })
  assert.equal(missing.status, 404)
})
