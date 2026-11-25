import { useState } from 'react'
import QueryState from '../../components/QueryState.jsx'
import { useUpdateWorkspace, useWorkspace } from '../../lib/queries.js'

function WorkspaceForm({ currentName }) {
  const [name, setName] = useState(currentName)
  const save = useUpdateWorkspace()

  function submit(event) {
    event.preventDefault()
    if (name.trim() && name.trim() !== currentName) save.mutate(name.trim())
  }

  return (
    <form className="settings-card settings-form" onSubmit={submit}>
      <div className="settings-row settings-pair">
        <div className="settings-row-main">
          <label htmlFor="workspace-name" className="settings-row-title">Workspace name</label>
          <span className="settings-description" id="workspace-name-description">Shown to everyone in the workspace.</span>
        </div>
        <div className="settings-inline">
          <input id="workspace-name" aria-describedby="workspace-name-description" className="input" value={name} maxLength={60} onChange={event => setName(event.target.value)} />
          <button type="submit" className="button is-primary" disabled={save.isPending || !name.trim() || name.trim() === currentName}>
            {save.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
      {save.isError && <p className="settings-feedback inline-error" role="alert">{save.error.message}</p>}
      {save.isSuccess && <p className="settings-feedback muted" role="status">Saved.</p>}
    </form>
  )
}

export default function WorkspaceSettingsPage() {
  const workspace = useWorkspace()
  return (
    <>
      <h1>Workspace</h1>
      <section className="settings-section" aria-labelledby="workspace-heading">
        <h2 id="workspace-heading">General</h2>
        <QueryState query={workspace} label="the workspace">
          {data => <WorkspaceForm key={data.name} currentName={data.name} />}
        </QueryState>
      </section>
    </>
  )
}
