import { useState } from 'react'
import { useUpdateLabel } from '../lib/queries.js'

export default function LabelSettingsRow({ label }) {
  const [name, setName] = useState(label.name)
  const [color, setColor] = useState(label.color)
  const update = useUpdateLabel()
  const changed = name.trim() !== label.name || color !== label.color

  function submit(event) {
    event.preventDefault()
    if (name.trim() && changed) update.mutate({ id: label.id, fields: { name: name.trim(), color } })
  }

  return (
    <li>
      <form className="settings-row" onSubmit={submit}>
        <label htmlFor={`label-color-${label.id}`} className="visually-hidden">
          Color of {label.name}
        </label>
        <input id={`label-color-${label.id}`} type="color" className="color-input" value={color} onChange={event => setColor(event.target.value)} />
        <label htmlFor={`label-name-${label.id}`} className="visually-hidden">
          Name of {label.name}
        </label>
        <input
          id={`label-name-${label.id}`}
          className="input settings-row-main"
          value={name}
          maxLength={40}
          onChange={event => setName(event.target.value)}
        />
        <button type="submit" className="button" disabled={!changed || !name.trim() || update.isPending}>
          Save
        </button>
      </form>
      {update.isError && <p className="inline-error" role="alert">{update.error.message}</p>}
    </li>
  )
}
