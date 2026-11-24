import { useState } from 'react'
import { Link } from 'react-router'
import AuthLayout from './AuthLayout.jsx'
import FormError from '../../components/FormError.jsx'
import PasswordField from '../../components/PasswordField.jsx'
import SubmitButton from '../../components/SubmitButton.jsx'
import TextField from '../../components/TextField.jsx'
import { signUp } from '../../lib/auth.js'
import { checkNewPassword, isEmail, passwordHint } from '../../lib/authValidation.js'
import { useFormAction } from '../../lib/useFormAction.js'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const form = useFormAction()

  function submit(event) {
    event.preventDefault()
    form.run(async () => {
      if (!name.trim()) throw new Error('Enter your full name.')
      if (!isEmail(email)) throw new Error('Enter a valid email address.')
      checkNewPassword(password, confirm)
      await signUp({ name: name.trim(), email: email.trim(), password })
    })
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join your team on Overview Teams."
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate>
        <TextField id="name" label="Full name" value={name} onChange={setName} autoComplete="name" placeholder="Your name" />
        <TextField id="email" label="Work email" type="email" value={email} onChange={setEmail} autoComplete="email" placeholder="you@company.com" />
        <PasswordField id="password" label="Password" value={password} onChange={setPassword} autoComplete="new-password" hint={passwordHint} />
        <PasswordField id="confirm" label="Confirm password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        <FormError message={form.error} />
        <SubmitButton busy={form.busy}>Create account</SubmitButton>
      </form>
    </AuthLayout>
  )
}
