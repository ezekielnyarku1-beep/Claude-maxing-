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

test('everyone signed in can read the workspace name, with a default', async () => {
  const response = await server.call('GET', '/api/workspace', { as: engMember })
  assert.equal(response.status, 200)
  assert.equal(response.body.name, 'My workspace')
})

test('only admins can rename the workspace', async () => {
  const denied = await server.call('PATCH', '/api/workspace', { as: engMember, body: { name: 'Acme' } })
  assert.equal(denied.status, 403)
  const empty = await server.call('PATCH', '/api/workspace', { as: admin, body: { name: '  ' } })
  assert.equal(empty.status, 400)
  const renamed = await server.call('PATCH', '/api/workspace', { as: admin, body: { name: 'Sample workspace' } })
  assert.equal(renamed.body.name, 'Sample workspace')
  const read = await server.call('GET', '/api/workspace', { as: desMember })
  assert.equal(read.body.name, 'Sample workspace')
})

test('only admins can see the user list, with each person’s teams', async () => {
  const denied = await server.call('GET', '/api/users', { as: engMember })
  assert.equal(denied.status, 403)
  const response = await server.call('GET', '/api/users', { as: admin })
  assert.equal(response.status, 200)
  const eng = response.body.find(user => user.email === engMember)
  assert.deepEqual(eng.teams.map(team => team.key), ['ENG'])
})

test('admins can change roles, members cannot', async () => {
  const denied = await server.call('PATCH', `/api/users/${fixtures.engUser.id}`, { as: engMember, body: { role: 'ADMIN' } })
  assert.equal(denied.status, 403)
  const promoted = await server.call('PATCH', `/api/users/${fixtures.engUser.id}`, { as: admin, body: { role: 'ADMIN' } })
  assert.equal(promoted.status, 200)
  assert.equal(promoted.body.role, 'ADMIN')
  const invalid = await server.call('PATCH', `/api/users/${fixtures.engUser.id}`, { as: admin, body: { role: 'OWNER' } })
  assert.equal(invalid.status, 400)
  const missing = await server.call('PATCH', '/api/users/not-an-id', { as: admin, body: { role: 'ADMIN' } })
  assert.equal(missing.status, 404)
})

test('the last admin cannot be turned into a member', async () => {
  const response = await server.call('PATCH', `/api/users/${fixtures.adminUser.id}`, { as: admin, body: { role: 'MEMBER' } })
  assert.equal(response.status, 400)
  assert.equal(response.body.error, 'There must be at least one admin.')
  await server.call('PATCH', `/api/users/${fixtures.engUser.id}`, { as: admin, body: { role: 'ADMIN' } })
  const allowed = await server.call('PATCH', `/api/users/${fixtures.adminUser.id}`, { as: admin, body: { role: 'MEMBER' } })
  assert.equal(allowed.status, 200)
})

test('admins add and remove team members, and access follows', async () => {
  const before = await server.call('GET', '/api/teams/DES', { as: engMember })
  assert.equal(before.status, 404)

  const denied = await server.call('POST', '/api/teams/DES/members', { as: engMember, body: { userId: fixtures.engUser.id } })
  assert.equal(denied.status, 403)
  const added = await server.call('POST', '/api/teams/DES/members', { as: admin, body: { userId: fixtures.engUser.id } })
  assert.equal(added.status, 201)
  assert.deepEqual(added.body.map(member => member.name), ['Des Person', 'Eng Person'])
  const again = await server.call('POST', '/api/teams/DES/members', { as: admin, body: { userId: fixtures.engUser.id } })
  assert.equal(again.status, 409)
  const nowVisible = await server.call('GET', '/api/teams/DES', { as: engMember })
  assert.equal(nowVisible.status, 200)

  const removed = await server.call('DELETE', `/api/teams/DES/members/${fixtures.engUser.id}`, { as: admin })
  assert.equal(removed.status, 200)
  assert.deepEqual(removed.body.map(member => member.name), ['Des Person'])
  const hiddenAgain = await server.call('GET', '/api/teams/DES', { as: engMember })
  assert.equal(hiddenAgain.status, 404)
  const notMember = await server.call('DELETE', `/api/teams/DES/members/${fixtures.engUser.id}`, { as: admin })
  assert.equal(notMember.status, 404)
})

test('adding a member checks the user', async () => {
  const badId = await server.call('POST', '/api/teams/ENG/members', { as: admin, body: { userId: 'nope' } })
  assert.equal(badId.status, 400)
  const unknown = await server.call('POST', '/api/teams/ENG/members', {
    as: admin,
    body: { userId: '00000000-0000-4000-8000-000000000000' },
  })
  assert.equal(unknown.status, 404)
})
