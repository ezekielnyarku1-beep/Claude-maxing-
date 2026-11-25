import Avatar from '../../components/Avatar.jsx'
import QueryState from '../../components/QueryState.jsx'
import { useUpdateUserRole, useUsers } from '../../lib/queries.js'

export default function UsersSettingsPage() {
  const users = useUsers()
  const updateRole = useUpdateUserRole()

  return (
    <>
      <h1>Users and roles</h1>
      <section className="settings-section" aria-labelledby="users-heading">
        <h2 id="users-heading">Workspace members</h2>
        <p className="muted">Admins see everything and manage settings. Members see only their teams.</p>
        {updateRole.isError && <p className="inline-error" role="alert">{updateRole.error.message}</p>}
        <QueryState query={users} label="users">
          {data => (
            <ul className="settings-card settings-list">
              {data.map(user => (
                <li key={user.id} className="settings-row">
                  <Avatar name={user.name} />
                  <span className="settings-row-main">
                    <span className="settings-row-title">{user.name}</span>
                    <span className="settings-description">{user.email}</span>
                  </span>
                  <span className="settings-row-meta muted">
                    {user.teams.length ? user.teams.map(team => team.key).join(', ') : 'No teams'}
                  </span>
                  <select
                    className="input settings-role"
                    aria-label={`Role for ${user.name}`}
                    value={user.role}
                    disabled={updateRole.isPending}
                    onChange={event => updateRole.mutate({ id: user.id, role: event.target.value })}
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="MEMBER">Member</option>
                  </select>
                </li>
              ))}
            </ul>
          )}
        </QueryState>
      </section>
    </>
  )
}
