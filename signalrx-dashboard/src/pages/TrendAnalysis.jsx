import { useState, useEffect } from 'react'
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { MdArrowUpward, MdArrowDownward, MdRefresh, MdDownload } from 'react-icons/md'

const API_BASE = 'http://localhost:8080'

export default function TrendAnalysis({ openModal }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/dashboard-stats`)
      const data = await res.json()
      if (data.status === 'success') setStats(data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
    setLoading(false)
  }

  useEffect(() => { fetchStats() }, [])

  const totalRecords = stats?.total_records || 0
  const sevCounts = stats?.severity_counts || {}
  const causalityCounts = stats?.causality_counts || {}
  const topDrugs = stats?.top_drugs || []
  const topEvents = stats?.top_events || []

  // Build trend chart from causality counts
  const causalityChartData = Object.entries(causalityCounts).filter(([,v]) => v > 0).map(([name, value]) => ({ name, signals: value }))

  // Severity bar chart data
  const SEV_COLORS = { Critical: '#EF4444', High: '#F59E0B', Medium: '#3B82F6', Low: '#10B981' }
  const severityChartData = Object.entries(sevCounts).filter(([,v]) => v > 0).map(([k, v]) => ({ name: k, count: v }))

  // KPIs
  const criticalCount = sevCounts.Critical || 0
  const highCount = sevCounts.High || 0
  const confirmedCount = (causalityCounts.Certain || 0) + (causalityCounts.Probable || 0)
  const totalSignals = totalRecords

  // ── Generate Report (downloads a summary text file) ──────────
  const handleGenerateReport = () => {
    openModal({
      title: 'Generate Trend Analysis Report',
      children: <GenerateReportForm stats={stats} sevCounts={sevCounts} causalityCounts={causalityCounts} topDrugs={topDrugs} topEvents={topEvents} />,
      footer: <>
        <button className="btn btn-ghost" onClick={() => openModal(null)}>Cancel</button>
        <button className="btn btn-primary" onClick={() => {
          downloadReport(stats, sevCounts, causalityCounts, topDrugs, topEvents)
          openModal(null)
        }}>
          <MdDownload size={15} style={{ marginRight: 4 }} />
          Download Report
        </button>
      </>
    })
  }

  return (
    <>
      <div className="filter-bar">
        <select className="filter-select"><option>All Therapeutic Areas</option><option>Diabetes</option><option>Cardiology</option></select>
        <select className="filter-select"><option>All Time</option><option>Monthly</option><option>Weekly</option></select>
        <button className="btn btn-ghost btn-sm" onClick={fetchStats} disabled={loading}>
          <MdRefresh size={16} className={loading ? 'spin' : ''} /> Refresh
        </button>
        <button className="btn btn-primary btn-sm" onClick={handleGenerateReport} disabled={loading || generating}>
          <MdDownload size={15} style={{ marginRight: 4 }} />
          {generating ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      <div className="kpi-grid">
        {[
          { label: 'Total Signals', value: String(totalSignals), change: 'From Intelligence Vault', dir: 'up' },
          { label: 'Critical + High', value: String(criticalCount + highCount), change: 'Require attention', dir: 'up' },
          { label: 'Confirmed (Certain/Probable)', value: String(confirmedCount), change: 'WHO-UMC validated', dir: 'up' },
          { label: 'Unique Drugs Tracked', value: String(topDrugs.length), change: 'Active monitoring', dir: 'up' },
        ].map(k => (
          <div className="kpi-card" key={k.label}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{loading ? '...' : k.value}</div>
            <span className={`kpi-change up`}>
              {k.dir === 'up' ? <MdArrowUpward size={14} /> : <MdArrowDownward size={14} />}{k.change}
            </span>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Causality Area Chart */}
        <div className="card">
          <div className="card-header"><span className="card-title">Causality Assessment Distribution</span></div>
          <div className="card-body">
            {loading ? <div style={{ padding: 40, color: 'var(--muted)' }}>Loading...</div> :
              causalityChartData.length === 0 ? <div style={{ padding: 40, color: 'var(--muted)' }}>No data yet</div> : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={causalityChartData}>
                  <defs>
                    <linearGradient id="colorSignals" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007BFF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#007BFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="signals" stroke="#007BFF" fill="url(#colorSignals)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Severity Bar Chart */}
        <div className="card">
          <div className="card-header"><span className="card-title">Severity Breakdown</span></div>
          <div className="card-body">
            {loading ? <div style={{ padding: 40, color: 'var(--muted)' }}>Loading...</div> :
              severityChartData.length === 0 ? <div style={{ padding: 40, color: 'var(--muted)' }}>No data yet</div> : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={severityChartData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                    {severityChartData.map((entry) => (
                      <Cell key={entry.name} fill={SEV_COLORS[entry.name] || '#94A3B8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Top Drugs Progress */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Top Drugs by Signal Count</span></div>
          <div className="card-body">
            {loading ? <div style={{ padding: 40, color: 'var(--muted)' }}>Loading...</div> :
              topDrugs.length === 0 ? <div style={{ padding: 40, color: 'var(--muted)' }}>No data yet</div> :
              topDrugs.map(([drug, count]) => {
                const maxC = Math.max(...topDrugs.map(d => d[1]), 1)
                return (
                  <div key={drug} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                      <span>{drug}</span><span>{count} signals</span>
                    </div>
                    <div className="progress"><div className="progress-fill" style={{ width: `${(count / maxC) * 100}%`, background: 'var(--blue)' }} /></div>
                  </div>
                )
              })
            }
          </div>
        </div>

        {/* Top Events */}
        <div className="card">
          <div className="card-header"><span className="card-title">Top Adverse Events</span></div>
          <div className="card-body">
            {loading ? <div style={{ padding: 40, color: 'var(--muted)' }}>Loading...</div> :
              topEvents.length === 0 ? <div style={{ padding: 40, color: 'var(--muted)' }}>No data yet</div> :
              topEvents.map(([event, count]) => {
                const maxC = Math.max(...topEvents.map(e => e[1]), 1)
                return (
                  <div key={event} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                      <span>{event}</span><span>{count}</span>
                    </div>
                    <div className="progress"><div className="progress-fill" style={{ width: `${(count / maxC) * 100}%`, background: '#EF4444' }} /></div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Signal Summary by Severity</span></div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? <div style={{ padding: 20, color: 'var(--muted)' }}>Loading...</div> : (
            <table>
              <thead><tr><th>Severity</th><th>Count</th><th>% of Total</th><th>Status</th></tr></thead>
              <tbody>
                {Object.entries(sevCounts).map(([sev, count]) => (
                  <tr key={sev}>
                    <td><strong>{sev}</strong></td>
                    <td>{count}</td>
                    <td><strong>{totalRecords > 0 ? ((count / totalRecords) * 100).toFixed(1) : 0}%</strong></td>
                    <td>
                      <span className={`badge badge-${sev === 'Critical' ? 'danger' : sev === 'High' ? 'warning' : sev === 'Medium' ? 'info' : 'success'}`}>
                        {sev === 'Critical' || sev === 'High' ? 'Requires Action' : 'Monitoring'}
                      </span>
                    </td>
                  </tr>
                ))}
                {Object.keys(sevCounts).length === 0 && <tr><td colSpan={4} style={{ color: 'var(--muted)', textAlign: 'center' }}>No data</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}

// ── Sub-component: Report Form ────────────────────────────────
function GenerateReportForm({ stats, sevCounts, causalityCounts, topDrugs, topEvents }) {
  return (
    <div>
      <div className="form-group">
        <label className="form-label">Report Type</label>
        <select className="form-input" id="report-type">
          <option>Signal Trend Analysis</option>
          <option>Severity Summary</option>
          <option>Causality Distribution</option>
          <option>Full Pharmacovigilance Report</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Time Period</label>
        <select className="form-input">
          <option>All Time</option>
          <option>Last 30 Days</option>
          <option>Last 7 Days</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Format</label>
        <select className="form-input">
          <option>Text Summary (.txt)</option>
          <option>CSV Data</option>
        </select>
      </div>
      {/* Preview */}
      <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 12, fontSize: 12, color: 'var(--text2)', marginTop: 8 }}>
        <strong>Preview:</strong> Total Signals: {stats?.total_records || 0} &nbsp;|&nbsp;
        Critical: {sevCounts?.Critical || 0} &nbsp;|&nbsp;
        Certain/Probable: {(causalityCounts?.Certain || 0) + (causalityCounts?.Probable || 0)} &nbsp;|&nbsp;
        Top Drug: {topDrugs?.[0]?.[0] || 'N/A'}
      </div>
    </div>
  )
}

// ── Download helper ────────────────────────────────────────────
function downloadReport(stats, sevCounts, causalityCounts, topDrugs, topEvents) {
  const now = new Date().toISOString()
  const total = stats?.total_records || 0

  const lines = [
    '============================================================',
    '   AyuScout V2 — Trend Analysis Report',
    `   Generated: ${now}`,
    '============================================================',
    '',
    '--- SIGNAL SUMMARY ---',
    `Total Signals Detected : ${total}`,
    `Critical               : ${sevCounts?.Critical || 0}`,
    `High                   : ${sevCounts?.High || 0}`,
    `Medium                 : ${sevCounts?.Medium || 0}`,
    `Low                    : ${sevCounts?.Low || 0}`,
    '',
    '--- CAUSALITY ASSESSMENT (WHO-UMC) ---',
    ...Object.entries(causalityCounts || {}).map(([k, v]) => `${k.padEnd(20)}: ${v}`),
    '',
    '--- TOP DRUGS BY SIGNAL COUNT ---',
    ...( topDrugs || []).map(([d, c], i) => `${String(i + 1).padStart(2)}. ${d.padEnd(25)} ${c} signals`),
    '',
    '--- TOP ADVERSE EVENTS ---',
    ...(topEvents || []).map(([e, c], i) => `${String(i + 1).padStart(2)}. ${e.padEnd(25)} ${c} reports`),
    '',
    '============================================================',
    '   Powered by AyuScout V2 AI Pharmacovigilance Engine',
    '   This report requires human medical review before regulatory submission.',
    '============================================================',
  ]

  const content = lines.join('\n')
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `AyuScout_TrendReport_${Date.now()}.txt`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
