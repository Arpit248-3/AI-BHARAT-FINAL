import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const users = [
  { name: 'Dr. Rajesh Kumar', init: 'RK', email: 'rajesh.k@signalrx.ai', role: 'Admin', dept: 'Pharmacovigilance', stat: 'Active', last: 'Just now' },
  { name: 'Dr. Priya Sharma', init: 'PS', email: 'priya.s@signalrx.ai', role: 'Safety Officer', dept: 'Drug Safety', stat: 'Active', last: '5 min ago' },
  { name: 'Dr. Anita Menon', init: 'AM', email: 'anita.m@signalrx.ai', role: 'Analyst', dept: 'Social Listening', stat: 'Active', last: '1 hour ago' },
  { name: 'Dr. Vikram Patel', init: 'VP', email: 'vikram.p@signalrx.ai', role: 'Reviewer', dept: 'Regulatory', stat: 'Active', last: '3 hours ago' },
  { name: 'Dr. Sunita Rao', init: 'SR', email: 'sunita.r@signalrx.ai', role: 'Safety Officer', dept: 'Drug Safety', stat: 'Inactive', last: '5 days ago' },
  { name: 'Dr. Amit Gupta', init: 'AG', email: 'amit.g@signalrx.ai', role: 'Analyst', dept: 'Epidemiology', stat: 'Active', last: '1 day ago' },
]

const roleData = [
  { name: 'Admin', value: 2, color: '#007BFF' },
  { name: 'Safety Officer', value: 3, color: '#10B981' },
  { name: 'Analyst', value: 4, color: '#F59E0B' },
  { name: 'Reviewer', value: 3, color: '#8B5CF6' },
]

export default function UserManagement({ openModal }) {
  return (
    <>
      <div className="filter-bar">
        <select className="filter-select"><option>All Roles</option><option>Admin</option><option>Safety Officer</option><option>Analyst</option></select>
        <select className="filter-select"><option>All Status</option><option>Active</option><option>Inactive</option></select>
        <input className="form-input" style={{ maxWidth: 220, padding: '8px 12px', fontSize: 13 }} placeholder="Search users..." />
        <button className="btn btn-primary btn-sm" onClick={() => openModal({
          title: 'Add New User',
          children: <>
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" placeholder="Enter full name" /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="user@signalrx.ai" /></div>
            <div className="form-group"><label className="form-label">Role</label><select className="form-input"><option>Analyst</option><option>Safety Officer</option><option>Admin</option></select></div>
            <div className="form-group"><label className="form-label">Department</label><input className="form-input" placeholder="e.g. Pharmacovigilance" /></div>
          </>,
          footer: <><button className="btn btn-ghost" onClick={() => openModal(null)}>Cancel</button><button className="btn btn-primary" onClick={() => openModal(null)}>Add User</button></>
        })}>Add User</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: 24 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Team Members</span><span style={{ fontSize: 13, color: 'var(--text2)' }}>12 users</span></div>
          <div className="card-body" style={{ padding: 0 }}>
            <table>
              <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Dept</th><th>Status</th><th>Last Active</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.init}>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{u.init}</div>
                      <strong>{u.name}</strong></div></td>
                    <td>{u.email}</td><td><span className="badge badge-info">{u.role}</span></td><td>{u.dept}</td>
                    <td><span className={`badge badge-${u.stat === 'Active' ? 'success' : 'neutral'}`}>{u.stat}</span></td><td>{u.last}</td>
                    <td><button className="btn btn-ghost btn-sm">✏</button><button className="btn btn-ghost btn-sm">🗑</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Role Distribution</span></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" stroke="none">
                  {roleData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 8 }}>
              {roleData.map(r => <span key={r.name} style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, display: 'inline-block' }} />{r.name}
              </span>)}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
