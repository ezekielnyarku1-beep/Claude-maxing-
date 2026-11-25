import { useState } from 'react'
import IssueActivity from './IssueActivity.jsx'
import IssueComments from './IssueComments.jsx'
import IssueProperties from './IssueProperties.jsx'
import QueryState from './QueryState.jsx'
import { useIssue, useUpdateIssue } from '../lib/queries.js'

function useDraft(savedValue, toChanges, save) {
  const [draft, setDraft] = useState(null)
  const clear = () => setDraft(null)
  return {
    value: draft ? draft.value : savedValue,
    onFocus: () => setDraft(current => current ?? { original: savedValue, value: savedValue }),
    onChange: event => setDraft({ ...draft, value: event.target.value }),
    onBlur: () => {
      const changes = draft.value.trim() === draft.original.trim() ? null : toChanges(draft.value)
      if (changes) save(changes, { onSuccess: clear })
      else clear()
    },
  }
}

function IssueEditor({ issue, headingLevel }) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2'
  const updateIssue = useUpdateIssue()
  const save = (changes, options) => updateIssue.mutate({ identifier: issue.identifier, changes }, options)
  const title = useDraft(issue.title, value => value.trim() && { title: value.trim() }, save)
  const description = useDraft(issue.description, value => ({ description: value }), save)

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
        maxLength={200}
        {...title}
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
        maxLength={10000}
        {...description}
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
    <QueryState query={issue} label="the issue" skeleton="detail">
      {data => <IssueEditor key={data.id} issue={data} headingLevel={headingLevel} />}
    </QueryState>
  )
}
