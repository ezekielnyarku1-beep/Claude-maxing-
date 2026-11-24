import { useState } from 'react'

export default function PasswordField({ id, label, value, onChange, autoComplete, placeholder, hint, extra }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="field">
      <div className="field-top">
        <label htmlFor={id}>{label}</label>
        {extra}
      </div>
      <div className="password-input">
        <input
          id={id}
          className="input"
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={event => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
        <button
          type="button"
          className="password-toggle"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-controls={id}
          onClick={() => setVisible(isVisible => !isVisible)}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      {hint && (
        <p className="field-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
    </div>
  )
}
