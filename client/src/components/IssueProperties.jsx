import Avatar from './Avatar.jsx'
import LabelList from './LabelList.jsx'
import Picker from './Picker.jsx'
import PriorityIcon from './PriorityIcon.jsx'
import StatusPicker from './StatusPicker.jsx'
import { formatDateRange } from '../lib/format.js'
import { priorities, priorityLabel } from '../lib/issueOptions.js'
import { useCycles, useLabels, useProjects, useTeam } from '../lib/queries.js'

const priorityOptions = priorities.map(priority => ({ ...priority, icon: <PriorityIcon priority={priority.value} /> }))
const noneValue = ''
const cycleName = cycle => `Cycle ${cycle.number} · ${formatDateRange(cycle.startDate, cycle.endDate)}`

export default function IssueProperties({ issue, onSave }) {
  const team = useTeam(issue.team.key)
  const labels = useLabels()
  const projects = useProjects({ team: issue.team.key })
  const cycles = useCycles(issue.team.key)
  const loadError = [team, labels, projects, cycles].find(query => query.isError)
  const openCycles = (cycles.data ?? []).filter(cycle => cycle.state !== 'past').reverse()

  const assigneeOptions = [
    { value: noneValue, label: 'No assignee' },
    ...(team.data?.members ?? []).map(member => ({ value: member.id, label: member.name, icon: <Avatar name={member.name} /> })),
  ]
  const projectOptions = [
    { value: noneValue, label: 'No project' },
    ...(projects.data ?? []).map(project => ({ value: project.id, label: project.name })),
  ]
  const cycleOptions = [
    { value: noneValue, label: 'No cycle' },
    ...openCycles.map(cycle => ({ value: cycle.id, label: cycleName(cycle) })),
  ]
  const labelOptions = (labels.data ?? []).map(label => ({
    value: label.id,
    label: label.name,
    icon: <span className="label-dot" style={{ background: label.color }} aria-hidden="true" />,
  }))

  return (
    <>
      {loadError && (
        <p className="inline-error" role="alert">
          {loadError.error.message}{' '}
          <button type="button" className="link-button" onClick={() => loadError.refetch()}>
            Try again
          </button>
        </p>
      )}
      <dl className="issue-properties">
        <dt>Status</dt>
        <dd>
          <StatusPicker issue={issue} showLabel onChange={status => onSave({ status })} />
        </dd>
        <dt>Priority</dt>
        <dd>
          <Picker
            label={`Priority: ${priorityLabel(issue.priority)}`}
            options={priorityOptions}
            value={issue.priority}
            onChange={priority => onSave({ priority })}
            buttonClassName="property-button"
            buttonContent={
              <>
                <PriorityIcon priority={issue.priority} />
                {priorityLabel(issue.priority)}
              </>
            }
          />
        </dd>
        <dt>Assignee</dt>
        <dd>
          <Picker
            label={`Assignee: ${issue.assignee?.name ?? 'No assignee'}`}
            options={assigneeOptions}
            value={issue.assignee?.id ?? noneValue}
            onChange={assigneeId => onSave({ assigneeId: assigneeId || null })}
            buttonClassName="property-button"
            buttonContent={
              <>
                {issue.assignee && <Avatar name={issue.assignee.name} />}
                {issue.assignee?.name ?? 'No assignee'}
              </>
            }
          />
        </dd>
        <dt>Labels</dt>
        <dd>
          <Picker
            label={`Labels: ${issue.labels.map(label => label.name).join(', ') || 'none'}`}
            options={labelOptions}
            value={issue.labels.map(label => label.id)}
            multiple
            onChange={labelIds => onSave({ labelIds })}
            buttonClassName="property-button"
            buttonContent={issue.labels.length ? <LabelList labels={issue.labels} /> : 'No labels'}
          />
        </dd>
        <dt>Project</dt>
        <dd>
          <Picker
            label={`Project: ${issue.project?.name ?? 'No project'}`}
            options={projectOptions}
            value={issue.project?.id ?? noneValue}
            onChange={projectId => onSave({ projectId: projectId || null })}
            buttonClassName="property-button"
            buttonContent={issue.project?.name ?? 'No project'}
          />
        </dd>
        {(openCycles.length > 0 || issue.cycle) && (
          <>
            <dt>Cycle</dt>
            <dd>
              <Picker
                label={`Cycle: ${issue.cycle ? cycleName(issue.cycle) : 'No cycle'}`}
                options={cycleOptions}
                value={issue.cycle?.id ?? noneValue}
                onChange={cycleId => onSave({ cycleId: cycleId || null })}
                buttonClassName="property-button"
                buttonContent={issue.cycle ? cycleName(issue.cycle) : 'No cycle'}
              />
            </dd>
          </>
        )}
        <dt>
          <label htmlFor={`due-${issue.id}`}>Due date</label>
        </dt>
        <dd>
          <input
            id={`due-${issue.id}`}
            type="date"
            className="input"
            value={issue.dueDate ?? ''}
            onChange={event => onSave({ dueDate: event.target.value || null })}
          />
        </dd>
      </dl>
    </>
  )
}
