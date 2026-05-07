import { useState, useEffect } from 'react'
import { MdBiotech, MdEmail, MdLock, MdPerson, MdVisibility, MdVisibilityOff, MdArrowForward } from 'react-icons/md'

const API_BASE = 'http://localhost:8080'

// Floating particle component
function Particle({ style }) {
  return <div className="login-particle" style={style} />
}

export default function Login({ onLogin }) {
  const [mode, setMode]                 = useState('login')      // 'login' | 'register'
  const [name, setName]                 = useState('')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [confirm, setConfirm]           = useState('')
  const [showPw, setShowPw]             = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [success, setSuccess]           = useState('')
  const [shake, setShake]               = useState(false)
  const [animating, setAnimating]       = useState(false)

  // Generate fixed particle positions
  const particles = Array.from({ length: 18 }, (_, i) => ({
    width:  `${8 + (i * 7) % 24}px`,
    height: `${8 + (i * 7) % 24}px`,
    top:    `${(i * 17 + 5) % 90}%`,
    left:   `${(i * 23 + 3) % 95}%`,
    opacity: 0.06 + (i % 5) * 0.025,
    animationDelay: `${(i * 0.4) % 4}s`,
    animationDuration: `${6 + (i % 4) * 2}s`,
  }))

  const switchMode = (newMode) => {
    if (animating) return
    setAnimating(true)
    setError('')
    setSuccess('')
    setTimeout(() => {
      setMode(newMode)
      setName(''); setEmail(''); setPassword(''); setConfirm('')
      setAnimating(false)
    }, 220)
  }

  const triggerShake = (msg) => {
    setError(msg)
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (mode === 'register') {
      if (!name.trim())            return triggerShake('Name is required')
      if (!email.includes('@'))    return triggerShake('Enter a valid email')
      if (password.length < 6)     return triggerShake('Password must be at least 6 characters')
      if (password !== confirm)    return triggerShake('Passwords do not match')
    } else {
      if (!email.trim())   return triggerShake('Email is required')
      if (!password.trim()) return triggerShake('Password is required')
    }

    setLoading(true)
    try {
      if (mode === 'register') {
        const res  = await fetch(`${API_BASE}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        })
        const data = await res.json()
        if (!res.ok || data.error) return triggerShake(data.error || 'Registration failed')
        setSuccess('Account created! Logging you in...')
        setTimeout(() => onLogin(data.user), 800)
      } else {
        const res  = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })
        const data = await res.json()
        if (!res.ok || data.error) return triggerShake(data.error || 'Invalid email or password')
        onLogin(data.user)
      }
    } catch (err) {
      triggerShake('Cannot connect to server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Animated particles */}
      {particles.map((p, i) => <Particle key={i} style={p} />)}

      {/* Glow orbs */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />

      {/* Card */}
      <div className={`login-card ${shake ? 'shake' : ''} ${animating ? 'login-card-exit' : 'login-card-enter'}`}>
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon"><MdBiotech size={28} /></div>
          <div>
            <div className="login-logo-title">AyuScout V2</div>
            <div className="login-logo-sub">Pharmacovigilance Intelligence</div>
          </div>
        </div>

        {/* Mode toggle pills */}
        <div className="login-tabs">
          <button
            className={`login-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >Sign In</button>
          <button
            className={`login-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => switchMode('register')}
          >Create Account</button>
        </div>

        {/* Heading */}
        <h2 className="login-heading">
          {mode === 'login' ? 'Welcome back 👋' : 'Join AyuScout V2'}
        </h2>
        <p className="login-sub">
          {mode === 'login'
            ? 'Sign in to access your pharmacovigilance dashboard'
            : 'Create your account to start monitoring adverse events'}
        </p>

        {/* Error / Success */}
        {error   && <div className="login-alert login-alert-error">⚠️ {error}</div>}
        {success && <div className="login-alert login-alert-success">✅ {success}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'register' && (
            <div className="login-field">
              <label>Full Name</label>
              <div className="login-input-wrap">
                <MdPerson className="login-input-icon" />
                <input type="text" placeholder="Dr. Jane Smith"
                  value={name} onChange={e => setName(e.target.value)} autoFocus />
              </div>
            </div>
          )}

          <div className="login-field">
            <label>Email Address</label>
            <div className="login-input-wrap">
              <MdEmail className="login-input-icon" />
              <input type="email" placeholder="you@hospital.com"
                value={email} onChange={e => setEmail(e.target.value)}
                autoFocus={mode === 'login'} />
            </div>
          </div>

          <div className="login-field">
            <label>Password</label>
            <div className="login-input-wrap">
              <MdLock className="login-input-icon" />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
                value={password} onChange={e => setPassword(e.target.value)}
              />
              <button type="button" className="login-pw-toggle" onClick={() => setShowPw(p => !p)}>
                {showPw ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="login-field">
              <label>Confirm Password</label>
              <div className="login-input-wrap">
                <MdLock className="login-input-icon" />
                <input type="password" placeholder="Re-enter password"
                  value={confirm} onChange={e => setConfirm(e.target.value)} />
                {confirm && (
                  <span style={{ position: 'absolute', right: 12, fontSize: 16 }}>
                    {confirm === password ? '✅' : '❌'}
                  </span>
                )}
              </div>
            </div>
          )}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading
              ? <span className="login-spinner" />
              : <>{mode === 'login' ? 'Sign In' : 'Create Account'} <MdArrowForward size={18} /></>
            }
          </button>
        </form>

        {/* Switch mode */}
        <p className="login-switch">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </p>

        {/* Admin hint */}
        {mode === 'login' && (
          <div className="login-admin-hint">
            🛡️ Admin login: <code>admin@ayuscout.ai</code> / <code>Admin@123</code>
          </div>
        )}
      </div>
    </div>
  )
}
