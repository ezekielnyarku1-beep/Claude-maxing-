import { HttpError } from './errors.js'
import { toDateString } from './serializers.js'

export async function createIssue(tx, { teamId, actorId, labelIds = [], ...fields }, include) {
  const team = await tx.team.update({
    where: { id: teamId },
    data: { nextIssueNumber: { increment: 1 } },
  })
  return tx.issue.create({
    data: {
      ...fields,
      teamId,
      number: team.nextIssueNumber - 1,
      labels: { connect: labelIds.map(id => ({ id })) },
      activities: { create: { actorId } },
    },
    include,
  })
}

export async function checkIssueReferences(tx, teamId, { assigneeId, projectId, labelIds }) {
  if (assigneeId) {
    const membership = await tx.teamMember.findUnique({ where: { teamId_userId: { teamId, userId: assigneeId } } })
    if (!membership) throw new HttpError(400, 'The assignee must be a member of the team.')
  }
  if (projectId) {
    const project = await tx.project.findFirst({ where: { id: projectId, teamId } })
    if (!project) throw new HttpError(400, 'The project must belong to the same team.')
  }
  if (labelIds?.length) {
    const found = await tx.label.count({ where: { id: { in: labelIds } } })
    if (found !== labelIds.length) throw new HttpError(400, 'One or more labels do not exist.')
  }
}

const joinNames = labels => labels.map(label => label.name).sort().join(', ') || null

export function describeChanges(before, after) {
  const comparisons = [
    ['title', before.title, after.title],
    ['status', before.status, after.status],
    ['priority', before.priority, after.priority],
    ['assignee', before.assignee?.name ?? null, after.assignee?.name ?? null],
    ['project', before.project?.name ?? null, after.project?.name ?? null],
    ['dueDate', toDateString(before.dueDate), toDateString(after.dueDate)],
    ['labels', joinNames(before.labels), joinNames(after.labels)],
  ]
  const changes = comparisons
    .filter(([, fromValue, toValue]) => fromValue !== toValue)
    .map(([field, fromValue, toValue]) => ({ field, fromValue, toValue }))
  if (before.description !== after.description) changes.push({ field: 'description', fromValue: null, toValue: null })
  return changes
}
