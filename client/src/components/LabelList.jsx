export default function LabelList({ labels }) {
  if (!labels.length) return null
  return (
    <span className="label-list">
      {labels.map(label => (
        <span key={label.id} className="label-chip">
          <span className="label-dot" style={{ background: label.color }} aria-hidden="true" />
          {label.name}
        </span>
      ))}
    </span>
  )
}
