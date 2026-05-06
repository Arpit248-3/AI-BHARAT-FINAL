import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const volumeData = [
  { date: 'May 20', Reddit: 3200, Twitter: 2100, News: 800 },
  { date: 'May 27', Reddit: 3500, Twitter: 2400, News: 900 },
  { date: 'Jun 1', Reddit: 4100, Twitter: 2800, News: 1100 },
  { date: 'Jun 6', Reddit: 3800, Twitter: 3200, News: 950 },
  { date: 'Jun 11', Reddit: 5200, Twitter: 3600, News: 1300 },
  { date: 'Jun 15', Reddit: 4400, Twitter: 3100, News: 1050 },
  { date: 'Jun 17', Reddit: 4000, Twitter: 2900, News: 980 },
]

// Note: In a final step, you would fetch these from your SQLite DB. 
// For the demo, these act as your default view.
const staticPosts = [
  { id: 'POST-90421', content: 'Metformin gives me nausea every day after lunch', platform: 'Reddit', author: 'u/diabetes_life', sentiment: 'Negative', engagement: '234 comments', date: '2026-05-06' },
  { id: 'POST-90420', content: 'Feeling so much better after switching to insulin pump', platform: 'X (Twitter)', author: '@health_journey', sentiment: 'Positive', engagement: '89 retweets', date: '2026-05-06' },
]

export default function DataExplorer() {
  // --- AGENTIC STATE ---
  const [keyword, setKeyword] = useState("");
  const [isScouting, setIsScouting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- API HANDLERS ---
  const handleFetchSignals = async () => {
    if (!keyword) return alert("Please enter a drug keyword (e.g., Metformin)");
    setIsScouting(true);
    try {
      const response = await fetch('http://localhost:8080/api/run-scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword })
      });
      const data = await response.json();
      alert(`Scout Status: ${data.status}`);
    } catch (error) {
      alert("Backend connection failed. Is server.py running?");
    } finally {
      setIsScouting(false);
    }
  };

  const handleAnalyzeVault = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('http://localhost:8080/api/process-vault');
      const data = await response.json();
      alert(`AI Intelligence Success: Processed ${data.total_processed} new safety signals.`);
    } catch (error) {
      alert("Analysis failed. Check your Python terminal for agent logs.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      {/* SCOUT COMMAND BAR - Integrated into your filter section */}
      <div className="filter-bar" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <input
          className="form-input"
          placeholder="Enter Drug Keyword..."
          style={{ maxWidth: 220, padding: '8px 12px', fontSize: 13 }}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button
          className="btn btn-primary btn-sm"
          onClick={handleFetchSignals}
          disabled={isScouting}
        >
          {isScouting ? "📡 Scouting..." : "Fetch New Signals"}
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={handleAnalyzeVault}
          disabled={isAnalyzing}
          style={{ background: '#10b981', color: 'white' }}
        >
          {isAnalyzing ? "🧠 Processing..." : "Analyze Intelligence"}
        </button>

        <div style={{ borderLeft: '1px solid #cbd5e1', height: '24px', margin: '0 10px' }}></div>

        {/* Original Filters */}
        <select className="filter-select"><option>Source: All Sources</option><option>Reddit</option></select>
        <select className="filter-select"><option>Sentiment: All</option><option>Negative</option></select>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Post Volume by Source</span></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Reddit" fill="#FF4500" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Twitter" fill="#1DA1F2" radius={[3, 3, 0, 0]} />
                <Bar dataKey="News" fill="#64748B" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Engagement Over Time</span></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Reddit" stroke="#FF4500" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Twitter" stroke="#1DA1F2" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Detected Safety Signals (Intake Vault)</span>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>Live Monitoring Active</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Content</th>
                <th>Platform</th>
                <th>Author</th>
                <th>Sentiment</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {staticPosts.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.id}</strong></td>
                  <td style={{ maxWidth: 280 }}>{p.content}</td>
                  <td><span className="badge badge-neutral">{p.platform}</span></td>
                  <td style={{ color: 'var(--blue)' }}>{p.author}</td>
                  <td>
                    <span className={`badge badge-${p.sentiment === 'Positive' ? 'success' : 'danger'}`}>
                      {p.sentiment}
                    </span>
                  </td>
                  <td><span className="badge badge-warning">Analyzed</span></td>
                  <td>{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <span>Showing Active Monitoring Signals</span>
            <div className="pagination-btns"><button className="active">1</button></div>
          </div>
        </div>
      </div>
    </>
  )
}