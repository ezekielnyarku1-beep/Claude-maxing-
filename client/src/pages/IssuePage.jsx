import { useParams } from 'react-router'
import IssueDetail from '../components/IssueDetail.jsx'

export default function IssuePage() {
  const { identifier } = useParams()
  return (
    <div className="issue-page">
      <IssueDetail key={identifier} identifier={identifier} headingLevel={1} />
    </div>
  )
}
