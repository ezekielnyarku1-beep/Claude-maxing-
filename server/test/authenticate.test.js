import { after, before, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from 'jose'
import { prisma } from '../src/db.js'
import { createAuthenticate } from '../src/authenticate.js'
import { resetDatabase, startServer } from './helpers.js'

const issuer = 'https://auth.test.example'
let server
let signingKey
let otherKey

async function makeToken(claims, { key = signingKey, tokenIssuer = issuer, expiresIn = '15m' } = {}) {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: 'EdDSA', kid: 'test-key' })
    .setIssuer(tokenIssuer)
    .setAudience(tokenIssuer)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key)
}

const callMe = token => server.call('GET', '/api/me', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
const person = { sub: 'auth-user-1', email: 'New.Person@Test.Example', name: 'New Person', emailVerified: false }

before(async () => {
  const pair = await generateKeyPair('EdDSA')
  signingKey = pair.privateKey
  otherKey = (await generateKeyPair('EdDSA')).privateKey
  const publicJwk = { ...(await exportJWK(pair.publicKey)), kid: 'test-key', alg: 'EdDSA' }
  server = await startServer(createAuthenticate({ keySet: createLocalJWKSet({ keys: [publicJwk] }), issuer }))
})

beforeEach(resetDatabase)

after(async () => {
  await server.close()
  await prisma.$disconnect()
})

test('no token means 401', async () => {
  const response = await callMe()
  assert.equal(response.status, 401)
  assert.equal(response.body.error, 'Sign in to continue.')
})

test('tokens that are fake, expired or from another issuer are refused', async () => {
  const cases = [
    'not-a-token',
    await makeToken(person, { key: otherKey }),
    await makeToken(person, { expiresIn: '-1m' }),
    await makeToken(person, { tokenIssuer: 'https://someone-else.example' }),
  ]
  for (const token of cases) {
    const response = await callMe(token)
    assert.equal(response.status, 401)
  }
  assert.equal(await prisma.user.count(), 0)
})

test('a first sign-in creates a member with no teams', async () => {
  const response = await callMe(await makeToken(person))
  assert.equal(response.status, 200)
  assert.equal(response.body.email, 'new.person@test.example')
  assert.equal(response.body.role, 'MEMBER')
  assert.equal(await prisma.teamMember.count(), 0)
})

test('signing in again uses the same user', async () => {
  const first = await callMe(await makeToken(person))
  const second = await callMe(await makeToken(person))
  assert.equal(first.body.id, second.body.id)
  assert.equal(await prisma.user.count(), 1)
})

test('several requests at the same first sign-in create only one user', async () => {
  const token = await makeToken(person)
  const responses = await Promise.all(Array.from({ length: 5 }, () => callMe(token)))
  assert.deepEqual(responses.map(response => response.status), [200, 200, 200, 200, 200])
  assert.equal(new Set(responses.map(response => response.body.id)).size, 1)
  assert.equal(await prisma.user.count(), 1)
})

test('an existing workspace user is linked only when the email is verified', async () => {
  await prisma.user.create({ data: { email: 'new.person@test.example', name: 'Existing', role: 'ADMIN' } })
  const unverified = await callMe(await makeToken(person))
  assert.equal(unverified.status, 403)
  const verified = await callMe(await makeToken({ ...person, emailVerified: true }))
  assert.equal(verified.status, 200)
  assert.equal(verified.body.name, 'Existing')
  assert.equal(verified.body.role, 'ADMIN')
})

test('a second sign-in account cannot take over a linked user', async () => {
  await callMe(await makeToken(person))
  const other = await callMe(await makeToken({ ...person, sub: 'auth-user-2', emailVerified: true }))
  assert.equal(other.status, 403)
})

test('a blocked account is refused', async () => {
  const response = await callMe(await makeToken({ ...person, banned: true }))
  assert.equal(response.status, 403)
})
