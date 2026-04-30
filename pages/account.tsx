import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useRequireAuth } from '@/lib/useRequireAuth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { formatDollars, timeAgo } from '@/lib/utils'

const ORDER_STATUS_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  Pending:    { bg: 'bg-yellow-100',  text: 'text-yellow-800',  icon: '⏳' },
  Processing: { bg: 'bg-blue-100',    text: 'text-blue-800',    icon: '🔄' },
  Printing:   { bg: 'bg-purple-100',  text: 'text-purple-800',  icon: '🖨️' },
  Packed:     { bg: 'bg-indigo-100',  text: 'text-indigo-800',  icon: '📦' },
  Shipped:    { bg: 'bg-green-100',   text: 'text-green-800',   icon: '🚚' },
  Delayed:    { bg: 'bg-orange-100',  text: 'text-orange-800',  icon: '⚠️' },
  Delivered:  { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: '✅' },
  Cancelled:  { bg: 'bg-red-100',     text: 'text-red-800',     icon: '❌' },
}

export default function AccountPage() {
  const { session, isLoading } = useRequireAuth()
  const [tab, setTab] = useState<'orders'|'profile'>('orders')
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  useEffect(() => {
    if (session && tab === 'orders') {
      setOrdersLoading(true)
      fetch('/api/orders/mine')
        .then(r => r.json())
        .then(d => { setOrders(d.orders || []); setOrdersLoading(false) })
        .catch(() => setOrdersLoading(false))
    }
  }, [session, tab])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return null

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <>
      <Head><title>My Account — Slime Shop</title></Head>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="" className="w-14 h-14 rounded-2xl object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center text-white font-bold text-xl">
                {getInitials(session.user.name || 'U')}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{session.user.name}</h1>
              <p className="text-slate-500 text-sm">{session.user.email}</p>
            </div>
            <button onClick={() => signOut({ callbackUrl: '/' })} className="ml-auto text-sm text-red-500 hover:text-red-700 font-semibold">
              Sign Out
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-slate-200 pb-0">
            {[{ key: 'orders', label: '📦 My Orders' }, { key: 'profile', label: '👤 Profile' }].map(t => (
              <button key={t.key} onClick={() => setTab(t.key as any)}
                className={`px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-all ${tab === t.key ? 'bg-white text-green-700 border border-b-white border-slate-200 -mb-px' : 'text-slate-500 hover:text-slate-700'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Orders */}
          {tab === 'orders' && (
            <div>
              {ordersLoading ? (
                <div className="text-center py-16 text-slate-400">Loading orders…</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border">
                  <p className="text-5xl mb-3">📦</p>
                  <p className="text-slate-500 mb-5">No orders yet!</p>
                  <Link href="/shop" className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold">Browse Shop</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => {
                    const style = ORDER_STATUS_STYLES[order.status] || ORDER_STATUS_STYLES.Pending
                    return (
                      <div key={order.id} className="bg-white rounded-2xl border p-5 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="font-mono font-bold text-slate-700">{order.order_number}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
                              {style.icon} {order.status}
                            </span>
                            <span className="font-bold text-green-600">{formatDollars(order.total)}</span>
                          </div>
                        </div>

                        {order.status === 'Delayed' && order.delay_reason && (
                          <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-700 mb-3">
                            ⚠️ {order.delay_reason}
                          </div>
                        )}

                        {order.tracking_number && (
                          <div className="p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 mb-3">
                            🚚 {order.carrier} · Tracking: <span className="font-mono">{order.tracking_number}</span>
                          </div>
                        )}

                        <div className="flex gap-2 mt-3">
                          <Link href={`/track?order=${order.order_number}`}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:border-green-400 hover:text-green-600">
                            Track Order
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Profile */}
          {tab === 'profile' && (
            <div className="bg-white rounded-3xl border p-6 max-w-lg">
              <h2 className="font-bold text-slate-800 mb-5">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">NAME</label>
                  <input defaultValue={session.user.name || ''} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-600" disabled />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">EMAIL</label>
                  <input defaultValue={session.user.email || ''} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-600" disabled />
                </div>
                <p className="text-xs text-slate-400">Profile syncs with your Google account.</p>
              </div>
              <div className="mt-6 pt-6 border-t">
                <a href="https://discord.gg/slimeshop" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors">
                  <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.022.015.045.03.056a19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                  </svg>
                  <span className="font-semibold text-indigo-700">Join our Discord for support</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
