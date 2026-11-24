export default function SubmitButton({ busy, children }) {
  return (
    <button type="submit" className="button is-primary submit-button" disabled={busy}>
      {busy ? 'Please wait…' : children}
    </button>
  )
}
