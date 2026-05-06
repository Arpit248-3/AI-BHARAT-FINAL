import { useState } from 'react'
import { MdArrowUpward, MdArrowDownward } from 'react-icons/md'

const alertRows = [
  { id: 'ALT-401', desc: 'PRR threshold exceeded for Angioedema', drug: 'Lisinopril', sev: 'Critical', stat: 'Active', time: '2h ago' },
  { id: 'ALT-400', desc: 'Unusual post volume spike detected', drug: 'Metformin', sev: 'High', stat: 'Active', time: '4h ago' },
  { id: 'ALT-399', desc: 'New signal: Hepatotoxicity cluster', drug: 'Atorvastatin', sev: 'Critical', stat: 'Acknowledged', time: '6h ago' },
  { id: 'ALT-398', desc: 'Negative sentiment spike on Reddit', drug: 'Insulin', sev: 'Medium', stat: 'Acknowledged', time: '12h ago' },
  { id: 'ALT-397', desc: 'Periodic safety report overdue', drug: 'Omeprazole', sev: 'High', stat: 'Active', time: '1d ago' },
  { id: 'ALT-396', desc: 'Duplicate case detected', drug: 'Amoxicillin', sev: 'Low', stat: 'Resolved', time: '2d ago' },
]

export default function Alerts({ openModal }) {
  return (
    <>
      <div className="filter-bar">
        <select className="filter-select"><option>All Severities</option><option>Critical</option><option>High</option><option>Medium</option></select>
        <select className="filter-select"><option>All Status</option><option>Active</option><option>Acknowledged</option><option>Resolved</option></select>
        <button className="btn btn-primary btn-sm" onClick={() => openModal({
          title: 'Create Alert Rule',
          children: <>
            <div className="form-group"><label className="form-label">Alert Name</label><input className="form-input" placeholder="Enter alert name" /></div>
            <div className="form-group"><label className="form-label">Condition</label><select className="form-input"><option>PRR Score exceeds threshold</option><option>Sentiment spike detected</option><option>Post volume spike</option></select></div>
            <div className="form-group"><label className="form-label">Threshold</label><input className="form-input" type="number" placeholder="e.g. 3.0" /></div>
            <div className="form-group"><label className="form-label">Severity</label><select className="form-input"><option>Critical</option><option>High</option><option>Medium</option></select></div>
          </>,
          footer: <><button className="btn btn-ghost" onClick={() => openModal(null)}>Cancel</button><button className="btn btn-primary" onClick={() => openModal(null)}>Create Rule</button></>
        })}>Create Alert Rule</button>
      </div>

      <div className="kpi-grid">
        {[
          { label: 'Active Alerts', value: '12', change: '+3', dir: 'up' },
          { label: 'Critical', value: '4', change: '+1', dir: 'up' },
          { label: 'Acknowledged', value: '8', change: '-2', dir: 'down' },
          { label: 'Avg Response Time', value: '1.4h', change: '-18%', dir: 'down' },
        ].map(k => (
          <div className="kpi-card" key={k.label}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
            <span className={`kpi-change ${k.label === 'Avg Response Time' ? 'up' : k.dir === 'up' ? 'down' : 'up'}`}>
              {k.dir === 'up' ? <MdArrowUpward size={14} /> : <MdArrowDownward size={14} />}{k.change}
            </span>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Active Alerts</span></div>
        <div className="card-body" style={{ padding: 0 }}>
          <table>
            <thead><tr><th>Alert ID</th><th>Description</th><th>Drug/Keyword</th><th>Severity</th><th>Status</th><th>Triggered</th><th>Actions</th></tr></thead>
            <tbody>
              {alertRows.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.id}</strong></td><td>{r.desc}</td><td>{r.drug}</td>
                  <td><span className={`badge badge-${r.sev === 'Critical' ? 'danger' : r.sev === 'High' ? 'warning' : r.sev === 'Medium' ? 'info' : 'neutral'}`}>{r.sev}</span></td>
                  <td><span className={`badge badge-${r.stat === 'Active' ? 'danger' : r.stat === 'Acknowledged' ? 'warning' : 'success'}`}>{r.stat}</span></td>
                  <td>{r.time}</td>
                  <td><button className="btn btn-ghost btn-sm">✓</button><button className="btn btn-ghost btn-sm">👁</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
