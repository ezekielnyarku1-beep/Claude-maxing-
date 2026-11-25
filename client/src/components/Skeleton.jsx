import { Fragment } from 'react'
import './skeleton.css'

const widths = ['62%', '48%', '71%', '55%', '66%', '40%', '58%', '50%']

function Bar({ width, className = '' }) {
  return <span className={`skeleton-bar ${className}`} style={width ? { width } : undefined} />
}

function Rows({ count }) {
  return Array.from({ length: count }, (_, index) => (
    <div key={index} className="skeleton-row">
      <span className="skeleton-dot" />
      <Bar className="skeleton-id" />
      <Bar width={widths[index % widths.length]} />
      <Bar className="skeleton-meta" />
    </div>
  ))
}

function PageLayout() {
  return (
    <>
      <div className="skeleton-header">
        <Bar className="skeleton-title" />
      </div>
      <Rows count={8} />
    </>
  )
}

const layouts = {
  list: () => <Rows count={6} />,
  short: () => <Rows count={3} />,
  menu: () => <Rows count={4} />,
  page: PageLayout,
  detail: () => (
    <div className="skeleton-detail">
      <Bar className="skeleton-id" />
      <Bar className="skeleton-heading" width="70%" />
      <Bar width="92%" />
      <Bar width="84%" />
      <Bar width="60%" />
      <div className="skeleton-properties">
        {widths.slice(0, 6).map(width => (
          <Fragment key={width}>
            <Bar className="skeleton-label" />
            <Bar width={width} />
          </Fragment>
        ))}
      </div>
    </div>
  ),
  form: () => (
    <div className="skeleton-form">
      {[0, 1, 2].map(index => (
        <div key={index} className="skeleton-field">
          <Bar className="skeleton-label" />
          <span className="skeleton-input" />
        </div>
      ))}
    </div>
  ),
  shell: () => (
    <div className="skeleton-shell">
      <div className="skeleton-sidebar">
        <Bar className="skeleton-title" />
        {widths.slice(0, 5).map(width => (
          <Bar key={width} width={width} />
        ))}
      </div>
      <div className="skeleton-main">
        <PageLayout />
      </div>
    </div>
  ),
}

export default function Skeleton({ label, layout = 'list' }) {
  const Layout = layouts[layout]
  return (
    <div className={`skeleton is-${layout}`} role="status">
      <span className="visually-hidden">Loading {label}…</span>
      <div aria-hidden="true">
        <Layout />
      </div>
    </div>
  )
}
