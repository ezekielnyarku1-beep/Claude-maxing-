import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router'
import IssueBoard from './IssueBoard.jsx'
import IssueFilters from './IssueFilters.jsx'
import IssueList from './IssueList.jsx'
import IssuePanel from './IssuePanel.jsx'
import PageHeader from './PageHeader.jsx'
import QueryState from './QueryState.jsx'
import { applyFilter, emptyFilter } from '../lib/issueFilter.js'
import { useIssues } from '../lib/queries.js'
import { useShell } from '../lib/shellContext.js'

const views = [
  { value: 'list', label: 'List' },
  { value: 'board', label: 'Board' },
]

export default function IssuesView({ title, filters, teamKey, summary, initialFilter = emptyFilter, actions }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filter, setFilter] = useState(initialFilter)
  const { openCreateIssue } = useShell()
  const issues = useIssues(filters)
  const view = searchParams.get('view') === 'board' ? 'board' : 'list'
  const openIdentifier = searchParams.get('issue')

  const setParam = useCallback((name, value) => {
    setSearchParams(params => {
      const next = new URLSearchParams(params)
      if (value) next.set(name, value)
      else next.delete(name)
      return next
    })
  }, [setSearchParams])

  const openIssue = identifier => setParam('issue', identifier)
  const closePanel = useCallback(() => {
    const row = document.querySelector(`.issues-view a[href="/issue/${CSS.escape(openIdentifier)}"]`)
    setParam('issue', null)
    row?.focus()
  }, [openIdentifier, setParam])

  const visible = issues.data ? applyFilter(issues.data, filter) : []
  const meta = issues.data && (visible.length === issues.data.length
    ? `${issues.data.length} issues`
    : `${visible.length} of ${issues.data.length} issues`)

  return (
    <div className={`issues-view${openIdentifier ? ' has-panel' : ''}`}>
      <div className="issues-view-main">
        <PageHeader title={title} meta={meta}>
          <IssueFilters issues={issues.data ?? []} filter={filter} onChange={setFilter} />
          <div className="segmented" role="group" aria-label="View">
            {views.map(option => (
              <button
                key={option.value}
                type="button"
                aria-pressed={view === option.value}
                onClick={() => setParam('view', option.value === 'list' ? null : option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {actions?.(filter)}
        </PageHeader>
        {summary}
        <QueryState query={issues} label="issues">
          {data => {
            if (!data.length) {
              return (
                <div className="empty-state">
                  <p>No issues here yet.</p>
                  <button type="button" className="button is-primary" onClick={() => openCreateIssue(teamKey)}>
                    Create an issue
                  </button>
                </div>
              )
            }
            if (!visible.length) {
              return (
                <div className="empty-state">
                  <p>No issues match these filters.</p>
                  <button type="button" className="button" onClick={() => setFilter(emptyFilter)}>
                    Clear filters
                  </button>
                </div>
              )
            }
            return view === 'board'
              ? <IssueBoard issues={visible} onOpen={openIssue} />
              : <IssueList issues={visible} onOpen={openIssue} />
          }}
        </QueryState>
      </div>
      {openIdentifier && <IssuePanel identifier={openIdentifier} onClose={closePanel} />}
    </div>
  )
}
