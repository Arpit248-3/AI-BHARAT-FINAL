import { useState } from 'react'
import { MdWarning, MdShowChart, MdAssignmentTurnedIn, MdGroupAdd, MdUpdate, MdCheckCircle, MdSchedule, MdBackup } from 'react-icons/md'

const items = [
  { icon: MdWarning, iconBg: 'var(--danger-bg)', iconC: 'var(--danger)', title: 'Critical Signal Detected', desc: 'New critical signal SIG-2847 for Lisinopril — Angioedema detected via Reddit mentions.', time: '2 hours ago', unread: true },
  { icon: MdShowChart, iconBg: 'var(--warn-bg)', iconC: 'var(--warn)', title: 'Sentiment Spike Alert', desc: 'Negative sentiment for "Metformin" increased 45% in the last 24 hours on Reddit.', time: '4 hours ago', unread: true },
  { icon: MdAssignmentTurnedIn, iconBg: 'var(--success-bg)', iconC: 'var(--success)', title: 'Report Approved', desc: 'RPT-112 Q2 2025 Sentiment Analysis has been approved by Dr. Priya S.', time: '6 hours ago', unread: true },
  { icon: MdGroupAdd, iconBg: 'var(--info-bg)', iconC: 'var(--info)', title: 'New Team Member', desc: 'Dr. Anita M. has joined the Pharmacovigilance team as a Safety Analyst.', time: '1 day ago', unread: true },
  { icon: MdUpdate, iconBg: 'var(--info-bg)', iconC: 'var(--info)', title: 'System Update', desc: 'SignalRx AI v3.2.1 deployed. New: Enhanced social listening, batch processing.', time: '1 day ago', unread: true },
  { icon: MdCheckCircle, iconBg: 'var(--success-bg)', iconC: 'var(--success)', title: 'Signal Resolved', desc: 'SIG-2844 Omeprazole — Hypomagnesemia has been resolved after review.', time: '2 days ago', unread: false },
  { icon: MdSchedule, iconBg: 'var(--warn-bg)', iconC: 'var(--warn)', title: 'Report Deadline', desc: 'Social Listening Summary (RPT-109) is due in 28 days. Status: Draft.', time: '3 days ago', unread: false },
  { icon: MdBackup, iconBg: 'var(--info-bg)', iconC: 'var(--info)', title: 'Data Import Complete', desc: 'Batch import of 12,470 social media posts completed. 34 duplicates found.', time: '4 days ago', unread: false },
]

export default function Notifications() {
  const [tab, setTab] = useState('All')
  const tabs = ['All', 'Unread (5)', 'System', 'Signals']
  return (
    <>
      <div className="filter-bar" style={{ justifyContent: 'space-between' }}>
        <div className="tabs" style={{ border: 'none', margin: 0 }}>
          {tabs.map(t => <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</div>)}
        </div>
        <button className="btn btn-ghost btn-sm">Mark All Read</button>
      </div>
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {items.map((n, i) => (
            <div key={i} className={`notif-item ${n.unread ? 'unread' : ''}`}>
              <div className="notif-icon" style={{ background: n.iconBg, color: n.iconC }}><n.icon size={18} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{n.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.4 }}>{n.desc}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{n.time}</div>
              </div>
              {n.unread && <div style={{ width: 8, height: 8, background: 'var(--blue)', borderRadius: '50%', flexShrink: 0, marginTop: 4 }} />}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
