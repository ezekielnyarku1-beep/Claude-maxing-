import React, { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth'
import { api } from '../api'
import { Brand, usePageTitle } from '../components'
import './Login.css'

function AuthLayout({ title, subtitle, footer, children }) {
  usePageTitle(title)
  return (
    <main className="login">
      <aside className="intro" aria-label="About Overview Teams">
        <Brand />
        <div className="statement">
          <p className="statement-kicker">Innovation &amp; Excellence</p>
          <p className="statement-title">Forward-Thinking Solutions For <em>Tomorrow's Challenges.</em></p>
        </div>
        <div className="sculpture" aria-hidden="true" />
        <small>Overview Teams · Project management</small>
      </aside>
      <section className="workspace" aria-labelledby="login-title">
        <div className="login-content">
          <Brand />
          <h1 id="login-title">{title}</h1>
          <p className="welcome">{subtitle}</p>
          {children}
          {footer && <p className="account-nav">{footer}</p>}
        </div>
      </section>
    </main>
  )
}

// Runs a form action: shows "Please wait", and shows any thrown message as the form error.
function useFormAction(action) {
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    if (pending) return
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form))
    setError('')
    setPending(true)
    try {
      await action(values, form)
    } catch (err) {
      setError(err?.message || 'Something went wrong. Try again.')
    } finally {
      setPending(false)
    }
  }

  return { error, pending, onSubmit, clearError: () => setError('') }
}

function Form({ state, submitLabel, children }) {
  return (
    <form noValidate onSubmit={state.onSubmit} onChange={state.clearError} aria-describedby="form-error">
      {children}
      <p id="form-error" className="login-error" role="alert">{state.error}</p>
      <button className="submit" type="submit" disabled={state.pending}>
        {state.pending ? 'Please wait…' : submitLabel}
      </button>
    </form>
  )
}

function EmailField({ invalid }) {
  return (
    <>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" placeholder="you@example.com"
        autoComplete="username" aria-invalid={invalid} required />
    </>
  )
}

function NameField({ invalid }) {
  return (
    <>
      <label htmlFor="name">Name</label>
      <input id="name" name="name" type="text" placeholder="Your name"
        autoComplete="name" aria-invalid={invalid} required />
    </>
  )
}

function PasswordField({ id, label, placeholder, autoComplete, invalid, extra }) {
  const [visible, setVisible] = useState(false)
  return (
    <>
      <div className="password-label">
        <label htmlFor={id}>{label}</label>
        {extra}
      </div>
      <div className="password-input">
        <input id={id} name={id} type={visible ? 'text' : 'password'} placeholder={placeholder}
          autoComplete={autoComplete} aria-invalid={invalid} required />
        <button type="button" aria-controls={id} onClick={() => setVisible(!visible)}
          aria-label={(visible ? 'Hide ' : 'Show ') + label.toLowerCase()}>
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
    </>
  )
}

function checkEmail(form) {
  if (!form.elements.email.value.trim()) throw new Error('Enter your email address.')
  if (!form.elements.email.validity.valid) throw new Error('Enter a valid email address.')
}

function checkNewPassword({ password, confirm }) {
  if (password.length < 8) throw new Error('Use a password of at least 8 characters.')
  if (password !== confirm) throw new Error("The passwords don't match.")
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = useFormAction(async ({ email, password }, form) => {
    if (!email.trim() || !password) throw new Error('Enter your email and password.')
    checkEmail(form)
    await login(email.trim(), password)
    navigate(location.state?.from || '/dashboard', { replace: true })
  })

  return (
    <AuthLayout title="Log in to your workspace"
      subtitle="Welcome back. Pick up where your team left off."
      footer={<>New to Overview Teams? <Link to="/create-account">Create an account</Link></>}>
      <Form state={state} submitLabel="Log in">
        <EmailField invalid={!!state.error} />
        <PasswordField id="password" label="Password" placeholder="Enter your password"
          autoComplete="current-password" invalid={!!state.error}
          extra={<Link to="/forgot-password">Forgot password?</Link>} />
      </Form>
    </AuthLayout>
  )
}

export function CreateAccount() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const state = useFormAction(async (values, form) => {
    if (!values.name.trim()) throw new Error('Enter your name.')
    checkEmail(form)
    checkNewPassword(values)
    await register(values.name.trim(), values.email.trim(), values.password)
    navigate('/dashboard', { replace: true })
  })

  return (
    <AuthLayout title="Create your account"
      subtitle="Set up your login for Overview Teams."
      footer={<>Already have an account? <Link to="/">Log in</Link></>}>
      <Form state={state} submitLabel="Create account">
        <NameField invalid={!!state.error} />
        <EmailField invalid={!!state.error} />
        <PasswordField id="password" label="Password" placeholder="At least 8 characters"
          autoComplete="new-password" invalid={!!state.error} />
        <PasswordField id="confirm" label="Confirm password" placeholder="Type it again"
          autoComplete="new-password" invalid={!!state.error} />
      </Form>
    </AuthLayout>
  )
}

export function ForgotPassword() {
  const [sent, setSent] = useState('')
  const state = useFormAction(async ({ email }, form) => {
    checkEmail(form)
    setSent((await api('forgot-password', { email: email.trim() })).message)
  })

  return (
    <AuthLayout title="Reset your password"
      subtitle="Enter the email you log in with and we'll send you a link to choose a new password."
      footer={<>Remembered it? <Link to="/">Log in</Link></>}>
      {sent ? (
        <p className="notice" role="status">{sent}</p>
      ) : (
        <Form state={state} submitLabel="Send reset link">
          <EmailField invalid={!!state.error} />
        </Form>
      )}
    </AuthLayout>
  )
}

export function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [done, setDone] = useState('')
  const state = useFormAction(async values => {
    checkNewPassword(values)
    setDone((await api('reset-password', { token, password: values.password })).message)
  })

  let content
  if (done) {
    content = <p className="notice" role="status">{done}</p>
  } else if (!token) {
    content = (
      <p className="notice" role="status">
        This reset link is missing its code. <Link to="/forgot-password">Request a new link</Link>.
      </p>
    )
  } else {
    content = (
      <Form state={state} submitLabel="Change password">
        <PasswordField id="password" label="New password" placeholder="At least 8 characters"
          autoComplete="new-password" invalid={!!state.error} />
        <PasswordField id="confirm" label="Confirm password" placeholder="Type it again"
          autoComplete="new-password" invalid={!!state.error} />
      </Form>
    )
  }

  return (
    <AuthLayout title="Choose a new password"
      subtitle="Changing your password logs you out on every device."
      footer={<>Back to <Link to="/">Log in</Link></>}>
      {content}
    </AuthLayout>
  )
}
