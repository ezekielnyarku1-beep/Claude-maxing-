import { useState } from 'react'
import IssueActivity from './IssueActivity.jsx'
import IssueComments from './IssueComments.jsx'
import IssueProperties from './IssueProperties.jsx'
import QueryState from './QueryState.jsx'
import { useIssue, useUpdateIssue } from '../lib/queries.js'

function useDraft(savedValue, toChanges, saveAsync) {
  const [draft, setDraft] = useState(null)
  return {
    value: draft ? draft.value : savedValue,
    onFocus: () => setDraft(current => ({ ...(current ?? { original: savedValue, value: savedValue }), focused: true })),
    onChange: event => setDraft({ ...draft, value: event.target.value }),
    onBlur: () => {
      const sent = draft.value
      const before = draft.original
      const changes = sent.trim() === before.trim() ? null : toChanges(sent)
      if (!changes) return setDraft(null)
      setDraft({ original: sent, value: sent, focused: false })
      saveAsync(changes).then(
        () => setDraft(current => (current && !current.focused && current.value === sent ? null : current)),
        () => setDraft(current => current && { ...current, original: before }),
      )
    },
  }
}

function IssueEditor({ issue, headingLevel }) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2'
  const updateIssue = useUpdateIssue()
  const save = changes => updateIssue.mutate({ identifier: issue.identifier, changes })
  const saveAsync = changes => updateIssue.mutateAsync({ identifier: issue.identifier, changes })
  const title = useDraft(issue.title, value => value.trim() && { title: value.trim() }, saveAsync)
  const description = useDraft(issue.description, value => ({ description: value }), saveAsync)

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
