import { Router } from 'express'
import { prisma } from '../db.js'
import { requireAdmin } from '../access.js'
import { HttpError } from '../errors.js'
import { isId, readBody, readColor, readText } from '../validation.js'

export const labelsRouter = Router()

const labelSelect = { id: true, name: true, color: true }
const readLabelName = value => readText(value, 'Label name', { max: 40 })

labelsRouter.get('/', async (request, response) => {
  response.json(await prisma.label.findMany({ select: labelSelect, orderBy: { name: 'asc' } }))
})

labelsRouter.post('/', requireAdmin, async (request, response) => {
  const body = readBody(request)
  const label = await prisma.label.create({
    data: { name: readLabelName(body.name), color: readColor(body.color) },
    select: labelSelect,
  })
  response.status(201).json(label)
})

labelsRouter.patch('/:id', requireAdmin, async (request, response) => {
  const body = readBody(request)
  const label = isId(request.params.id) && await prisma.label.findUnique({ where: { id: request.params.id } })
  if (!label) throw new HttpError(404, 'Label not found.')
  const data = {}
  if ('name' in body) data.name = readLabelName(body.name)
  if ('color' in body) data.color = readColor(body.color)
  response.json(await prisma.label.update({ where: { id: label.id }, data, select: labelSelect }))
})
