import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Modal from './components/Modal'
import Dashboard from './pages/Dashboard'
import DataExplorer from './pages/DataExplorer'
import TrendAnalysis from './pages/TrendAnalysis'
import Alerts from './pages/Alerts'
import Reports from './pages/Reports'
import Notifications from './pages/Notifications'
import UserManagement from './pages/UserManagement'
import Projects from './pages/Projects'
import Settings from './pages/Settings'

const titles = {
  dashboard: 'Actionable Insights Dashboard',
  'data-explorer': 'Data Explorer',
  'trend-analysis': 'Trend Analysis',
  alerts: 'Alerts Management',
  reports: 'Reports',
  notifications: 'Notifications',
  'user-management': 'User Management',
  projects: 'Projects',
  settings: 'Settings',
}

const pages = {
  dashboard: Dashboard,
  'data-explorer': DataExplorer,
  'trend-analysis': TrendAnalysis,
  alerts: Alerts,
  reports: Reports,
  notifications: Notifications,
  'user-management': UserManagement,
  projects: Projects,
  settings: Settings,
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [modal, setModal] = useState(null)

  const PageComponent = pages[page]

  return (
    <>
      <Sidebar activePage={page} onNavigate={setPage} />
      <main className="main-content">
        <Header title={titles[page]} />
        <div className="page-content" key={page}>
          <div className="fade-in">
            <PageComponent openModal={setModal} />
          </div>
        </div>
      </main>
      {modal && <Modal {...modal} onClose={() => setModal(null)} />}
    </>
  )
}
