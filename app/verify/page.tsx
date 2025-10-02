'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function VerifyPage() {
  const supabaseClient = useSupabaseClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error_description')
  const accessToken = searchParams.get('access_token') || ''
  const refreshToken = searchParams.get('refresh_token') || ''

  useEffect(() => {
    if (error) {
      return
    }
    supabaseClient.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
    router.push('/protected')
  }, [error, accessToken, refreshToken, router])

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      {error ? (
        <p className="text-red-600">Verification error: {error}</p>
      ) : (
        <p className="text-green-600">Verifying... You will be redirected shortly.</p>
      )}
    </div>
  )
}