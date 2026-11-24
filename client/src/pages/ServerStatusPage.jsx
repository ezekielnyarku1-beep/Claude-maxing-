import { useQuery } from '@tanstack/react-query'
import { getHealth } from '../lib/api.js'
import './ServerStatusPage.css'

const messages = {
  pending: 'Checking the server…',
  success: 'The server is running.',
}

export default function ServerStatusPage() {
  const health = useQuery({ queryKey: ['health'], queryFn: getHealth, retry: false })

  return (
    <main className="server-status">
      <h1>Overview Teams</h1>
      <p className="server-status-intro">Setup check</p>
      <p className={`server-status-message is-${health.status}`} role="status">
        {health.isError ? health.error.message : messages[health.status]}
      </p>
      {health.isError && (
        <button type="button" onClick={() => health.refetch()} disabled={health.isFetching}>
          {health.isFetching ? 'Trying again…' : 'Try again'}
        </button>
      )}
    </main>
  )
}
