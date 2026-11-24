import { useState } from 'react'
import { Link } from 'react-router'
import PageHeader from '../components/PageHeader.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import ProjectFormDialog from '../components/ProjectFormDialog.jsx'
import QueryState from '../components/QueryState.jsx'
import { formatDateWithYear } from '../lib/format.js'
import { useIsAdmin, useProjects } from '../lib/queries.js'

export default function ProjectsPage() {
  const projects = useProjects()
  const isAdmin = useIsAdmin()
  const [creating, setCreating] = useState(false)

  return (
    <div className="projects-page">
      <PageHeader title="Projects" meta={projects.data && `${projects.data.length} projects`}>
        {isAdmin && (
          <button type="button" className="button is-primary" onClick={() => setCreating(true)}>
            New project
          </button>
        )}
      </PageHeader>
      {creating && <ProjectFormDialog onClose={() => setCreating(false)} />}
      <QueryState query={projects} label="projects">
        {data =>
          data.length === 0 ? (
            <p className="empty-state">No projects yet. Admins can create projects.</p>
          ) : (
            <ul className="project-rows">
              {data.map(project => (
                <li key={project.id}>
                  <Link to={`/projects/${project.id}`} className="project-row">
                    <span className="project-row-name">{project.name}</span>
                    <span className="project-row-team">{project.team.key}</span>
                    <span className="project-row-owner muted">{project.owner?.name ?? 'No owner'}</span>
                    <span className="project-row-date muted">
                      {project.targetDate ? formatDateWithYear(project.targetDate) : 'No target date'}
                    </span>
                    <ProgressBar progress={project.progress} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
      </QueryState>
    </div>
  )
}
