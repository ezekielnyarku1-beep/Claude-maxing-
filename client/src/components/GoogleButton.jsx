import googleLogo from '../assets/google-g.png'

export default function GoogleButton({ label, busy, onClick }) {
  return (
    <>
      <div className="auth-divider" aria-hidden="true">or</div>
      <button type="button" className="google-button" disabled={busy} onClick={onClick}>
        <img src={googleLogo} alt="" />
        {label}
      </button>
    </>
  )
}
