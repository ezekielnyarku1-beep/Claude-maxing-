import { Router } from 'express'
import { prisma } from '../db.js'
import { visibleTeamsWhere } from '../access.js'
import { HttpError } from '../errors.js'
import { personSelect, teamSelect } from '../serializers.js'
import { isId, readBody, readBoolean } from '../validation.js'

export const notificationsRouter = Router()

const ownVisibleNotifications = user => ({ userId: user.id, issue: { team: visibleTeamsWhere(user) } })
const notificationInclude = {
  actor: personSelect,
  issue: { select: { number: true, title: true, status: true, team: teamSelect } },
}

const serializeNotification = notification => ({
  id: notification.id,
  type: notification.type,
  read: notification.readAt !== null,
  createdAt: notification.createdAt,
  actor: notification.actor,
  issue: {
    identifier: `${notification.issue.team.key}-${notification.issue.number}`,
    title: notification.issue.title,
    status: notification.issue.status,
  },
})

notificationsRouter.get('/', async (request, response) => {
  const where = ownVisibleNotifications(request.user)
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where, include: notificationInclude, orderBy: { createdAt: 'desc' }, take: 50 }),
    prisma.notification.count({ where: { ...where, readAt: null } }),
  ])
  response.json({ unreadCount, notifications: notifications.map(serializeNotification) })
})

notificationsRouter.post('/read-all', async (request, response) => {
  const { count } = await prisma.notification.updateMany({
    where: { ...ownVisibleNotifications(request.user), readAt: null },
    data: { readAt: new Date() },
  })
  response.json({ updated: count })
})

notificationsRouter.patch('/:id', async (request, response) => {
  const read = readBoolean(readBody(request).read, 'Read')
  const id = request.params.id
  const notification = isId(id) && await prisma.notification.findFirst({ where: { id, ...ownVisibleNotifications(request.user) } })
  if (!notification) throw new HttpError(404, 'Notification not found.')
  const updated = await prisma.notification.update({
    where: { id },
    data: { readAt: read ? notification.readAt ?? new Date() : null },
    include: notificationInclude,
  })
  response.json(serializeNotification(updated))
})
