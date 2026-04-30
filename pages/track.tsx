import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { formatDollars, formatDate, timeAgo } from '@/lib/utils'

const STATUS_STEPS = ['Pending','Processing','Printing','Packed','Shipped','Delivered']

const STATUS_ICON: Record<string, string> = {
  Pending:'⏳', Processing:'🔄', Printing:'🖨️', Packed:'📦',
  Shipped:'🚚', Delayed:'⚠️', Delivered:'✅', Cancelled:'❌',
}

export default function TrackPage() {
  const router = useRouter()
  const [orderNum, setOrderNum]   = useState('')
  const [email, setEmail]         = useState('')
  const [order, setOrder]         = useState<any>(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [searched, setSearched]   = useState(false)

  // Pre-fill from query string
  useEffect(() => {
    if (router.query.order) setOrderNum(router.query.order as string)
  }, [router.query.order])

  const handleTrack = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!orderNum.trim()) { setError('Please enter your order number'); return }
    setLoading(true); setError(''); setOrder(null); setSearched(true)
    try {
      const params = new URLSearchParams({ order_number: orderNum.trim() })
      if (email.trim()) params.append('email', email.trim())
      const res  = await fetch(`/api/orders/track?${params}`)
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Order not found'); return }
      setOrder(data.order)
    } catch { setError('Network error — please try again') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (router.query.order) handleTrack()
  }, [router.query.order]) // eslint-disable-line

  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : -1

  return (
    <>
      <Head><title>Track Order — Slime Shop</title></Head>
      <Navbar />
      <main className="pt-20 pb-20 min-h-screen bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 mt-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Track Your Order 📦</h1>
            <p className="text-slate-500">Enter your order number to see the latest status.</p>
          </div>

          {/* Search form */}
          <form onSubmit={handleTrack} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="label">Order Number *</label>
                <input value={orderNum} onChange={e => setOrderNum(e.target.value.toUpperCase())}
                  placeholder="SS-XXXX-XX" className="input font-mono text-base" />
              </div>
              <div>
                <label className="label">Email (optional — for security)</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" className="input" />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold rounded-xl transition-colors">
                {loading ? 'Searching…' : 'Track Order →'}
              </button>
            </div>
          </form>

          {/* Order result */}
          {order && (
            <div className="space-y-5">
              {/* Status */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-0.5">ORDER NUMBER</p>
                    <p className="font-mono font-bold text-xl text-slate-800">{order.order_number}</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'Delayed'   ? 'bg-orange-100 text-orange-700' :
                    order.status === 'Shipped'   ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {STATUS_ICON[order.status]} {order.status}
                  </span>
                </div>

                {/* Delay notice */}
                {order.status === 'Delayed' && order.delay_reason && (
                  <div className="mb-5 p-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700">
                    ⚠️ <strong>Delay:</strong> {order.delay_reason}
                  </div>
                )}

                {/* Progress steps */}
                {order.status !== 'Cancelled' && (
                  <div className="relative flex justify-between mb-6">
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200">
                      <div className="h-full bg-green-500 transition-all duration-500"
                        style={{ width: currentStep >= 0 ? `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }} />
                    </div>
                    {STATUS_STEPS.map((s, i) => (
                      <div key={s} className="relative flex flex-col items-center gap-1.5 z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                          i <= currentStep ? 'bg-green-500 text-white shadow-sm shadow-green-300/50' : 'bg-white border-2 border-slate-200 text-slate-400'
                        }`}>
                          {i < currentStep ? '✓' : STATUS_ICON[s] || (i + 1)}
                        </div>
                        <span className={`text-xs font-semibold hidden sm:block ${i <= currentStep ? 'text-green-700' : 'text-slate-400'}`}>{s}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tracking info */}
                {order.tracking_number && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm">
                    <p className="font-semibold text-green-800 mb-0.5">🚚 Tracking</p>
                    <p className="text-green-700">{order.carrier && `${order.carrier} · `}
                      <span className="font-mono">{order.tracking_number}</span>
                    </p>
                    {order.estimated_delivery && (
                      <p className="text-green-600 text-xs mt-1">Est. delivery: {formatDate(order.estimated_delivery)}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Status history */}
              {order.order_status_history?.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-bold text-slate-800 mb-4">Order Timeline</h3>
                  <div className="relative pl-5">
                    <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-slate-200" />
                    {[...order.order_status_history].reverse().map((h: any, i: number) => (
                      <div key={i} className="relative mb-4 last:mb-0">
                        <div className="absolute -left-3.5 top-1 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{STATUS_ICON[h.status]} {h.status}</p>
                            {h.note && <p className="text-slate-500 text-xs mt-0.5">{h.note}</p>}
                          </div>
                          <span className="text-xs text-slate-400 shrink-0">{timeAgo(h.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Items */}
              {order.order_items?.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-bold text-slate-800 mb-4">Items Ordered</h3>
                  <div className="space-y-3">
                    {order.order_items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <div>
                          <p className="font-semibold text-slate-800">{item.product_name} ×{item.quantity}</p>
                          {item.customization && Object.values(item.customization).some(Boolean) && (
                            <p className="text-slate-400 text-xs">{Object.values(item.customization).filter(Boolean).join(' · ')}</p>
                          )}
                        </div>
                        <span className="font-semibold text-slate-700">{formatDollars(item.unit_price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-slate-800">
                      <span>Total</span>
                      <span className="text-green-600">{formatDollars(order.total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {searched && !order && !loading && !error && (
            <div className="text-center py-12 bg-white rounded-3xl border">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-slate-500">No order found with that number.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
