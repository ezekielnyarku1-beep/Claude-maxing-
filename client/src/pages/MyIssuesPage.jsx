import IssuesView from '../components/IssuesView.jsx'

const myIssuesFilter = { assignee: 'me' }

export default function MyIssuesPage() {
  return <IssuesView title="My issues" filters={myIssuesFilter} />
}
