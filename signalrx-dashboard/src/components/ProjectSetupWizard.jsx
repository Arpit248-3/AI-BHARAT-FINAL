import { useState, useEffect } from 'react'
import {
  MdRocketLaunch, MdClose, MdAdd, MdCheckCircle, MdAutoFixHigh,
  MdRadioButtonChecked, MdRadioButtonUnchecked,
  MdCheckBox, MdCheckBoxOutlineBlank,
  MdForum, MdAlternateEmail, MdQuestionAnswer,
  MdBolt, MdSchedule, MdCalendarMonth,
  MdSettings, MdArrowForward, MdInfoOutline,
  MdSmartToy, MdTerminal, MdContentCopy, MdDone, MdCode
} from 'react-icons/md'

/* ── Constants ─────────────────────────────────────────────── */
const DATA_SOURCES = [
  { id: 'reddit',  label: 'Reddit',     desc: 'Subreddits & drug communities', icon: MdForum,          color: '#FF4500', bg: 'rgba(255,69,0,.1)' },
  { id: 'twitter', label: 'X (Twitter)', desc: 'Posts, threads & mentions',     icon: MdAlternateEmail, color: '#1DA1F2', bg: 'rgba(29,161,242,.1)' },
  { id: 'quora',   label: 'Quora',      desc: 'Medical Q&A discussions',       icon: MdQuestionAnswer, color: '#B92B27', bg: 'rgba(185,43,39,.1)' },
]
const LATENCY_OPTIONS = [
  { id: 'realtime', label: 'Real-time (Stream)', desc: 'Sub-second event processing',  icon: MdBolt,          color: '#10B981' },
  { id: 'daily',    label: 'Daily Batch',        desc: 'Aggregated every 24 hours',     icon: MdSchedule,      color: '#F59E0B' },
  { id: 'weekly',   label: 'Weekly Report',       desc: 'Summary digest every 7 days',  icon: MdCalendarMonth, color: '#8B5CF6' },
]
const AGENT_STEPS = [
  { text: 'Fetching HTML DOM Tree…',                              duration: 1000 },
  { text: 'Agent analyzing UI structure & isolating threads…',    duration: 1500 },
  { text: 'Extracting CSS selectors & generating JSON config…',   duration: 1000 },
]

/* ── Helpers ───────────────────────────────────────────────── */
function KeywordTag({ word, onRemove, disabled }) {
  return (
    <span style={{ display:'inline-flex',alignItems:'center',gap:4,background:'var(--blue-bg)',color:'var(--blue)',
      border:'1px solid rgba(0,123,255,.2)',borderRadius:16,padding:'4px 10px 4px 12px',fontSize:13,fontWeight:600 }}>
      {word}
      {!disabled && <button onClick={onRemove} style={{display:'flex',padding:2,borderRadius:'50%',cursor:'pointer',
        color:'var(--blue)',background:'none',border:'none'}}><MdClose size={14}/></button>}
    </span>
  )
}

function SourceCard({ source, selected, onToggle, disabled }) {
  const I = source.icon
  return (
    <div onClick={()=>!disabled&&onToggle(source.id)} style={{ display:'flex',alignItems:'center',gap:14,padding:'16px 18px',
      background:selected?'rgba(0,123,255,.04)':'var(--surface)',border:`1.5px solid ${selected?'var(--blue)':'var(--border)'}`,
      borderRadius:'var(--radius)',cursor:disabled?'not-allowed':'pointer',transition:'all .2s',opacity:disabled?.5:1 }}>
      <div style={{width:42,height:42,borderRadius:10,background:source.bg,color:source.color,
        display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><I size={22}/></div>
      <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700}}>{source.label}</div>
        <div style={{fontSize:12,color:'var(--muted)'}}>{source.desc}</div></div>
      {selected?<MdCheckBox size={22} style={{color:'var(--blue)',flexShrink:0}}/>
               :<MdCheckBoxOutlineBlank size={22} style={{color:'var(--border)',flexShrink:0}}/>}
    </div>
  )
}

function LatencyOption({ option, selected, onSelect, disabled }) {
  const I = option.icon
  return (
    <div onClick={()=>!disabled&&onSelect(option.id)} style={{ display:'flex',alignItems:'center',gap:14,padding:'14px 16px',
      background:selected?'rgba(0,123,255,.04)':'var(--surface)',border:`1.5px solid ${selected?'var(--blue)':'var(--border)'}`,
      borderRadius:'var(--radius)',cursor:disabled?'not-allowed':'pointer',transition:'all .2s',opacity:disabled?.5:1 }}>
      <I size={20} style={{color:option.color,flexShrink:0}}/>
      <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{option.label}</div>
        <div style={{fontSize:11,color:'var(--muted)'}}>{option.desc}</div></div>
      {selected?<MdRadioButtonChecked size={20} style={{color:'var(--blue)',flexShrink:0}}/>
               :<MdRadioButtonUnchecked size={20} style={{color:'var(--border)',flexShrink:0}}/>}
    </div>
  )
}

/* ── Main Component ────────────────────────────────────────── */
export default function ProjectSetupWizard({ onClose }) {
  const [projectName, setProjectName]   = useState('')
  const [keywords, setKeywords]         = useState([])
  const [keywordInput, setKeywordInput] = useState('')
  const [sources, setSources]           = useState([])
  const [latency, setLatency]           = useState('realtime')

  // Agentic scraper state
  const [agentUrl, setAgentUrl]         = useState('')
  const [agentStep, setAgentStep]       = useState(-1)   // -1=idle, 0-2=running, 3=done
  const [agentResult, setAgentResult]   = useState(null)
  const [agentApproved, setAgentApproved] = useState(false)
  const [copied, setCopied]             = useState(false)

  // Deploy
  const [deploying, setDeploying]       = useState(false)
  const [deployed, setDeployed]         = useState(false)

  /* ── Agentic step machine ────────────────────────────────── */
  useEffect(() => {
    if (agentStep < 0 || agentStep >= AGENT_STEPS.length) return
    const timer = setTimeout(() => {
      if (agentStep < AGENT_STEPS.length - 1) {
        setAgentStep(s => s + 1)
      } else {
        // Final step done → generate result
        const domain = (() => { try { return new URL(agentUrl).hostname } catch { return 'unknown.com' } })()
        setAgentResult({
          source_url: agentUrl,
          scraper_type: 'agentic_generated',
          generated_by: 'AyuScout Agentic Crawler v2.1',
          selectors: {
            post_title: `.thread-title h1`,
            author: `.user-info .username`,
            body: `.post-content .text`,
            timestamp: `.post-time time`,
            reply_count: `.thread-meta .reply-count`,
          },
          pagination: { next_page: `a.pagination-next`, strategy: 'click' },
          confidence_score: +(0.92 + Math.random() * 0.07).toFixed(2),
          estimated_posts_per_page: Math.floor(15 + Math.random() * 10),
          domain,
        })
        setAgentStep(3)
      }
    }, AGENT_STEPS[agentStep].duration)
    return () => clearTimeout(timer)
  }, [agentStep])

  /* ── Handlers ────────────────────────────────────────────── */
  const addKeyword = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const w = keywordInput.trim().toLowerCase()
      if (w && !(keywords||[]).includes(w)) setKeywords(p=>[...(p||[]),w])
      setKeywordInput('')
    }
  }
  const removeKeyword = w => setKeywords(p=>(p||[]).filter(k=>k!==w))
  const toggleSource = id => setSources(p=>{const s=p||[];return s.includes(id)?s.filter(x=>x!==id):[...s,id]})

  const startAgent = () => {
    if (!agentUrl.trim()) return
    setAgentResult(null); setAgentApproved(false); setAgentStep(0); setCopied(false)
  }

  const copyConfig = () => {
    if (agentResult) { navigator.clipboard?.writeText(JSON.stringify(agentResult,null,2)); setCopied(true); setTimeout(()=>setCopied(false),2000) }
  }

  const handleDeploy = () => {
    if (!projectName.trim()) return
    setDeploying(true)
    const payload = {
      projectName: projectName.trim(),
      keywords: keywords || [],
      sources: sources || [],
      latency,
      agenticScraper: agentApproved ? agentResult : null,
      deployedAt: new Date().toISOString()
    }
    setTimeout(() => {
      setDeploying(false)
      setDeployed(true)
      // Build a project card object for the Projects list
      const newProject = {
        id: Date.now(),
        name: payload.projectName,
        status: 'Active',
        statusC: 'success',
        progress: 0,
        keywords: payload.keywords.length,
        sources: payload.sources.length > 0
          ? payload.sources.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')
          : 'Reddit',
        team: ['AI'],
        due: 'Ongoing',
        agenticEnabled: !!agentApproved,
      }
      // onClose(project) lets Projects.jsx add it to the list
      setTimeout(() => onClose?.(newProject), 1200)
    }, 2000)
  }

  const lock = deploying || deployed
  const agentRunning = agentStep >= 0 && agentStep < AGENT_STEPS.length

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div style={{maxWidth:780,margin:'0 auto'}}>

      {/* Success Banner */}
      {deployed && (
        <div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 20px',marginBottom:20,
          background:'var(--success-bg)',border:'1px solid rgba(16,185,129,.25)',borderRadius:'var(--radius)',animation:'slideUp .3s ease'}}>
          <MdCheckCircle size={22} style={{color:'var(--success)',flexShrink:0}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:'var(--success)'}}>Listening Agents Deployed Successfully!</div>
            <div style={{fontSize:12,color:'var(--text2)',marginTop:2}}>
              Project "{projectName}" is monitoring {(sources||[]).length} source(s) with {(keywords||[]).length} keyword(s).
              {agentApproved && ' Agentic scraper is active.'} Check console for payload.</div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="help-hero" style={{marginBottom:24}}>
        <div className="help-hero-icon" style={{background:'rgba(139,92,246,.12)',color:'#8B5CF6',borderColor:'rgba(139,92,246,.2)'}}>
          <MdSettings size={28}/></div>
        <div><h1 className="help-hero-title">Project Setup Wizard</h1>
          <p className="help-hero-sub">Configure a new data-listening project for pharmacovigilance signal detection</p></div>
      </div>

      {/* ── 1. Project Name ─────────────────────────────────── */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-header"><span className="card-title">1 — Project Identity</span></div>
        <div className="card-body">
          <div className="form-group" style={{marginBottom:0}}>
            <label className="form-label">Project Name</label>
            <input className="form-input" placeholder='e.g. "Aspirin Safety Monitoring"'
              value={projectName} onChange={e=>setProjectName(e.target.value)} disabled={lock}/>
          </div>
        </div>
      </div>

      {/* ── 2. Keywords ─────────────────────────────────────── */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-header"><span className="card-title">2 — Monitoring Keywords</span>
          <span style={{fontSize:12,color:'var(--muted)'}}>{(keywords||[]).length} keyword{(keywords||[]).length!==1?'s':''}</span></div>
        <div className="card-body">
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:(keywords&&keywords.length)?12:0}}>
            {keywords&&keywords.map((kw,i)=><KeywordTag key={`${kw}-${i}`} word={kw} onRemove={()=>removeKeyword(kw)} disabled={lock}/>)}
          </div>
          <div style={{position:'relative'}}>
            <input className="form-input" placeholder="Type a drug, symptom, or keyword and press Enter…"
              value={keywordInput} onChange={e=>setKeywordInput(e.target.value)} onKeyDown={addKeyword} disabled={lock} style={{paddingRight:48}}/>
            <MdAdd size={18} style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',color:'var(--muted)',pointerEvents:'none'}}/>
          </div>
        </div>
      </div>

      {/* ── 3. Sources ──────────────────────────────────────── */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-header"><span className="card-title">3 — Data Sources</span>
          <span style={{fontSize:12,color:'var(--muted)'}}>{(sources||[]).length} selected</span></div>
        <div className="card-body">
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
            {DATA_SOURCES.map(s=><SourceCard key={s.id} source={s} selected={(sources||[]).includes(s.id)} onToggle={toggleSource} disabled={lock}/>)}
          </div>
        </div>
      </div>

      {/* ── 4. Latency ──────────────────────────────────────── */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-header"><span className="card-title">4 — Processing Latency</span></div>
        <div className="card-body">
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {LATENCY_OPTIONS.map(o=><LatencyOption key={o.id} option={o} selected={latency===o.id} onSelect={setLatency} disabled={lock}/>)}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          5. AGENTIC AI SOURCE ONBOARDER  — The "Wow" Factor
          ══════════════════════════════════════════════════════ */}
      <div className="card" style={{marginBottom:24,border:'1.5px solid rgba(139,92,246,.25)'}}>
        <div className="card-header" style={{background:'rgba(139,92,246,.04)'}}>
          <span className="card-title" style={{display:'flex',alignItems:'center',gap:8}}>
            <MdSmartToy size={20} style={{color:'#8B5CF6'}}/>
            5 — Agentic AI Source Onboarder
          </span>
          <span className="badge badge-info" style={{background:'rgba(139,92,246,.12)',color:'#8B5CF6',fontSize:10}}>AI-POWERED</span>
        </div>
        <div className="card-body">
          <p style={{fontSize:13,color:'var(--text2)',marginBottom:16,lineHeight:1.6}}>
            Paste any community URL below. Our <strong style={{color:'var(--text)'}}>Agentic Crawler</strong> will
            autonomously analyze the page structure, extract CSS selectors, and generate a ready-to-deploy scraper configuration — <em>no code required</em>.
          </p>

          {/* URL input + button */}
          <div style={{display:'flex',gap:10,marginBottom:16}}>
            <input className="form-input" style={{flex:1}}
              placeholder="https://drugs.com/forum/diabetes"
              value={agentUrl} onChange={e=>setAgentUrl(e.target.value)}
              disabled={lock||agentRunning}/>
            <button className="btn btn-primary" onClick={startAgent}
              disabled={lock||agentRunning||!agentUrl.trim()}
              style={{whiteSpace:'nowrap',gap:6,padding:'10px 20px',borderRadius:'var(--radius)',
                background: agentRunning ? 'var(--text2)' : 'linear-gradient(135deg,#7c3aed,#5b21b6)',
                opacity:(!agentUrl.trim()||lock)?0.5:1}}>
              {agentRunning
                ? <><span className="login-spinner" style={{width:14,height:14}}/> Analyzing…</>
                : <><MdAutoFixHigh size={16}/> Auto-Generate Scraper</>}
            </button>
          </div>

          {/* ── Agent Progress Steps ─────────────────────────── */}
          {agentStep >= 0 && (
            <div style={{marginBottom:16,padding:'14px 18px',background:'var(--bg)',border:'1px solid var(--border)',
              borderRadius:'var(--radius)',animation:'slideUp .2s ease'}}>
              {AGENT_STEPS.map((step, i) => {
                const done = agentStep > i
                const active = agentStep === i && agentStep < AGENT_STEPS.length
                return (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 0',
                    opacity: agentStep < i ? 0.3 : 1, transition:'opacity .3s'}}>
                    {done
                      ? <MdCheckCircle size={18} style={{color:'var(--success)',flexShrink:0}}/>
                      : active
                        ? <span className="login-spinner" style={{width:16,height:16,borderColor:'rgba(139,92,246,.3)',borderTopColor:'#8B5CF6'}}/>
                        : <div style={{width:16,height:16,borderRadius:'50%',border:'2px solid var(--border)',flexShrink:0}}/>}
                    <span style={{fontSize:13,fontWeight:active?600:400,color:done?'var(--success)':active?'var(--text)':'var(--muted)'}}>
                      {step.text}
                    </span>
                    {done && <span style={{fontSize:11,color:'var(--muted)',marginLeft:'auto'}}>✓</span>}
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Generated Config (Terminal Block) ─────────── */}
          {agentResult && (
            <div style={{animation:'slideUp .3s ease'}}>
              {/* Terminal header */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                background:'#1e1e2e',borderRadius:'8px 8px 0 0',padding:'10px 16px'}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <MdTerminal size={14} style={{color:'#a6adc8'}}/>
                  <span style={{fontSize:12,fontWeight:600,color:'#a6adc8',letterSpacing:'.03em'}}>
                    GENERATED SCRAPER CONFIG
                  </span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:11,color:'#a6e3a1',fontWeight:600}}>
                    Confidence: {(agentResult.confidence_score * 100).toFixed(0)}%
                  </span>
                  <button onClick={copyConfig} style={{display:'flex',alignItems:'center',gap:4,
                    padding:'4px 10px',borderRadius:4,background:'rgba(166,173,200,.1)',border:'1px solid rgba(166,173,200,.15)',
                    color:'#cdd6f4',fontSize:11,fontWeight:600,cursor:'pointer',transition:'all .15s'}}>
                    {copied ? <><MdDone size={12}/> Copied</> : <><MdContentCopy size={12}/> Copy</>}
                  </button>
                </div>
              </div>
              {/* Code block */}
              <pre style={{margin:0,padding:'16px 20px',background:'#181825',borderRadius:'0 0 8px 8px',
                overflow:'auto',maxHeight:320,fontSize:12.5,lineHeight:1.7,fontFamily:"'JetBrains Mono','Fira Code',Consolas,monospace"}}>
                <code style={{color:'#cdd6f4'}}>{jsonHighlight(agentResult)}</code>
              </pre>

              {/* Approve button */}
              <div style={{display:'flex',alignItems:'center',gap:12,marginTop:12}}>
                {agentApproved ? (
                  <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 18px',
                    background:'var(--success-bg)',border:'1px solid rgba(16,185,129,.25)',borderRadius:'var(--radius)',flex:1}}>
                    <MdCheckCircle size={18} style={{color:'var(--success)'}}/>
                    <span style={{fontSize:13,fontWeight:600,color:'var(--success)'}}>Agent Approved & Queued for Deployment</span>
                  </div>
                ) : (
                  <button className="btn btn-primary" onClick={()=>setAgentApproved(true)} disabled={lock}
                    style={{gap:8,padding:'10px 22px',borderRadius:'var(--radius)',
                      background:'linear-gradient(135deg,#10B981,#059669)',flex:1,justifyContent:'center'}}>
                    <MdCheckCircle size={16}/> Approve & Deploy Agent
                  </button>
                )}
              </div>

              {/* Hint */}
              <div style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 14px',marginTop:12,
                background:'rgba(139,92,246,.06)',border:'1px solid rgba(139,92,246,.15)',borderRadius:'var(--radius-sm)',
                fontSize:12,color:'var(--text2)',lineHeight:1.5}}>
                <MdInfoOutline size={16} style={{color:'#8B5CF6',flexShrink:0,marginTop:1}}/>
                <span><strong style={{color:'#8B5CF6'}}>Zero-Code Extensibility:</strong> This config was auto-generated
                  by our Agentic Crawler. It will be bundled with the project and used to scrape the target
                  community autonomously — no manual selector mapping required.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Action Bar ──────────────────────────────────────── */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'flex-end',gap:10,padding:'16px 0',borderTop:'1px solid var(--border)'}}>
        {!deployed && <button className="btn btn-ghost" onClick={()=>onClose?.()} disabled={deploying}>Cancel</button>}
        {deployed ? (
          <button className="btn btn-primary" onClick={()=>onClose?.()} style={{gap:8}}>
            Go to Dashboard <MdArrowForward size={16}/></button>
        ) : (
          <button className="btn btn-primary" onClick={handleDeploy}
            disabled={!projectName.trim()||deploying}
            style={{padding:'10px 24px',fontSize:14,borderRadius:'var(--radius)',gap:8,
              opacity:(!projectName.trim()||deploying)?0.6:1}}>
            {deploying
              ? <><span className="login-spinner" style={{width:16,height:16}}/> Deploying Agents…</>
              : <><MdRocketLaunch size={18}/> Deploy Listening Agents</>}
          </button>
        )}
      </div>
    </div>
  )
}

/* ── JSON syntax highlighter (inline, no deps) ─────────────── */
function jsonHighlight(obj) {
  const json = JSON.stringify(obj, null, 2)
  const parts = []
  const rx = /("(?:\\.|[^"\\])*")\s*:/g
  let last = 0, m
  while ((m = rx.exec(json)) !== null) {
    if (m.index > last) parts.push(<span key={`t${last}`} style={{color:'#cdd6f4'}}>{colorValues(json.slice(last, m.index))}</span>)
    parts.push(<span key={`k${m.index}`} style={{color:'#89b4fa'}}>{m[1]}</span>)
    parts.push(<span key={`c${m.index}`} style={{color:'#a6adc8'}}>: </span>)
    last = m.index + m[0].length
  }
  if (last < json.length) parts.push(<span key="end">{colorValues(json.slice(last))}</span>)
  return parts
}

function colorValues(text) {
  const parts = []
  const rx = /("(?:\\.|[^"\\])*")|(\b\d+\.?\d*\b)|(true|false|null)/g
  let last = 0, m
  while ((m = rx.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={`p${last}`} style={{color:'#a6adc8'}}>{text.slice(last, m.index)}</span>)
    if (m[1]) parts.push(<span key={`s${m.index}`} style={{color:'#a6e3a1'}}>{m[1]}</span>)
    else if (m[2]) parts.push(<span key={`n${m.index}`} style={{color:'#fab387'}}>{m[2]}</span>)
    else if (m[3]) parts.push(<span key={`b${m.index}`} style={{color:'#f38ba8'}}>{m[3]}</span>)
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(<span key={`e${last}`} style={{color:'#a6adc8'}}>{text.slice(last)}</span>)
  return parts
}
