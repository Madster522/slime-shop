import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function AuthErrorPage() {
  const router = useRouter()
  const error = router.query.error as string

  const messages: Record<string, string> = {
    OAuthCallback:  'Google redirect URI mismatch. Make sure http://localhost:3000/api/auth/callback/google is in your Google Console.',
    Configuration:  'Server config error — check NEXTAUTH_SECRET is set in .env.local.',
    OAuthSignin:    'Could not start Google sign-in. Check GOOGLE_CLIENT_ID.',
    Default:        'An unexpected error occurred.',
  }

  return (
    <>
      <Head><title>Auth Error — Slime Shop</title></Head>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Sign-in Error</h1>
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-left">
            <p className="text-xs font-bold text-red-600 mb-1">Error:</p>
            <p className="text-sm font-mono text-red-700">{error || 'unknown'}</p>
          </div>
          <p className="text-slate-500 text-sm mb-6">
            {messages[error] || messages.Default}
          </p>
          <Link href="/auth/signin" className="inline-block px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600">
            Try Again
          </Link>
        </div>
      </div>
    </>
  )
}
