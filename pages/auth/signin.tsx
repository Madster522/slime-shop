import React from 'react'
import Head from 'next/head'
import { signIn, getSession } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'

export default function SignInPage() {
  const router = useRouter()
  const callbackUrl = (router.query.callbackUrl as string) || '/'
  const error = router.query.error as string | undefined

  const errorMessages: Record<string, string> = {
    OAuthAccountNotLinked: 'This email is linked to another sign-in method.',
    OAuthSignin:   'Error starting Google sign-in. Please try again.',
    OAuthCallback: 'Error during Google callback. Check your Google Console redirect URI.',
    Configuration: 'Server configuration error. Check NEXTAUTH_SECRET.',
    Default:       'Something went wrong. Please try again.',
  }

  return (
    <>
      <Head><title>Sign In — Slime Shop</title></Head>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">🟢</div>
            <h1 className="font-bold text-3xl text-slate-900">Slime Shop</h1>
            <p className="text-slate-500 text-sm mt-1">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {errorMessages[error] || errorMessages.Default}
            </div>
          )}

          <button
            onClick={() => signIn('google', { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 border-2 border-gray-200 rounded-2xl hover:border-green-400 hover:bg-green-50 transition-all font-semibold text-gray-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-xs text-center text-slate-400 mt-6">
            By signing in you agree to our terms. We only use your email to manage your orders.
          </p>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  if (session) return { redirect: { destination: '/', permanent: false } }
  return { props: {} }
}
