import { useParams } from 'react-router'
import IssuesView from '../components/IssuesView.jsx'
import QueryState from '../components/QueryState.jsx'
import { useTeam } from '../lib/queries.js'

export default function TeamIssuesPage() {
  const { teamKey } = useParams()
  const team = useTeam(teamKey)

  return (
    <QueryState query={team} label="the team">
      {data => <IssuesView key={data.key} title={data.name} filters={{ team: data.key }} teamKey={data.key} />}
    </QueryState>
  )
}
