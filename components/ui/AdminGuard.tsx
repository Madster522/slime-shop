import Link from 'next/link'
import { signIn, useSession } from 'next-auth/react'
import React from 'react'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">Loading...</main>
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <section className="mx-auto max-w-md slime-card p-8 text-center">
          <h1 className="text-3xl font-black">Admin Login</h1>
          <p className="mt-3 text-slate-400">Sign in with your admin Google account to manage the shop.</p>
          <button onClick={() => signIn('google')} className="slime-button mt-6 w-full">Sign in with Google</button>
        </section>
      </main>
    )
  }

  if (!session.user?.isAdmin) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <section className="mx-auto max-w-md slime-card p-8 text-center">
          <h1 className="text-3xl font-black">Not Admin</h1>
          <p className="mt-3 text-slate-400">Your email is not in config/constants.ts.</p>
          <Link href="/" className="slime-button mt-6 w-full">Go Home</Link>
        </section>
      </main>
    )
  }

  return <>{children}</>
}
