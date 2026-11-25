import { Navigate, Outlet, useSearchParams } from 'react-router'
import Skeleton from './Skeleton.jsx'
import { authClient, safeRedirectPath } from '../lib/auth.js'

export default function GuestOnly() {
  const session = authClient.useSession()
  const [searchParams] = useSearchParams()

  if (session.isPending) return <Skeleton label="the sign-in page" layout="form" />
  if (session.data?.user) return <Navigate to={safeRedirectPath(searchParams.get('redirectTo'))} replace />
  return <Outlet />
}
