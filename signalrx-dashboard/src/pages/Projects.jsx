export default function Projects({ openModal }) {
  const projects = [
    { name: 'Diabetes Monitoring', status: 'Active', statusC: 'success', progress: 72, keywords: 42, sources: 'Reddit, X', team: 'RK,PS,AM', due: 'Ongoing' },
    { name: 'Vaccine Sentiment Analysis', status: 'Active', statusC: 'success', progress: 45, keywords: 28, sources: 'Reddit, X, News', team: 'PS,VP', due: 'Jun 30, 2025' },
    { name: 'Cardio Drug Safety', status: 'Active', statusC: 'success', progress: 30, keywords: 31, sources: 'Reddit', team: 'RK,AM', due: 'Jul 15, 2025' },
    { name: 'OTC Pain Relief', status: 'On Hold', statusC: 'warning', progress: 60, keywords: 18, sources: 'X (Twitter)', team: 'AM,SR', due: 'Paused' },
    { name: 'Annual Drug Review 2024', status: 'Completed', statusC: 'info', progress: 100, keywords: 52, sources: 'All', team: 'VP,AG', due: 'Completed' },
    { name: 'Mental Health Drugs', status: 'Active', statusC: 'success', progress: 15, keywords: 14, sources: 'Reddit, X', team: 'RK,PS', due: 'Aug 01, 2025' },
  ]
  return (
    <>
      <div className="filter-bar">
        <select className="filter-select"><option>All Status</option><option>Active</option><option>Completed</option><option>On Hold</option></select>
        <button className="btn btn-primary btn-sm" onClick={() => openModal({
          title: 'New Project',
          children: <>
            <div className="form-group"><label className="form-label">Project Name</label><input className="form-input" placeholder="Enter project name" /></div>
            <div className="form-group"><label className="form-label">Sources</label><select className="form-input" multiple><option>Reddit</option><option>X (Twitter)</option><option>News</option></select></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows={3}></textarea></div>
          </>,
          footer: <><button className="btn btn-ghost" onClick={() => openModal(null)}>Cancel</button><button className="btn btn-primary" onClick={() => openModal(null)}>Create Project</button></>
        })}>New Project</button>
      </div>
      <div className="grid-3">
        {projects.map(p => (
          <div className="card" key={p.name} style={{ cursor: 'pointer' }}>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600 }}>{p.name}</h3>
                <span className={`badge badge-${p.statusC}`}>{p.status}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>Sources: {p.sources}</div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}><span>Progress</span><span>{p.progress}%</span></div>
                <div className="progress"><div className="progress-fill" style={{ width: `${p.progress}%`, background: p.progress === 100 ? 'var(--success)' : 'var(--blue)' }} /></div>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>
                <span><strong>{p.keywords}</strong> keywords</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex' }}>
                  {p.team.split(',').map((t, i) => (
                    <div key={t} style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, border: '2px solid #fff', marginLeft: i > 0 ? -8 : 0 }}>{t}</div>
                  ))}
                </div>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{p.due}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
