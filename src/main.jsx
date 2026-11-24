import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth'
import Login, { CreateAccount, ForgotPassword, ResetPassword } from './pages/Login'
import Dashboard from './pages/Dashboard'
import './index.css'

function Loading() {
  return <div className="loading" role="status" aria-label="Loading" />
}

function RequireAuth({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  if (user === undefined) return <Loading />
  if (!user) return <Navigate to="/" replace state={{ from: location.pathname }} />
  return children
}

function GuestOnly({ children }) {
  const { user } = useAuth()
  if (user === undefined) return <Loading />
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="/create-account" element={<GuestOnly><CreateAccount /></GuestOnly>} />
        <Route path="/forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)
