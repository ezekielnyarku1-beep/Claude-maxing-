import { useEffect, useId, useRef, useState } from 'react'

export default function Popover({ label, buttonContent, buttonClassName = 'button', children }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const buttonId = useId()

  useEffect(() => {
    if (!open) return undefined
    const closeOnOutsideClick = event => {
      if (!rootRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [open])

  function close() {
    setOpen(false)
    document.getElementById(buttonId)?.focus()
  }

  function closeOnEscape(event) {
    if (event.key === 'Escape' && open) {
      event.stopPropagation()
      close()
    }
  }

  return (
    <div className="popover" ref={rootRef} onKeyDown={closeOnEscape}>
      <button
        type="button"
        id={buttonId}
        className={buttonClassName}
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen(isOpen => !isOpen)}
      >
        {buttonContent}
      </button>
      {open && <div className="popover-panel">{children(close)}</div>}
    </div>
  )
}
