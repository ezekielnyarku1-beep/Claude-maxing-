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
    <form className="settings-form" onSubmit={submit}>
      <label htmlFor="workspace-name">Workspace name</label>
      <div className="settings-inline">
        <input id="workspace-name" className="input" value={name} maxLength={60} onChange={event => setName(event.target.value)} />
        <button type="submit" className="button is-primary" disabled={save.isPending || !name.trim() || name.trim() === currentName}>
          {save.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
      {save.isError && <p className="inline-error" role="alert">{save.error.message}</p>}
      {save.isSuccess && <p className="muted" role="status">Saved.</p>}
    </form>
  )
}

export default function WorkspaceSettingsPage() {
  const workspace = useWorkspace()
  return (
    <section className="settings-section" aria-labelledby="workspace-heading">
      <h2 id="workspace-heading">Workspace</h2>
      <QueryState query={workspace} label="the workspace">
        {data => <WorkspaceForm key={data.name} currentName={data.name} />}
      </QueryState>
    </section>
  )
}
