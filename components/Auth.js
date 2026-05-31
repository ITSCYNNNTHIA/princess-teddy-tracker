'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

const C = {
  bg: '#faf8f5', card: '#ffffff', border: '#ede8e0', cream: '#f0ebe0',
  warm: '#c8b89a', warmDark: '#a8966e', warmPale: '#f5f0e8',
  text: '#2a2420', textMid: '#6a5a4a', textMuted: '#a09080',
  accent: '#3a2e28', white: '#ffffff',
}

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handle = async () => {
    setLoading(true); setError(''); setMessage('')
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Check your email to confirm your account!')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, #f5f0e8 0%, #ede8de 50%, #f0ebe2 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: C.white, borderRadius: 24, padding: '40px 32px', width: '100%', maxWidth: 400, border: `1px solid ${C.border}`, boxShadow: '0 8px 40px #2a242012' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>🧸</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: C.text, fontWeight: 700, lineHeight: 1.2 }}>Princess Teddy</h1>
          <p style={{ fontSize: 12, color: C.textMuted, marginTop: 6, letterSpacing: 2, textTransform: 'uppercase' }}>Wellness Journal</p>
        </div>

        <div style={{ display: 'flex', background: C.cream, borderRadius: 12, padding: 4, marginBottom: 24, gap: 4 }}>
          {['login', 'signup'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '8px', borderRadius: 9, border: 'none', cursor: 'pointer', background: mode === m ? C.white : 'transparent', color: mode === m ? C.accent : C.textMuted, fontWeight: mode === m ? 600 : 400, fontSize: 13, transition: 'all 0.2s' }}>
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{ width: '100%', padding: '12px 14px', borderRadius: 11, border: `1px solid ${C.border}`, background: '#faf8f5', color: C.text, fontSize: 14, fontFamily: 'inherit' }} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handle()}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 11, border: `1px solid ${C.border}`, background: '#faf8f5', color: C.text, fontSize: 14, fontFamily: 'inherit' }} />
        </div>

        {error && <p style={{ fontSize: 12, color: '#c97d6e', marginBottom: 14, textAlign: 'center' }}>{error}</p>}
        {message && <p style={{ fontSize: 12, color: '#8aaa8a', marginBottom: 14, textAlign: 'center' }}>{message}</p>}

        <button onClick={handle} disabled={loading || !email || !password}
          style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: loading || !email || !password ? C.cream : C.accent, color: loading || !email || !password ? C.textMuted : C.white, fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}>
          {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </div>
    </div>
  )
}
