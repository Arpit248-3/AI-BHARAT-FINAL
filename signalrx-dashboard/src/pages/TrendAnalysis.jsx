import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { MdArrowUpward, MdArrowDownward } from 'react-icons/md'

const trendData = [
  { month: 'Jan', signals: 22, confirmed: 15, dismissed: 5 },
  { month: 'Feb', signals: 28, confirmed: 18, dismissed: 7 },
  { month: 'Mar', signals: 35, confirmed: 25, dismissed: 6 },
  { month: 'Apr', signals: 30, confirmed: 20, dismissed: 8 },
  { month: 'May', signals: 42, confirmed: 32, dismissed: 6 },
  { month: 'Jun', signals: 47, confirmed: 38, dismissed: 5 },
]

const drugs = [
  { name: 'Insulin', count: 42, pct: 85 },
  { name: 'Metformin', count: 38, pct: 76 },
  { name: 'Nausea-related', count: 31, pct: 62 },
  { name: 'Dizziness-related', count: 28, pct: 56 },
  { name: 'Headache-related', count: 24, pct: 48 },
]

export default function TrendAnalysis() {
  return (
    <>
      <div className="filter-bar">
        <select className="filter-select"><option>All Therapeutic Areas</option><option>Diabetes</option><option>Cardiology</option></select>
        <select className="filter-select"><option>Monthly</option><option>Weekly</option><option>Quarterly</option></select>
        <select className="filter-select"><option>2025</option><option>2024</option></select>
        <button className="btn btn-primary btn-sm">Generate Report</button>
      </div>

      <div className="kpi-grid">
        {[
          { label: 'Emerging Signals', value: '47', change: '+18.2%', dir: 'up' },
          { label: 'Avg Detection Time', value: '2.3 days', change: '-15.4%', dir: 'down' },
          { label: 'Confirmed Signals', value: '156', change: '+7.8%', dir: 'up' },
          { label: 'False Positive Rate', value: '8.4%', change: '-2.1%', dir: 'down' },
        ].map(k => (
          <div className="kpi-card" key={k.label}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
            <span className={`kpi-change ${k.dir === 'down' ? 'up' : 'up'}`}>
              {k.dir === 'up' ? <MdArrowUpward size={14} /> : <MdArrowDownward size={14} />}{k.change}
            </span>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Signal Detection Trend</span></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorSignals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007BFF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#007BFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="signals" stroke="#007BFF" fill="url(#colorSignals)" strokeWidth={2} />
                <Line type="monotone" dataKey="confirmed" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="dismissed" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Top Keywords by Signal Count</span></div>
          <div className="card-body">
            {drugs.map(d => (
              <div key={d.name} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  <span>{d.name}</span><span>{d.count} signals</span>
                </div>
                <div className="progress"><div className="progress-fill" style={{ width: `${d.pct}%`, background: 'var(--blue)' }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Monthly Detection Summary</span></div>
        <div className="card-body" style={{ padding: 0 }}>
          <table>
            <thead><tr><th>Month</th><th>New Signals</th><th>Confirmed</th><th>Dismissed</th><th>Under Review</th><th>Detection Rate</th></tr></thead>
            <tbody>
              {[
                { m: 'June 2025', n: 47, c: 38, d: 5, u: 4, r: '94.2%' },
                { m: 'May 2025', n: 42, c: 32, d: 6, u: 4, r: '92.8%' },
                { m: 'April 2025', n: 30, c: 20, d: 8, u: 2, r: '91.5%' },
                { m: 'March 2025', n: 35, c: 25, d: 6, u: 4, r: '90.1%' },
                { m: 'February 2025', n: 28, c: 18, d: 7, u: 3, r: '89.3%' },
              ].map(r => (
                <tr key={r.m}><td><strong>{r.m}</strong></td><td>{r.n}</td>
                  <td><span className="badge badge-success">{r.c}</span></td>
                  <td><span className="badge badge-neutral">{r.d}</span></td>
                  <td><span className="badge badge-warning">{r.u}</span></td>
                  <td><strong>{r.r}</strong></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
