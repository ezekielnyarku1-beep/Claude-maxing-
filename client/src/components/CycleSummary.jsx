import { Link } from 'react-router'
import ProgressBar from './ProgressBar.jsx'
import { formatDateRange } from '../lib/format.js'

const stateLabels = { current: 'Current cycle', upcoming: 'Upcoming cycle', past: 'Finished cycle' }

export default function CycleSummary({ teamKey, cycle, showLinks }) {
  return (
    <section className="project-summary" aria-label="Cycle">
      <dl>
        <dt>{stateLabels[cycle.state]}</dt>
        <dd>
          Cycle {cycle.number} · {formatDateRange(cycle.startDate, cycle.endDate)}
          {showLinks && (
            <span className="cycle-summary-links">
              <Link to={`/team/${teamKey}/cycles/${cycle.number}`}>Open cycle</Link>
              <Link to={`/team/${teamKey}/cycles`}>All cycles</Link>
            </span>
          )}
        </dd>
        <dt>Progress</dt>
        <dd>
          <ProgressBar progress={cycle.progress} />
        </dd>
      </dl>
    </section>
  )
}
