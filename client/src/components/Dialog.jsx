import { useEffect, useRef } from 'react'

export default function Dialog({ label, className, onClose, children }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    dialog.querySelector('[data-autofocus]')?.focus()
    return () => dialog.close()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className={`dialog ${className}`}
      aria-label={label}
      onCancel={event => {
        event.preventDefault()
        onClose()
      }}
      onClick={event => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      {children}
    </dialog>
  )
}
