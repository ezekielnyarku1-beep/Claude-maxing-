import { useState } from 'react'
import IssueActivity from './IssueActivity.jsx'
import IssueComments from './IssueComments.jsx'
import IssueProperties from './IssueProperties.jsx'
import QueryState from './QueryState.jsx'
import { useIssue, useUpdateIssue } from '../lib/queries.js'

function IssueEditor({ issue, headingLevel }) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2'
  const updateIssue = useUpdateIssue()
  const [title, setTitle] = useState(issue.title)
  const [description, setDescription] = useState(issue.description)

  const save = changes => updateIssue.mutate({ identifier: issue.identifier, changes })

  function saveTitle() {
    const trimmed = title.trim()
    if (!trimmed) setTitle(issue.title)
    else if (trimmed !== issue.title) save({ title: trimmed })
  }

  return (
    <article className="issue-detail">
      <Heading className="issue-detail-id">
        {issue.identifier} <span className="muted">in {issue.team.name}</span>
      </Heading>
      {updateIssue.isError && (
        <p className="inline-error" role="alert">
          The change was not saved: {updateIssue.error.message}
        </p>
      )}
      <label htmlFor={`title-${issue.id}`} className="visually-hidden">
        Title
      </label>
      <input
        id={`title-${issue.id}`}
        className="issue-title-input"
        value={title}
        maxLength={200}
        onChange={event => setTitle(event.target.value)}
        onBlur={saveTitle}
        onKeyDown={event => {
          if (event.key === 'Enter') event.currentTarget.blur()
        }}
      />
      <label htmlFor={`description-${issue.id}`} className="visually-hidden">
        Description
      </label>
      <textarea
        id={`description-${issue.id}`}
        className="issue-description-input"
        placeholder="Add a description…"
        rows={4}
        value={description}
        onChange={event => setDescription(event.target.value)}
        onBlur={() => {
          if (description !== issue.description) save({ description })
        }}
      />
      <IssueProperties issue={issue} onSave={save} />
      <IssueComments issue={issue} />
      <IssueActivity issue={issue} />
    </article>
  )
}

export default function IssueDetail({ identifier, headingLevel }) {
  const issue = useIssue(identifier)
  return (
    <QueryState query={issue} label="the issue">
      {data => <IssueEditor key={data.id} issue={data} headingLevel={headingLevel} />}
    </QueryState>
  )
}
