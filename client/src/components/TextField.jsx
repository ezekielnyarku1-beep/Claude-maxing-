export default function TextField({ id, label, type = 'text', value, onChange, autoComplete, placeholder }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className="input"
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
      />
    </div>
  )
}
