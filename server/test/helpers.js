import { once } from 'node:events'
import { prisma } from '../src/db.js'
import { createApp } from '../src/app.js'
import { createIssue } from '../src/issues.js'

export const clientOrigin = 'http://localhost:5173'

async function authenticateFromTestHeader(request, response, next) {
  const email = request.get('x-test-user')
  const user = email && await prisma.user.findUnique({ where: { email } })
  if (!user) {
    response.status(401).json({ error: 'Not signed in.' })
    return
  }
  request.user = user
  next()
}

export async function startServer(authenticate = authenticateFromTestHeader) {
  const server = createApp({ clientOrigin, authenticate }).listen(0)
  await once(server, 'listening')
  const baseUrl = `http://127.0.0.1:${server.address().port}`

  async function call(method, path, { as, body, rawBody, headers = {} } = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        ...(as && { 'x-test-user': as }),
        ...((body !== undefined || rawBody !== undefined) && { 'Content-Type': 'application/json' }),
        ...headers,
      },
      body: rawBody ?? (body === undefined ? undefined : JSON.stringify(body)),
    })
    const text = await response.text()
    return { status: response.status, headers: response.headers, body: text ? JSON.parse(text) : null }
  }

  return { call, close: () => new Promise(resolve => server.close(resolve)) }
}

export async function resetDatabase() {
  const databaseName = new URL(process.env.DATABASE_URL).pathname.slice(1)
  if (!databaseName.endsWith('_test')) {
    throw new Error(`Refusing to wipe "${databaseName}". Tests only run on a database whose name ends with _test.`)
  }
  await prisma.notification.deleteMany()
  await prisma.savedView.deleteMany()
  await prisma.issueActivity.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.issue.deleteMany()
  await prisma.cycle.deleteMany()
  await prisma.project.deleteMany()
  await prisma.teamMember.deleteMany()
  await prisma.label.deleteMany()
  await prisma.team.deleteMany()
  await prisma.user.deleteMany()
  await prisma.workspace.deleteMany()
}

export const admin = 'admin@test.example'
export const engMember = 'eng@test.example'
export const desMember = 'des@test.example'

export async function createFixtures() {
  const [adminUser, engUser, desUser] = await Promise.all([
    prisma.user.create({ data: { email: admin, name: 'Admin Person', role: 'ADMIN' } }),
    prisma.user.create({ data: { email: engMember, name: 'Eng Person' } }),
    prisma.user.create({ data: { email: desMember, name: 'Des Person' } }),
  ])
  const eng = await prisma.team.create({
    data: { key: 'ENG', name: 'Engineering', members: { create: [{ userId: engUser.id }] } },
  })
  const des = await prisma.team.create({
    data: { key: 'DES', name: 'Design', members: { create: [{ userId: desUser.id }] } },
  })
  const bug = await prisma.label.create({ data: { name: 'Bug', color: '#c2362b' } })
  const engProject = await prisma.project.create({ data: { name: 'Eng project', teamId: eng.id, ownerId: engUser.id } })
  const desProject = await prisma.project.create({ data: { name: 'Des project', teamId: des.id } })

  return { adminUser, engUser, desUser, eng, des, bug, engProject, desProject }
}

export function addIssue(team, actor, fields) {
  return prisma.$transaction(tx => createIssue(tx, { teamId: team.id, actorId: actor.id, ...fields }))
}
