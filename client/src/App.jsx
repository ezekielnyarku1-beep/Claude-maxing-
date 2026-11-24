import { Navigate, Route, Routes } from 'react-router'
import Shell from './components/Shell.jsx'
import IssuePage from './pages/IssuePage.jsx'
import MyIssuesPage from './pages/MyIssuesPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import ProjectPage from './pages/ProjectPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import TeamIssuesPage from './pages/TeamIssuesPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Navigate to="/my-issues" replace />} />
        <Route path="my-issues" element={<MyIssuesPage />} />
        <Route path="team/:teamKey" element={<TeamIssuesPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:projectId" element={<ProjectPage />} />
        <Route path="issue/:identifier" element={<IssuePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
