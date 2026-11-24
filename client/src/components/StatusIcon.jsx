export default function StatusIcon({ status }) {
  return (
    <svg className={`status-icon is-${status}`} width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      {status === 'BACKLOG' && (
        <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
      )}
      {status === 'TODO' && <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" />}
      {status === 'IN_PROGRESS' && (
        <>
          <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 3.5a3.5 3.5 0 0 1 0 7z" fill="currentColor" />
        </>
      )}
      {status === 'DONE' && (
        <>
          <circle cx="7" cy="7" r="6.25" fill="currentColor" />
          <path d="M4.5 7.2l1.7 1.7 3.4-3.6" fill="none" stroke="var(--panel)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {status === 'CANCELED' && (
        <>
          <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 5l4 4M9 5l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}
