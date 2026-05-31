'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Tracker from '../components/Tracker'
import Auth from '../components/Auth'

export default function Home() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf8f5' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🧸</div>
        <div style={{ fontSize: 13, color: '#a09080' }}>Loading...</div>
      </div>
    </div>
  )

  return session ? <Tracker session={session} /> : <Auth />
}
