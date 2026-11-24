const filledBars = { HIGH: 3, MEDIUM: 2, LOW: 1 }

export default function PriorityIcon({ priority }) {
  return (
    <svg className={`priority-icon is-${priority}`} width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      {priority === 'NO_PRIORITY' && (
        <path d="M2.5 7h2M6 7h2M9.5 7h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      )}
      {priority === 'URGENT' && (
        <>
          <rect x="1.5" y="1.5" width="11" height="11" rx="2.5" fill="currentColor" />
          <path d="M7 4v3.5" stroke="var(--panel)" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="7" cy="9.75" r="0.9" fill="var(--panel)" />
        </>
      )}
      {priority in filledBars &&
        [0, 1, 2].map(index => (
          <rect
            key={index}
            x={2 + index * 3.5}
            y={9 - index * 3}
            width="2.5"
            height={3 + index * 3}
            rx="0.75"
            className={index < filledBars[priority] ? 'bar-on' : 'bar-off'}
          />
        ))}
    </svg>
  )
}
