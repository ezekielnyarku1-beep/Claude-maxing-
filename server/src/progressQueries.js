import { prisma } from './db.js'
import { calculateProgress } from './progress.js'

export async function loadProgress(groupField, ids) {
  const rows = await prisma.issue.groupBy({
    by: [groupField, 'status'],
    where: { [groupField]: { in: ids } },
    _count: { _all: true },
  })

  const countsById = new Map(ids.map(id => [id, {}]))
  for (const row of rows) {
    countsById.get(row[groupField])[row.status] = row._count._all
  }
  return new Map([...countsById].map(([id, counts]) => [id, calculateProgress(counts)]))
}
