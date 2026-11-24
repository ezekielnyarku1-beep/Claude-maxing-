import { NavLink, Outlet } from 'react-router'
import PageHeader from '../../components/PageHeader.jsx'

const sections = [
  { path: 'workspace', label: 'Workspace' },
  { path: 'users', label: 'Users and roles' },
  { path: 'teams', label: 'Teams' },
  { path: 'labels', label: 'Labels' },
]

export default function SettingsLayout() {
  return (
    <div className="settings">
      <PageHeader title="Settings">
        <nav className="settings-nav" aria-label="Settings sections">
          {sections.map(section => (
            <NavLink key={section.path} to={`/settings/${section.path}`}>
              {section.label}
            </NavLink>
          ))}
        </nav>
      </PageHeader>
      <div className="settings-body">
        <Outlet />
      </div>
    </div>
  )
}
