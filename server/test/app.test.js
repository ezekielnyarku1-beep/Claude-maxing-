import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { once } from 'node:events'
import { createApp } from '../src/app.js'

const clientOrigin = 'http://localhost:5173'
let server
let baseUrl

before(async () => {
  server = createApp({ clientOrigin }).listen(0)
  await once(server, 'listening')
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(() => {
  server.close()
})

test('health check answers that the server is running', async () => {
  const response = await fetch(`${baseUrl}/api/health`)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { status: 'ok' })
})

test('CORS allows the frontend address', async () => {
  const response = await fetch(`${baseUrl}/api/health`, { headers: { Origin: clientOrigin } })
  assert.equal(response.headers.get('access-control-allow-origin'), clientOrigin)
})

test('CORS never allows another address', async () => {
  const response = await fetch(`${baseUrl}/api/health`, { headers: { Origin: 'https://other-site.example' } })
  assert.notEqual(response.headers.get('access-control-allow-origin'), 'https://other-site.example')
  assert.notEqual(response.headers.get('access-control-allow-origin'), '*')
})

test('unknown addresses answer 404 with a JSON error', async () => {
  const response = await fetch(`${baseUrl}/api/does-not-exist`)
  assert.equal(response.status, 404)
  assert.deepEqual(await response.json(), { error: 'Not found.' })
})

test('security headers are set and the server type is hidden', async () => {
  const response = await fetch(`${baseUrl}/api/health`)
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(response.headers.get('x-powered-by'), null)
})
