import ProgressBar from './ProgressBar.jsx'
import { formatDateWithYear } from '../lib/format.js'

export default function ProjectSummary({ project }) {
  const [start, target] = [project.startDate, project.targetDate].map(date => (date ? formatDateWithYear(date) : 'Not set'))
  return (
    <section className="project-summary" aria-label="Project details">
      {project.description && <p className="project-summary-description">{project.description}</p>}
      <dl>
        <dt>Team</dt>
        <dd>{project.team.name}</dd>
        <dt>Owner</dt>
        <dd>{project.owner?.name ?? 'No owner'}</dd>
        <dt>Dates</dt>
        <dd>
          {start} → {target}
        </dd>
        <dt>Progress</dt>
        <dd>
          <ProgressBar progress={project.progress} />
        </dd>
      </dl>
    </section>
  )
}
