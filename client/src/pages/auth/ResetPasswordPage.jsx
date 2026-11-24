import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import AuthLayout from './AuthLayout.jsx'
import FormError from '../../components/FormError.jsx'
import PasswordField from '../../components/PasswordField.jsx'
import SubmitButton from '../../components/SubmitButton.jsx'
import { resetPassword } from '../../lib/auth.js'
import { checkNewPassword, passwordHint } from '../../lib/authValidation.js'
import { useFormAction } from '../../lib/useFormAction.js'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)
  const form = useFormAction()

  function submit(event) {
    event.preventDefault()
    form.run(async () => {
      checkNewPassword(password, confirm)
      await resetPassword(token, password)
      setDone(true)
    })
  }

  if (done) {
    return (
      <AuthLayout showCheck title="Password updated" subtitle="Your new password is saved. Log in to continue.">
        <Link to="/login" className="button is-primary submit-button">
          Log in
        </Link>
      </AuthLayout>
    )
  }

  if (!token || searchParams.get('error')) {
    return (
      <AuthLayout
        title="This link does not work"
        subtitle="The reset link has expired or was already used. Ask for a new one."
        footer={<Link to="/login">Back to log in</Link>}
      >
        <Link to="/forgot-password" className="button is-primary submit-button">
          Send a new link
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Choose a new password" subtitle="Pick a password you have not used before.">
      <form onSubmit={submit} noValidate>
        <PasswordField id="password" label="New password" value={password} onChange={setPassword} autoComplete="new-password" hint={passwordHint} />
        <PasswordField id="confirm" label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        <FormError message={form.error} />
        <SubmitButton busy={form.busy}>Save new password</SubmitButton>
      </form>
    </AuthLayout>
  )
}
