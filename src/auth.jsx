import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // undefined while we ask the server, then a user object or null.
  const [user, setUser] = useState(undefined)
  const [sessionError, setSessionError] = useState('')
  const [sessionAttempt, setSessionAttempt] = useState(0)

  useEffect(() => {
    let active = true
    setSessionError('')
    api('me').then(
      data => {
        if (active) setUser(data.user)
      },
      error => {
        if (active) {
          setUser(null)
          setSessionError(error.message || "Can't restore your session right now.")
        }
      },
    )
    return () => {
      active = false
    }
  }, [sessionAttempt])

  const value = useMemo(() => ({
    user,
    sessionError,
    retrySession() {
      setUser(undefined)
      setSessionError('')
      setSessionAttempt(attempt => attempt + 1)
    },
    async login(email, password) {
      const { user: signedInUser } = await api('login', { email, password })
      setSessionError('')
      setUser(signedInUser)
    },
    async register(name, email, password) {
      const { user: registeredUser } = await api('register', { name, email, password })
      setSessionError('')
      setUser(registeredUser)
    },
    async logout() {
      await api('logout', {})
      setUser(null)
    },
  }), [user, sessionError])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
