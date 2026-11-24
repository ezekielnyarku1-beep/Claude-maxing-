import { Navigate, Route, Routes } from 'react-router'
import GuestOnly from './components/GuestOnly.jsx'
import RequireAdmin from './components/RequireAdmin.jsx'
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
import LabelsSettingsPage from './pages/settings/LabelsSettingsPage.jsx'
import SettingsLayout from './pages/settings/SettingsLayout.jsx'
import TeamsSettingsPage from './pages/settings/TeamsSettingsPage.jsx'
import UsersSettingsPage from './pages/settings/UsersSettingsPage.jsx'
import WorkspaceSettingsPage from './pages/settings/WorkspaceSettingsPage.jsx'

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
          <Route path="settings" element={<RequireAdmin />}>
            <Route element={<SettingsLayout />}>
              <Route index element={<Navigate to="workspace" replace />} />
              <Route path="workspace" element={<WorkspaceSettingsPage />} />
              <Route path="users" element={<UsersSettingsPage />} />
              <Route path="teams" element={<TeamsSettingsPage />} />
              <Route path="labels" element={<LabelsSettingsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
