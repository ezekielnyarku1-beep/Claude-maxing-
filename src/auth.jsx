import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // undefined while we ask the server, then a user object or null.
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    api('me').then(data => setUser(data.user), () => setUser(null))
  }, [])

  const value = useMemo(() => ({
    user,
    async login(email, password) {
      setUser((await api('login', { email, password })).user)
    },
    async register(name, email, password) {
      setUser((await api('register', { name, email, password })).user)
    },
    async logout() {
      await api('logout', {})
      setUser(null)
    },
  }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
