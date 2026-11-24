import { Link } from 'react-router'

export default function NoAccessPage() {
  return (
    <div className="message-page">
      <h1>You do not have access to this page</h1>
      <p className="muted">Only admins can open this page. Ask an admin if you need access.</p>
      <Link to="/my-issues" className="button">
        Go to My issues
      </Link>
    </div>
  )
}
