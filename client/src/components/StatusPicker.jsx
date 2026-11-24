import Picker from './Picker.jsx'
import StatusIcon from './StatusIcon.jsx'
import { statusLabel, statuses } from '../lib/issueOptions.js'

const statusOptions = statuses.map(status => ({ ...status, icon: <StatusIcon status={status.value} /> }))

export default function StatusPicker({ issue, onChange, showLabel = false }) {
  return (
    <Picker
      label={`Status of ${issue.identifier}: ${statusLabel(issue.status)}`}
      options={statusOptions}
      value={issue.status}
      onChange={onChange}
      buttonClassName={showLabel ? 'property-button' : 'icon-button'}
      buttonContent={
        <>
          <StatusIcon status={issue.status} />
          {showLabel && statusLabel(issue.status)}
        </>
      }
    />
  )
}
