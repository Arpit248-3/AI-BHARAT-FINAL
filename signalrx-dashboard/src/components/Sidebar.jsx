import { MdBiotech, MdDashboard, MdManageSearch, MdTrendingUp, MdNotificationsActive, MdAssessment, MdMarkEmailUnread, MdGroup, MdFolderOpen, MdSettings, MdMoreVert } from 'react-icons/md'

const navSections = [
  { label: 'MAIN', items: [
    { id: 'dashboard', icon: MdDashboard, label: 'Overview' },
    { id: 'data-explorer', icon: MdManageSearch, label: 'Data Explorer' },
    { id: 'trend-analysis', icon: MdTrendingUp, label: 'Trend Analysis' },
  ]},
  { label: 'MANAGEMENT', items: [
    { id: 'alerts', icon: MdNotificationsActive, label: 'Alerts', badge: 12 },
    { id: 'reports', icon: MdAssessment, label: 'Reports' },
    { id: 'notifications', icon: MdMarkEmailUnread, label: 'Notifications', badge: 5 },
  ]},
  { label: 'ADMINISTRATION', items: [
    { id: 'user-management', icon: MdGroup, label: 'User Management' },
    { id: 'projects', icon: MdFolderOpen, label: 'Projects' },
    { id: 'settings', icon: MdSettings, label: 'Settings' },
  ]},
]

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon"><MdBiotech /></div>
          <div className="logo-text">
            <span className="logo-title">SignalRx</span>
            <span className="logo-subtitle">AI Intelligence</span>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navSections.map(section => (
          <div className="nav-section" key={section.label}>
            <span className="nav-section-label">{section.label}</span>
            {section.items.map(item => (
              <div key={item.id} className={`nav-item ${activePage === item.id ? 'active' : ''}`} onClick={() => onNavigate(item.id)}>
                <item.icon size={20} />
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </div>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">DR</div>
          <div className="user-info">
            <span className="user-name">Dr. Rajesh K.</span>
            <span className="user-role">Safety Officer</span>
          </div>
          <MdMoreVert style={{ color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontSize: 18 }} />
        </div>
      </div>
    </aside>
  )
}
