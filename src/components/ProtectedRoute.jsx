import React, { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import Auth from '../pages/Auth'

export default function ProtectedRoute({ children }) {
  // Commented out authentication - direct access enabled
  // const [session, setSession] = useState(null)
  // const [loading, setLoading] = useState(true)

  // useEffect(() => {
  //   const currentSession = supabase.auth.getSession().then(({ data }) => {
  //     setSession(data.session)
  //     setLoading(false)
  //   })

  //   const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
  //     setSession(session)
  //   })

  //   return () => listener?.subscription.unsubscribe()
  // }, [])

  // if (loading) return <div>Loading...</div>

  // if (!session) return <Auth onLogin={s => setSession(s)} />

  // Directly render children without authentication check
  return children
}