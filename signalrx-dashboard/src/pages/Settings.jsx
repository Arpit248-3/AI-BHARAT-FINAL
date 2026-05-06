import { useState } from 'react'

const Toggle = ({ defaultChecked }) => (
  <label className="toggle"><input type="checkbox" defaultChecked={defaultChecked} /><span className="toggle-slider" /></label>
)

export default function Settings() {
  const [tab, setTab] = useState('general')
  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'ai', label: 'AI Configuration' },
    { id: 'security', label: 'Security' },
  ]

  return (
    <>
      <div className="tabs">
        {tabs.map(t => <div key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</div>)}
      </div>

      {tab === 'general' && <div className="card"><div className="card-body">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>Organization Profile</h3>
        <div className="form-group"><label className="form-label">Organization Name</label><input className="form-input" defaultValue="SignalRx Pharma Ltd." /></div>
        <div className="form-group"><label className="form-label">Contact Email</label><input className="form-input" defaultValue="admin@signalrx.ai" /></div>
        <div className="form-group"><label className="form-label">Timezone</label><select className="form-input"><option>Asia/Kolkata (UTC+5:30)</option><option>America/New_York</option></select></div>

        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '24px 0 16px', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>Display Preferences</h3>
        <div className="settings-row"><div><div style={{ fontSize: 14, fontWeight: 500 }}>Dark Mode</div><div style={{ fontSize: 12, color: 'var(--text2)' }}>Enable dark theme</div></div><Toggle /></div>
        <div className="settings-row"><div><div style={{ fontSize: 14, fontWeight: 500 }}>Compact Tables</div><div style={{ fontSize: 12, color: 'var(--text2)' }}>Reduce row padding</div></div><Toggle defaultChecked /></div>
        <div className="settings-row"><div><div style={{ fontSize: 14, fontWeight: 500 }}>Show KPI Trends</div><div style={{ fontSize: 12, color: 'var(--text2)' }}>Display trend arrows</div></div><Toggle defaultChecked /></div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}><button className="btn btn-ghost">Reset</button><button className="btn btn-primary">Save Changes</button></div>
      </div></div>}

      {tab === 'notifications' && <div className="card"><div className="card-body">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>Email Notifications</h3>
        <div className="settings-row"><div><div style={{ fontSize: 14, fontWeight: 500 }}>Critical Alerts</div><div style={{ fontSize: 12, color: 'var(--text2)' }}>Immediate email for critical signals</div></div><Toggle defaultChecked /></div>
        <div className="settings-row"><div><div style={{ fontSize: 14, fontWeight: 500 }}>Daily Digest</div><div style={{ fontSize: 12, color: 'var(--text2)' }}>Summary of daily activity</div></div><Toggle defaultChecked /></div>
        <div className="settings-row"><div><div style={{ fontSize: 14, fontWeight: 500 }}>Report Reminders</div><div style={{ fontSize: 12, color: 'var(--text2)' }}>Notify before deadlines</div></div><Toggle defaultChecked /></div>
        <div className="settings-row"><div><div style={{ fontSize: 14, fontWeight: 500 }}>Sentiment Spike Alerts</div><div style={{ fontSize: 12, color: 'var(--text2)' }}>Alert on unusual sentiment changes</div></div><Toggle defaultChecked /></div>
        <div className="settings-row"><div><div style={{ fontSize: 14, fontWeight: 500 }}>Weekly Summary</div><div style={{ fontSize: 12, color: 'var(--text2)' }}>Weekly pharmacovigilance summary</div></div><Toggle /></div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}><button className="btn btn-primary">Save</button></div>
      </div></div>}

      {tab === 'ai' && <div className="card"><div className="card-body">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>AI Model Settings</h3>
        <div className="form-group"><label className="form-label">Detection Sensitivity</label><select className="form-input"><option>High</option><option>Medium (Balanced)</option><option>Low</option></select></div>
        <div className="form-group"><label className="form-label">PRR Threshold</label><input className="form-input" type="number" defaultValue="2.0" step="0.1" /></div>
        <div className="form-group"><label className="form-label">Min Case Count</label><input className="form-input" type="number" defaultValue="3" /></div>
        <div className="settings-row"><div><div style={{ fontSize: 14, fontWeight: 500 }}>Auto-Signal Detection</div><div style={{ fontSize: 12, color: 'var(--text2)' }}>Automatically flag new signals</div></div><Toggle defaultChecked /></div>
        <div className="settings-row"><div><div style={{ fontSize: 14, fontWeight: 500 }}>Sentiment Analysis</div><div style={{ fontSize: 12, color: 'var(--text2)' }}>AI-powered sentiment classification</div></div><Toggle defaultChecked /></div>
        <div className="settings-row"><div><div style={{ fontSize: 14, fontWeight: 500 }}>Duplicate Detection</div><div style={{ fontSize: 12, color: 'var(--text2)' }}>AI-powered duplicate post detection</div></div><Toggle defaultChecked /></div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}><button className="btn btn-primary">Save</button></div>
      </div></div>}

      {tab === 'security' && <div className="card"><div className="card-body">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>Security Settings</h3>
        <div className="settings-row"><div><div style={{ fontSize: 14, fontWeight: 500 }}>Two-Factor Auth</div><div style={{ fontSize: 12, color: 'var(--text2)' }}>Require 2FA for all users</div></div><Toggle defaultChecked /></div>
        <div className="settings-row"><div><div style={{ fontSize: 14, fontWeight: 500 }}>Session Timeout</div><div style={{ fontSize: 12, color: 'var(--text2)' }}>Auto-logout after inactivity</div></div><select className="filter-select"><option>30 minutes</option><option>1 hour</option><option>4 hours</option></select></div>
        <div className="settings-row"><div><div style={{ fontSize: 14, fontWeight: 500 }}>Audit Logging</div><div style={{ fontSize: 12, color: 'var(--text2)' }}>Log all user actions</div></div><Toggle defaultChecked /></div>
        <div className="settings-row"><div><div style={{ fontSize: 14, fontWeight: 500 }}>IP Whitelisting</div><div style={{ fontSize: 12, color: 'var(--text2)' }}>Restrict access by IP</div></div><Toggle /></div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}><button className="btn btn-primary">Save</button></div>
      </div></div>}
    </>
  )
}
