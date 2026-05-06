import { MdSearch, MdNotifications, MdHelpOutline } from 'react-icons/md'

export default function Header({ title }) {
  return (
    <header className="top-header">
      <div className="header-left"><h1 className="page-title">{title}</h1></div>
      <div className="header-right">
        <div className="search-bar">
          <MdSearch size={18} color="var(--muted)" />
          <input placeholder="Search signals, drugs, events..." />
        </div>
        <button className="icon-btn"><MdNotifications size={20} /><span className="notif-dot" /></button>
        <button className="icon-btn"><MdHelpOutline size={20} /></button>
      </div>
    </header>
  )
}
