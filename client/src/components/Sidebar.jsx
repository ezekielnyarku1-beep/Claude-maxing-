import { NavLink, useNavigate } from 'react-router'
import Avatar from './Avatar.jsx'
import { signOut } from '../lib/auth.js'
import { useMe, useTeams } from '../lib/queries.js'
import { useShell } from '../lib/shellContext.js'
import { useFormAction } from '../lib/useFormAction.js'

export default function Sidebar() {
  const { openCreateIssue, openCommandMenu } = useShell()
  const navigate = useNavigate()
  const me = useMe()
  const teams = useTeams()
  const logOut = useFormAction()

  return (
    <nav className="sidebar" aria-label="Main">
      <div className="sidebar-brand">
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <rect x="1" y="9" width="4" height="8" rx="1" />
          <rect x="7" y="5" width="4" height="12" rx="1" />
          <rect x="13" y="1" width="4" height="16" rx="1" />
        </svg>
        <span>Overview Teams</span>
      </div>

      <div className="sidebar-actions">
        <button type="button" className="sidebar-item" onClick={openCommandMenu}>
          Search
          <kbd aria-hidden="true">Ctrl K</kbd>
        </button>
        <button type="button" className="sidebar-item" onClick={() => openCreateIssue()}>
          New issue
          <kbd aria-hidden="true">C</kbd>
        </button>
      </div>

      <ul className="sidebar-links">
        <li>
          <NavLink to="/my-issues" className="sidebar-item">
            My issues
          </NavLink>
        </li>
        <li>
          <NavLink to="/projects" className="sidebar-item">
            Projects
          </NavLink>
        </li>
      </ul>

      <h2 className="sidebar-heading" id="sidebar-teams">
        Teams
      </h2>
      {teams.isError && (
        <p className="sidebar-note" role="alert">
          Teams could not load.{' '}
          <button type="button" className="link-button" onClick={() => teams.refetch()}>
            Try again
          </button>
        </p>
      )}
      <ul className="sidebar-links" aria-labelledby="sidebar-teams">
        {(teams.data ?? []).map(team => (
          <li key={team.key}>
            <NavLink to={`/team/${team.key}`} className="sidebar-item">
              {team.name}
              <span className="sidebar-key">{team.key}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {me.data && (
        <div className="sidebar-user">
          <Avatar name={me.data.name} />
          <span className="sidebar-user-name">{me.data.name}</span>
          <span className="muted">{me.data.role === 'ADMIN' ? 'Admin' : 'Member'}</span>
        </div>
      )}
      <button
        type="button"
        className="sidebar-item"
        disabled={logOut.busy}
        onClick={() => logOut.run(async () => {
          await signOut()
          navigate('/login', { replace: true })
        })}
      >
        {logOut.busy ? 'Logging out…' : 'Log out'}
      </button>
      {logOut.error && (
        <p className="sidebar-note" role="alert">
          {logOut.error}
        </p>
      )}
    </nav>
  )
}
