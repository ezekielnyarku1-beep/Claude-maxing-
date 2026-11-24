import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <div className="message-page">
      <h1>Page not found</h1>
      <p className="muted">This page does not exist, or you do not have access to it.</p>
      <Link to="/my-issues" className="button">
        Go to My issues
      </Link>
    </div>
  )
}
