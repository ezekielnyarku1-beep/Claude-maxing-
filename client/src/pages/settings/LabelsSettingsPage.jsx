import { useState } from 'react'
import LabelSettingsRow from '../../components/LabelSettingsRow.jsx'
import QueryState from '../../components/QueryState.jsx'
import { useCreateLabel, useLabels } from '../../lib/queries.js'

const startingColor = '#6b7385'

export default function LabelsSettingsPage() {
  const labels = useLabels()
  const createLabel = useCreateLabel()
  const [name, setName] = useState('')
  const [color, setColor] = useState(startingColor)

  function submit(event) {
    event.preventDefault()
    if (!name.trim()) return
    createLabel.mutate({ name: name.trim(), color }, {
      onSuccess: () => {
        setName('')
        setColor(startingColor)
      },
    })
  }

  return (
    <section className="settings-section" aria-labelledby="labels-heading">
      <h2 id="labels-heading">Labels</h2>
      <p className="muted">Labels are shared by every team.</p>
      <form className="settings-form settings-inline" onSubmit={submit}>
        <label htmlFor="new-label-color" className="visually-hidden">
          Color of the new label
        </label>
        <input id="new-label-color" type="color" className="color-input" value={color} onChange={event => setColor(event.target.value)} />
        <label htmlFor="new-label-name" className="visually-hidden">
          Name of the new label
        </label>
        <input
          id="new-label-name"
          className="input settings-grow"
          value={name}
          maxLength={40}
          placeholder="New label name"
          onChange={event => setName(event.target.value)}
        />
        <button type="submit" className="button is-primary" disabled={!name.trim() || createLabel.isPending}>
          {createLabel.isPending ? 'Creating…' : 'Create label'}
        </button>
      </form>
      {createLabel.isError && <p className="inline-error" role="alert">{createLabel.error.message}</p>}
      <QueryState query={labels} label="labels">
        {data =>
          data.length === 0 ? (
            <p className="muted">No labels yet.</p>
          ) : (
            <ul className="settings-list">
              {data.map(label => (
                <LabelSettingsRow key={`${label.id}-${label.name}-${label.color}`} label={label} />
              ))}
            </ul>
          )}
      </QueryState>
    </section>
  )
}
