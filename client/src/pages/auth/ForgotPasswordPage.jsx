import { useState } from 'react'
import { Link } from 'react-router'
import AuthLayout from './AuthLayout.jsx'
import FormError from '../../components/FormError.jsx'
import SubmitButton from '../../components/SubmitButton.jsx'
import TextField from '../../components/TextField.jsx'
import { requestPasswordReset } from '../../lib/auth.js'
import { isEmail } from '../../lib/authValidation.js'
import { useFormAction } from '../../lib/useFormAction.js'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sentTo, setSentTo] = useState('')
  const [resent, setResent] = useState(false)
  const form = useFormAction()
  const resend = useFormAction()

  function submit(event) {
    event.preventDefault()
    form.run(async () => {
      if (!isEmail(email)) throw new Error('Enter a valid email address.')
      await requestPasswordReset(email.trim())
      setSentTo(email.trim())
    })
  }

  if (sentTo) {
    return (
      <AuthLayout
        showCheck
        title="Check your email"
        subtitle={
          <>
            If <strong>{sentTo}</strong> has an account, a reset link is on its way.
          </>
        }
        footer={<Link to="/login">Back to log in</Link>}
      >
        <p className="auth-resend" aria-live="polite">
          {resent ? (
            'We sent it again.'
          ) : (
            <>
              Did not get it?{' '}
              <button
                type="button"
                className="link-button"
                disabled={resend.busy}
                onClick={() => resend.run(async () => {
                  await requestPasswordReset(sentTo)
                  setResent(true)
                })}
              >
                Send it again
              </button>
            </>
          )}
        </p>
        {resend.error && <FormError message={resend.error} />}
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we will send you a link to choose a new password."
      footer={<Link to="/login">Back to log in</Link>}
    >
      <form onSubmit={submit} noValidate>
        <TextField id="email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" placeholder="you@company.com" />
        <FormError message={form.error} />
        <SubmitButton busy={form.busy}>Send reset link</SubmitButton>
      </form>
    </AuthLayout>
  )
}
