import { useState, useEffect } from 'react'
import { MdArrowUpward, MdArrowDownward, MdDownload, MdRefresh } from 'react-icons/md'

const API_BASE = 'http://localhost:8080'

const sevColors = { Critical: 'danger', High: 'warning', Medium: 'info', Low: 'neutral' }

function getConfidenceBadge(confidence) {
  if (!confidence || confidence === 'Unknown') return 'neutral'
  const num = parseInt(confidence)
  if (isNaN(num)) {
    if (confidence.toLowerCase().includes('certain') || confidence.toLowerCase().includes('high')) return 'danger'
    if (confidence.toLowerCase().includes('probable')) return 'warning'
    return 'info'
  }
  if (num >= 75) return 'danger'
  if (num >= 50) return 'warning'
  return 'info'
}

export default function Alerts({ openModal }) {
  const [liveSignals, setLiveSignals] = useState([])
  const [loading, setLoading] = useState(true)
  const [exportingId, setExportingId] = useState(null)

  const fetchLiveSignals = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/alerts-feed`)
      const data = await res.json()
      if (data.status === 'success') {
        setLiveSignals(data.records || [])
      }
    } catch (err) {
      console.error('Failed to fetch live signals:', err)
    }
    setLoading(false)
  }

  useEffect(() => { fetchLiveSignals() }, [])

  const handleExportE2B = async (recordId) => {
    setExportingId(recordId)
    try {
      const res = await fetch(`${API_BASE}/api/export-e2b/${recordId}`)
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `E2B_ICSR_${recordId}.xml`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('E2B export failed:', err)
      openModal({
        title: 'Export Failed',
        children: <p style={{ color: 'var(--danger)' }}>Failed to export E2B XML. Make sure the backend is running.</p>,
        footer: <button className="btn btn-primary" onClick={() => openModal(null)}>OK</button>
      })
    }
    setExportingId(null)
  }

  const viewSignalDetail = (signal) => {
    let factors = []
    try { factors = JSON.parse(signal.who_umc_factors || '[]') } catch { factors = [] }

    openModal({
      title: `Signal Detail — ${signal.drug} → ${signal.event}`,
      children: (
        <div style={{ fontSize: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 700 }}>Suspect Drug</div>
              <div style={{ fontWeight: 600 }}>{signal.drug}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 700 }}>Adverse Event</div>
              <div style={{ fontWeight: 600 }}>{signal.event}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 700 }}>WHO-UMC Causality</div>
              <span className={`badge badge-${sevColors[signal.severity] || 'neutral'}`}>{signal.causality}</span>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 700 }}>Confidence</div>
              <span className={`badge badge-${getConfidenceBadge(signal.confidence)}`}>{signal.confidence}</span>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 700 }}>Severity</div>
              <span className={`badge badge-${sevColors[signal.severity] || 'neutral'}`}>{signal.severity}</span>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 700 }}>Time to Onset</div>
              <div style={{ fontWeight: 600 }}>{signal.time_to_onset || 'N/A'}</div>
            </div>
          </div>
          <div style={{ padding: 12, background: 'var(--bg)', borderRadius: 6, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 700 }}>AI Reasoning</div>
            <div>{signal.reasoning}</div>
          </div>
          {factors.length > 0 && (
            <div style={{ padding: 12, background: 'var(--bg)', borderRadius: 6, marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 700 }}>WHO-UMC Assessment Factors</div>
              <ul style={{ margin: '8px 0 0 16px', lineHeight: 1.6 }}>
                {factors.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          )}
          {signal.pubmed_link && signal.pubmed_link !== 'N/A' && (
            <div style={{ marginTop: 8 }}>
              <a href={signal.pubmed_link} target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--blue)', fontWeight: 600, fontSize: 13 }}>
                🔗 Verify on PubMed →
              </a>
            </div>
          )}
        </div>
      ),
      footer: (
        <>
          <button className="btn btn-ghost" onClick={() => openModal(null)}>Close</button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => { openModal(null); handleExportE2B(signal.id); }}>
            <MdDownload size={16} /> Export E2B (R3) XML
          </button>
        </>
      )
    })
  }

  // Dynamic KPIs
  const criticalCount = liveSignals.filter(s => s.severity === 'Critical').length
  const highCount = liveSignals.filter(s => s.severity === 'High').length
  const certainCount = liveSignals.filter(s => (s.causality || '').toLowerCase().includes('certain')).length

  return (
    <>
      <div className="filter-bar">
        <select className="filter-select"><option>All Severities</option><option>Critical</option><option>High</option><option>Medium</option></select>
        <select className="filter-select"><option>All Status</option><option>Active</option><option>Acknowledged</option><option>Resolved</option></select>
        <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={fetchLiveSignals} disabled={loading}>
          <MdRefresh size={16} className={loading ? 'spin' : ''} />
          {loading ? 'Refreshing...' : 'Refresh Live Signals'}
        </button>
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
          { label: 'Total Signals', value: String(liveSignals.length), change: 'From Intelligence Vault', dir: 'up' },
          { label: 'Critical', value: String(criticalCount), change: 'Require immediate action', dir: 'up' },
          { label: 'High Severity', value: String(highCount), change: 'Active monitoring', dir: 'up' },
          { label: 'Certain Causality', value: String(certainCount), change: 'WHO-UMC validated', dir: 'up' },
        ].map(k => (
          <div className="kpi-card" key={k.label}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{loading ? '...' : k.value}</div>
            <span className="kpi-change up">
              <MdArrowUpward size={14} />{k.change}
            </span>
          </div>
        ))}
      </div>

      {/* Live AI Signals Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Live AI Signals ({liveSignals.length})
          </span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>From AyuScout V2 Intelligence Vault</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading signals from backend...</div>
          ) : liveSignals.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No signals yet. Run AI analysis from the Dashboard or seed the database.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Drug</th>
                  <th>Adverse Event</th>
                  <th>Causality</th>
                  <th>Confidence</th>
                  <th>Severity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {liveSignals.map(s => (
                  <tr key={s.id}>
                    <td><strong>SIG-{String(s.id).padStart(3, '0')}</strong></td>
                    <td style={{ fontWeight: 600 }}>{s.drug}</td>
                    <td>{s.event}</td>
                    <td><span className={`badge badge-${sevColors[s.severity] || 'neutral'}`}>{s.causality}</span></td>
                    <td><span className={`badge badge-${getConfidenceBadge(s.confidence)}`}>{s.confidence}</span></td>
                    <td><span className={`badge badge-${sevColors[s.severity] || 'neutral'}`}>{s.severity}</span></td>
                    <td style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => viewSignalDetail(s)} title="View Details">👁</button>
                      <button className="btn btn-ghost btn-sm"
                        onClick={() => handleExportE2B(s.id)}
                        disabled={exportingId === s.id}
                        title="Export E2B XML">
                        {exportingId === s.id ? '⏳' : '📄'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
