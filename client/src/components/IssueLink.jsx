import { Link } from 'react-router'

const opensInNewTab = event => event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0

export default function IssueLink({ identifier, onOpen, children, ...props }) {
  return (
    <Link
      to={`/issue/${identifier}`}
      onClick={event => {
        if (opensInNewTab(event)) return
        event.preventDefault()
        onOpen(identifier)
      }}
      {...props}
    >
      {children}
    </Link>
  )
}
