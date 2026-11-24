import { Navigate, Outlet, useLocation } from 'react-router'
import { authClient } from '../lib/auth.js'

export default function RequireSession() {
  const session = authClient.useSession()
  const location = useLocation()

  if (session.isPending) {
    return (
      <p className="query-state" role="status">
        Loading…
      </p>
    )
  }
  if (!session.data?.user) {
    const redirectTo = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirectTo=${redirectTo}`} replace />
  }
  return <Outlet />
}
