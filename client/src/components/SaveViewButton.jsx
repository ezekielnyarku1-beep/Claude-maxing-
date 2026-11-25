import { useState } from 'react'
import ViewFormDialog from './ViewFormDialog.jsx'

export default function SaveViewButton({ teamKey, filter, label = 'Save view', primary }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className={primary ? 'button is-primary' : 'button'} onClick={() => setOpen(true)}>
        {label}
      </button>
      {open && <ViewFormDialog teamKey={teamKey} filter={filter} onClose={() => setOpen(false)} />}
    </>
  )
}
