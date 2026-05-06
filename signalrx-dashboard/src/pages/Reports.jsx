export default function Reports({ openModal }) {
  const reports = [
    { id: 'RPT-112', title: 'Q2 2025 Sentiment Analysis - Diabetes', type: 'PSUR', status: 'Submitted', statC: 'success', due: '2025-06-30', author: 'Dr. Rajesh K.' },
    { id: 'RPT-111', title: 'Monthly Keyword Trend Report', type: 'Analytics', status: 'Approved', statC: 'info', due: '2025-06-15', author: 'Dr. Priya S.' },
    { id: 'RPT-110', title: 'Hepatotoxicity Signal Report', type: 'Ad-hoc', status: 'Under Review', statC: 'warning', due: '2025-06-10', author: 'Dr. Rajesh K.' },
    { id: 'RPT-109', title: 'Social Listening Summary', type: 'Report', status: 'Draft', statC: 'neutral', due: '2025-07-01', author: 'Dr. Anita M.' },
    { id: 'RPT-108', title: 'Q1 2025 Platform Coverage Report', type: 'PSUR', status: 'Submitted', statC: 'success', due: '2025-04-30', author: 'Dr. Vikram P.' },
  ]
  return (
    <>
      <div className="filter-bar">
        <select className="filter-select"><option>All Types</option><option>PSUR</option><option>Analytics</option><option>Ad-hoc</option></select>
        <select className="filter-select"><option>All Status</option><option>Draft</option><option>Under Review</option><option>Approved</option><option>Submitted</option></select>
        <button className="btn btn-primary btn-sm" onClick={() => openModal({
          title: 'Generate Report',
          children: <>
            <div className="form-group"><label className="form-label">Report Type</label><select className="form-input"><option>Sentiment Analysis</option><option>Keyword Trends</option><option>Signal Summary</option></select></div>
            <div className="form-group"><label className="form-label">Project</label><select className="form-input"><option>Diabetes Monitoring</option><option>Cardio Safety</option></select></div>
            <div className="form-group"><label className="form-label">Period</label><div style={{ display: 'flex', gap: 8 }}><input className="form-input" type="date" /><input className="form-input" type="date" /></div></div>
            <div className="form-group"><label className="form-label">Notes</label><textarea className="form-input" rows={3}></textarea></div>
          </>,
          footer: <><button className="btn btn-ghost" onClick={() => openModal(null)}>Cancel</button><button className="btn btn-primary" onClick={() => openModal(null)}>Generate</button></>
        })}>Generate Report</button>
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">Reports</span><span style={{ fontSize: 13, color: 'var(--text2)' }}>24 reports</span></div>
        <div className="card-body" style={{ padding: 0 }}>
          <table>
            <thead><tr><th>ID</th><th>Title</th><th>Type</th><th>Status</th><th>Due</th><th>Author</th><th>Actions</th></tr></thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id}><td><strong>{r.id}</strong></td><td>{r.title}</td><td><span className="badge badge-neutral">{r.type}</span></td>
                  <td><span className={`badge badge-${r.statC}`}>{r.status}</span></td><td>{r.due}</td><td>{r.author}</td>
                  <td><button className="btn btn-ghost btn-sm">⬇</button><button className="btn btn-ghost btn-sm">✏</button><button className="btn btn-ghost btn-sm">👁</button></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
