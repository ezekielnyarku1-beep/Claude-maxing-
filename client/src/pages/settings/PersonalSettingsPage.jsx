import { useState } from 'react'
import QueryState from '../../components/QueryState.jsx'
import { appearances, getAppearance, saveAppearance } from '../../lib/appearance.js'
import { useMe } from '../../lib/queries.js'

export default function PersonalSettingsPage() {
  const me = useMe()
  const [appearance, setAppearance] = useState(getAppearance)
  const [saved, setSaved] = useState(true)

  function changeAppearance(event) {
    const selection = event.target.value
    setAppearance(selection)
    setSaved(saveAppearance(selection))
  }

  return (
    <>
      <section className="settings-section" aria-labelledby="appearance-heading">
        <h2 id="appearance-heading">Appearance</h2>
        <div className="settings-form">
          <label htmlFor="appearance">Color theme</label>
          <select id="appearance" className="input settings-theme" value={appearance} onChange={changeAppearance}>
            {appearances.map(theme => (
              <option key={theme} value={theme}>{theme[0].toUpperCase() + theme.slice(1)}</option>
            ))}
          </select>
          {!saved && <p className="muted" role="status">This browser could not save your theme.</p>}
        </div>
      </section>
      <section className="settings-section" aria-labelledby="profile-heading">
        <h2 id="profile-heading">Profile</h2>
        <QueryState query={me} label="your profile">
          {user => (
            <dl className="settings-profile">
              <dt>Name</dt>
              <dd>{user.name}</dd>
              <dt>Email</dt>
              <dd>{user.email}</dd>
              <dt>Role</dt>
              <dd>{user.role === 'ADMIN' ? 'Admin' : 'Member'}</dd>
            </dl>
          )}
        </QueryState>
      </section>
    </>
  )
}
