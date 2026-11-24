import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { Brand, ThemeSwitch, usePageTitle } from '../components'
import './Login.css'

export default function Dashboard() {
  usePageTitle('Dashboard')
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleLogout() {
    setError('')
    setPending(true)
    try {
      await logout()
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
      setPending(false)
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-bar">
        <Brand />
        <div className="dashboard-actions">
          <ThemeSwitch />
          <button className="secondary" type="button" onClick={handleLogout} disabled={pending}>
            {pending ? 'Logging out…' : 'Log out'}
          </button>
        </div>
      </header>
      <main className="dashboard-main">
        <h1>Welcome back</h1>
        <p className="welcome">You're logged in as <strong>{user.email}</strong>.</p>
        <p className="login-error" role="alert">{error}</p>
        <section className="notice">
          <h2>Your workspace</h2>
          <p>Your team's projects will show up here.</p>
        </section>
      </main>
    </div>
  )
}
