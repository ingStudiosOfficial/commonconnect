'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function ProtectedPage() {
  const router = useRouter()
  const supabaseClient = useSupabaseClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any | null>(null)

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
      }
      setLoading(false)
    })

    const { data: authListener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
      }
      setLoading(false)
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [router])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Protected Page</h1>
      <p>Welcome, {user?.email}</p>
    </div>
  )
}