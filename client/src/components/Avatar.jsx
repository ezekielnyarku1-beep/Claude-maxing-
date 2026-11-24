const initialsOf = name =>
  name
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export default function Avatar({ name }) {
  return (
    <span className="avatar" aria-hidden="true">
      {initialsOf(name)}
    </span>
  )
}
