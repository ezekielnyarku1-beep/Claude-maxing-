import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import IssueDetail from './IssueDetail.jsx'

export default function IssuePanel({ identifier, onClose }) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    closeButtonRef.current.focus()
  }, [identifier])

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape' && !document.querySelector('dialog[open]')) onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <aside className="issue-panel" aria-label={`Issue ${identifier}`}>
      <div className="issue-panel-bar">
        <Link to={`/issue/${identifier}`} className="button">
          Open full page
        </Link>
        <button type="button" ref={closeButtonRef} className="icon-button" aria-label="Close panel" onClick={onClose}>
          ✕
        </button>
      </div>
      <IssueDetail identifier={identifier} headingLevel={2} />
    </aside>
  )
}
