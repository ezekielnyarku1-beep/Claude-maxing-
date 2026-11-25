import { useEffect, useRef } from 'react'

export default function Dialog({ label, className, onClose, children }) {
  const dialogRef = useRef(null)
  const pressedOnBackdrop = useRef(false)

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
      onPointerDown={event => {
        pressedOnBackdrop.current = event.target === dialogRef.current
      }}
      onClick={event => {
        if (event.target === dialogRef.current && pressedOnBackdrop.current) onClose()
      }}
    >
      {children}
    </dialog>
  )
}
