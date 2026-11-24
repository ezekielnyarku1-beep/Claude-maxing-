import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { prisma } from '../src/db.js'
import { admin, clientOrigin, createFixtures, resetDatabase, startServer } from './helpers.js'

let server

before(async () => {
  await resetDatabase()
  await createFixtures()
  server = await startServer()
})

after(async () => {
  await server.close()
  await prisma.$disconnect()
})

test('health check answers that the server is running', async () => {
  const response = await server.call('GET', '/api/health')
  assert.equal(response.status, 200)
  assert.deepEqual(response.body, { status: 'ok' })
})

test('CORS allows the frontend address', async () => {
  const response = await server.call('GET', '/api/health', { headers: { Origin: clientOrigin } })
  assert.equal(response.headers.get('access-control-allow-origin'), clientOrigin)
})

test('CORS never allows another address', async () => {
  const response = await server.call('GET', '/api/health', { headers: { Origin: 'https://other-site.example' } })
  assert.notEqual(response.headers.get('access-control-allow-origin'), 'https://other-site.example')
  assert.notEqual(response.headers.get('access-control-allow-origin'), '*')
})

test('unknown addresses answer 404 with a JSON error', async () => {
  const response = await server.call('GET', '/api/does-not-exist', { as: admin })
  assert.equal(response.status, 404)
  assert.deepEqual(response.body, { error: 'Not found.' })
})

test('security headers are set and the server type is hidden', async () => {
  const response = await server.call('GET', '/api/health')
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(response.headers.get('x-powered-by'), null)
})

test('every data address refuses a caller who is not signed in', async () => {
  for (const path of ['/api/me', '/api/teams', '/api/projects', '/api/issues', '/api/labels']) {
    const response = await server.call('GET', path)
    assert.equal(response.status, 401, path)
  }
})

test('broken JSON gets a clear 400 error', async () => {
  const response = await server.call('POST', '/api/issues', { as: admin, rawBody: '{"title":' })
  assert.equal(response.status, 400)
  assert.equal(response.body.error, 'The request body is not valid JSON.')
})

test('me returns the signed-in user', async () => {
  const response = await server.call('GET', '/api/me', { as: admin })
  assert.equal(response.status, 200)
  assert.equal(response.body.email, admin)
  assert.equal(response.body.role, 'ADMIN')
})
