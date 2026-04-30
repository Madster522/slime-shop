import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

export default function NotFoundPage() {
  return (
    <>
      <Head><title>404 — Page Not Found · Slime Shop</title></Head>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4 pt-20">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6 animate-bounce">🟢</div>
          <h1 className="text-6xl font-bold text-slate-900 mb-2">404</h1>
          <p className="text-xl font-semibold text-slate-700 mb-2">Page not found</p>
          <p className="text-slate-500 mb-8">Looks like this slime escaped! The page you're looking for doesn't exist.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors">← Go Home</Link>
            <Link href="/shop" className="px-6 py-3 border-2 border-slate-200 hover:border-green-400 text-slate-700 font-bold rounded-xl transition-colors">Browse Shop 🛍️</Link>
          </div>
        </div>
      </main>
    </>
  )
}
