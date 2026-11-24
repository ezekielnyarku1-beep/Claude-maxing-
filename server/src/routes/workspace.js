import { Router } from 'express'
import { prisma } from '../db.js'
import { requireAdmin } from '../access.js'
import { readBody, readText } from '../validation.js'

export const workspaceRouter = Router()

const workspaceId = 1
const defaultName = 'My workspace'

workspaceRouter.get('/', async (request, response) => {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
  response.json({ name: workspace?.name ?? defaultName })
})

workspaceRouter.patch('/', requireAdmin, async (request, response) => {
  const name = readText(readBody(request).name, 'Workspace name', { max: 60 })
  const workspace = await prisma.workspace.upsert({
    where: { id: workspaceId },
    create: { id: workspaceId, name },
    update: { name },
  })
  response.json({ name: workspace.name })
})
