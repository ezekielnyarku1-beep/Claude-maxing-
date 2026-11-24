import { closedStatuses } from './issueOptions.js'

export const emptyFilter = { priorities: [], assigneeIds: [], labelIds: [], showClosed: true }

export const countActiveFilters = filter =>
  filter.priorities.length + filter.assigneeIds.length + filter.labelIds.length + (filter.showClosed ? 0 : 1)

export function applyFilter(issues, filter) {
  return issues.filter(issue =>
    (filter.showClosed || !closedStatuses.includes(issue.status)) &&
    (!filter.priorities.length || filter.priorities.includes(issue.priority)) &&
    (!filter.assigneeIds.length || filter.assigneeIds.includes(issue.assignee?.id)) &&
    (!filter.labelIds.length || issue.labels.some(label => filter.labelIds.includes(label.id))))
}
