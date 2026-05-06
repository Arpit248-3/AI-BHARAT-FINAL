import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { MdArrowUpward, MdArrowDownward, MdOpenInNew } from 'react-icons/md'

const sentimentData = [
  { date: 'May 20', positive: 120, neutral: 80, negative: 40 },
  { date: 'May 27', positive: 135, neutral: 90, negative: 35 },
  { date: 'Jun 1', positive: 110, neutral: 85, negative: 50 },
  { date: 'Jun 6', positive: 140, neutral: 75, negative: 60 },
  { date: 'Jun 11', positive: 90, neutral: 70, negative: 95 },
  { date: 'Jun 15', positive: 130, neutral: 88, negative: 45 },
  { date: 'Jun 17', positive: 145, neutral: 92, negative: 38 },
]

const keywordData = [
  { date: 'May 20', Insulin: 80, Metformin: 60, Nausea: 30, Dizziness: 20, Headache: 25 },
  { date: 'May 24', Insulin: 90, Metformin: 65, Nausea: 35, Dizziness: 22, Headache: 28 },
  { date: 'May 27', Insulin: 85, Metformin: 70, Nausea: 40, Dizziness: 25, Headache: 30 },
  { date: 'Jun 1', Insulin: 100, Metformin: 75, Nausea: 55, Dizziness: 30, Headache: 32 },
  { date: 'Jun 5', Insulin: 95, Metformin: 80, Nausea: 60, Dizziness: 28, Headache: 35 },
  { date: 'Jun 12', Insulin: 110, Metformin: 85, Nausea: 45, Dizziness: 32, Headache: 38 },
  { date: 'Jun 15', Insulin: 120, Metformin: 90, Nausea: 50, Dizziness: 35, Headache: 30 },
  { date: 'Jun 17', Insulin: 115, Metformin: 88, Nausea: 42, Dizziness: 30, Headache: 33 },
]

const pieData = [
  { name: 'Positive', value: 37, color: '#10B981' },
  { name: 'Neutral', value: 38, color: '#F59E0B' },
  { name: 'Negative', value: 25, color: '#EF4444' },
]

const keywords = [
  { keyword: 'Insulin', mentions: '23,456', volume: '23,456', trend: '↗' },
  { keyword: 'Metformin', mentions: '18,567', volume: '18,567', trend: '↗' },
  { keyword: 'Nausea', mentions: '12,334', volume: '8,334', trend: '↗↘' },
  { keyword: 'Dizziness', mentions: '6,650', volume: '6,650', trend: '↗' },
  { keyword: 'Headache', mentions: '4,700', volume: '4,700', trend: '↗' },
]

const alerts = [
  { title: 'High Probability Rumor Detected (e.g., 5G Chip in Vaccine)', severity: 'High', time: '12m ago' },
  { title: 'Spike in "nausea" mentions', severity: 'High', time: '2 hours ago' },
  { title: 'Increase dizziness complaints', severity: 'Medium', time: '3 hours ago' },
]

const recentPosts = [
  { platform: 'Reddit', text: 'Metformin gives me nausea every day', sentiment: 'Negative', time: '2m ago', color: '#FF4500' },
  { platform: 'X (Twitter)', text: 'Feeling better after taking insulin', sentiment: 'Positive', time: '5m ago', color: '#1DA1F2' },
  { platform: 'X (Twitter)', text: 'Feeling better after taking insulin', sentiment: 'Positive', time: '5m ago', color: '#1DA1F2' },
]

export default function Dashboard() {
  // ==========================================
  // NEW LOGIC: AI Engine State & Function
  // ==========================================
  const [inputText, setInputText] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const analyzeTextWithAI = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/analyze-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText })
      });
      const data = await response.json();
      if (data.status === "success") {
        setAiResult(data);
      }
    } catch (error) {
      console.error("API Error. Make sure python server is running on port 8080!", error);
    }
    setIsLoading(false);
  };
  // ==========================================

  return (
    <>
      {/* Filter Bar */}
      <div className="filter-bar">
        <select className="filter-select"><option>Project: Diabetes Monitoring</option><option>Cardio Safety</option></select>
        <select className="filter-select"><option>Keywords: Select keywords</option></select>
        <select className="filter-select"><option>Sources: All Sources</option><option>Reddit</option><option>X (Twitter)</option></select>
        <select className="filter-select"><option>Date Range: May 20 - Jun 17, 2025</option></select>
        <select className="filter-select"><option>Sentiment: All</option></select>
        <button className="btn btn-primary btn-sm">Apply Filters</button>
      </div>

      {/* ========================================== */}
      {/* NEW UI: Live AI Command Center */}
      {/* ========================================== */}
      <div className="card" style={{ marginBottom: 24, padding: 20, borderLeft: '4px solid #007BFF' }}>
        <h3 style={{ marginTop: 0, marginBottom: 16, color: '#007BFF', display: 'flex', alignItems: 'center', gap: 8, fontSize: '18px' }}>
          <MdOpenInNew size={22} /> Live AI Command Center (Actor-Critic Engine)
        </h3>

        <div style={{ display: 'flex', gap: 12 }}>
          <textarea
            rows="2"
            style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #E2E8F0", resize: 'none', outline: 'none' }}
            placeholder="Paste a patient social media post here... (e.g., My uncle takes Metformin, but I gave him herbal tea and he got a severe rash)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={analyzeTextWithAI}
            disabled={isLoading || !inputText}
            style={{ padding: '0 24px', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {isLoading ? "Agents are Analyzing..." : "Run AI Analysis"}
          </button>
        </div>

        {/* AI Result Box - Only shows when there is a result */}
        {aiResult && (
          <div style={{ marginTop: 20, padding: 16, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>

              <div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>🚨 Suspect Drug</div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{aiResult.clinical_data?.suspect_drug || "None"}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>⚠️ Adverse Event</div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{aiResult.clinical_data?.adverse_event || "None"}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>📊 WHO-UMC Causality</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: aiResult.causality.includes('Probable') ? '#EF4444' : '#F59E0B' }}>
                  {aiResult.causality}
                </div>
              </div>

            </div>

            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #E2E8F0', fontSize: 12, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>System Check:</strong> PII Data scrubbed and masked successfully.</span>
              <span><strong>Multi-Agent Consensus:</strong> Llama-3 & Phi-3 | Attempts required: {aiResult.retries_needed}</span>
            </div>
          </div>
        )}
      </div>
      {/* ========================================== */}

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Sentiment Donut */}
        <div className="card">
          <div className="card-header"><span className="card-title">Sentiment Overview</span></div>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <PieChart width={220} height={200}>
              <Pie data={pieData} cx={110} cy={100} innerRadius={55} outerRadius={85} dataKey="value" stroke="none">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>128,547</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Total Posts</div>
            </div>
          </div>
          <div style={{ padding: '0 20px 16px', display: 'flex', gap: 16, justifyContent: 'center' }}>
            {pieData.map(p => <span key={p.name} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />{p.name}
            </span>)}
          </div>
        </div>

        {/* Sentiment Over Time - Line Chart */}
        <div className="card">
          <div className="card-header"><span className="card-title">Sentiment Over Time</span></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={sentimentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="positive" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="neutral" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="negative" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Alerts (12)</span>
            <button className="btn btn-ghost btn-sm">View All</button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {alerts.map((a, i) => (
              <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{a.title}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge badge-${a.severity === 'High' ? 'danger' : 'warning'}`}>{a.severity}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Keyword Trends + Table + Recent Posts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Keyword Trends Line Chart */}
        <div className="card">
          <div className="card-header"><span className="card-title">Keyword Trends</span></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={keywordData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Insulin" stroke="#007BFF" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="Metformin" stroke="#10B981" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="Nausea" stroke="#EF4444" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="Dizziness" stroke="#F59E0B" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="Headache" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Keywords Table */}
        <div className="card">
          <div className="card-header"><span className="card-title">Top Keywords by Volume</span></div>
          <div className="card-body" style={{ padding: 0 }}>
            <table>
              <thead><tr><th>Keyword</th><th>Mentions</th><th>Trend</th></tr></thead>
              <tbody>
                {keywords.map(k => (
                  <tr key={k.keyword}><td><strong>{k.keyword}</strong></td><td>{k.mentions}</td><td>{k.trend}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Posts</span>
            <button className="btn btn-ghost btn-sm">View All</button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recentPosts.map((p, i) => (
              <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                  <strong>{p.platform}</strong>
                  <span className={`badge badge-${p.sentiment === 'Positive' ? 'success' : 'danger'}`} style={{ marginLeft: 'auto' }}>{p.sentiment}</span>
                </div>
                <div style={{ color: 'var(--text2)', fontSize: 12 }}>{p.text}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{p.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom KPI Strip */}
      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-label">Total Posts</div><div className="kpi-value">128,547</div><span className="kpi-change up"><MdArrowUpward size={14} />+18.6% vs last 7 days</span></div>
        <div className="kpi-card"><div className="kpi-label">Projects Tracked</div><div className="kpi-value">8</div></div>
        <div className="kpi-card"><div className="kpi-label">Sources Monitored</div><div className="kpi-value" style={{ fontSize: 20 }}>Reddit, X (Twitter)</div></div>
        <div className="kpi-card"><div className="kpi-label">Alerts This Week</div><div className="kpi-value">12</div><span className="kpi-change up"><MdArrowUpward size={14} />+15% vs last week</span></div>
      </div>
    </>
  )
}