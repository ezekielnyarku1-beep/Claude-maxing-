import { Navigate, Route, Routes } from 'react-router'
import GuestOnly from './components/GuestOnly.jsx'
import RequireSession from './components/RequireSession.jsx'
import Shell from './components/Shell.jsx'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx'
import LoginPage from './pages/auth/LoginPage.jsx'
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx'
import SignUpPage from './pages/auth/SignUpPage.jsx'
import IssuePage from './pages/IssuePage.jsx'
import MyIssuesPage from './pages/MyIssuesPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import ProjectPage from './pages/ProjectPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import TeamIssuesPage from './pages/TeamIssuesPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
      </Route>
      <Route path="reset-password" element={<ResetPasswordPage />} />
      <Route element={<RequireSession />}>
        <Route element={<Shell />}>
          <Route index element={<Navigate to="/my-issues" replace />} />
          <Route path="my-issues" element={<MyIssuesPage />} />
          <Route path="team/:teamKey" element={<TeamIssuesPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:projectId" element={<ProjectPage />} />
          <Route path="issue/:identifier" element={<IssuePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
