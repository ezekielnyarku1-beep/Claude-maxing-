import Skeleton from './Skeleton.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'

export default function QueryState({ query, label, skeleton, children }) {
  if (query.isPending) return <Skeleton label={label} layout={skeleton} />

  if (query.isError) {
    if (query.error.status === 404) return <NotFoundPage />
    return (
      <div className="query-state is-error" role="alert">
        <p>{query.error.message}</p>
        <button type="button" className="button" onClick={() => query.refetch()} disabled={query.isFetching}>
          {query.isFetching ? 'Trying again…' : 'Try again'}
        </button>
      </div>
    )
  }

  return children(query.data)
}
