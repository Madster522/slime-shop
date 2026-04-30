import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/layout/AdminLayout'
import { formatDollars, formatDateTime, timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

const ORDER_STATUSES = ['Pending','Processing','Printing','Packed','Shipped','Delayed','Delivered','Cancelled']
const STATUS_ICONS: Record<string,string> = {
  Pending:'⏳',Processing:'🔄',Printing:'🖨️',Packed:'📦',
  Shipped:'🚚',Delayed:'⚠️',Delivered:'✅',Cancelled:'❌',
}

export default function AdminOrderDetailPage() {
  const router = useRouter()
  const { id } = router.query

  const [order, setOrder]                   = useState<any>(null)
  const [printers, setPrinters]             = useState<any[]>([])
  const [loading, setLoading]               = useState(true)
  const [status, setStatus]                 = useState('')
  const [note, setNote]                     = useState('')
  const [internalNote, setInternalNote]     = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrier, setCarrier]               = useState('')
  const [estimatedDelivery, setEstimatedDelivery] = useState('')
  const [delayReason, setDelayReason]       = useState('')
  const [saving, setSaving]                 = useState(false)
  const [showRefund, setShowRefund]         = useState(false)
  const [refundReason, setRefundReason]     = useState('')
  const [refunding, setRefunding]           = useState(false)

  const fetchOrder = async () => {
    if (!id) return
    try {
      const res  = await fetch(`/api/admin/orders/${id}`)
      const data = await res.json()
      if (data.order) {
        setOrder(data.order)
        setStatus(data.order.status || 'Pending')
        setTrackingNumber(data.order.tracking_number || '')
        setCarrier(data.order.carrier || '')
        setEstimatedDelivery(data.order.estimated_delivery || '')
        setDelayReason(data.order.delay_reason || '')
      }
    } catch { toast.error('Failed to load order') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchOrder() }, [id])
  useEffect(() => {
    fetch('/api/admin/printers').then(r => r.json()).then(d => setPrinters(d.printers || [])).catch(() => {})
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          note: note || null,
          internal_note: internalNote || null,
          tracking_number: trackingNumber || null,
          carrier: carrier || null,
          estimated_delivery: estimatedDelivery || null,
          delay_reason: status === 'Delayed' ? delayReason : null,
        }),
      })
      if (res.ok) {
        toast.success('Order updated!')
        setNote('')
        setInternalNote('')
        fetchOrder()
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to update')
      }
    } finally { setSaving(false) }
  }

  const handleRefund = async () => {
    if (!confirm(`Refund order ${order?.order_number}? Cannot be undone.`)) return
    setRefunding(true)
    try {
      const res = await fetch(`/api/admin/orders/${id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: refundReason }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Refund issued!')
        setShowRefund(false)
        fetchOrder()
      } else {
        toast.error(data.error || 'Refund failed')
      }
    } finally { setRefunding(false) }
  }

  if (loading) {
    return (
      <AdminLayout title="Order">
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  if (!order) {
    return (
      <AdminLayout title="Not Found">
        <div className="text-center py-24">
          <p className="text-5xl mb-4">❌</p>
          <p className="text-white font-bold text-xl mb-4">Order not found</p>
          <button onClick={() => router.push('/admin/orders')} className="px-5 py-2.5 bg-slate-700 text-white rounded-xl font-semibold">
            ← Back to Orders
          </button>
        </div>
      </AdminLayout>
    )
  }

  const history    = order.order_status_history || []
  const items      = order.order_items || []
  const isRefunded = order.payment_status === 'refunded'
  const isPaid     = order.payment_status === 'paid'

  return (
    <>
      <Head><title>Order {order.order_number} — Admin</title></Head>
      <AdminLayout title={`Order ${order.order_number}`}>

        {/* Header */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <button onClick={() => router.push('/admin/orders')} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{order.order_number}</h1>
            <p className="text-xs text-slate-500">{formatDateTime(order.created_at)}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
            status === 'Delivered' ? 'bg-green-900/40 text-green-300 border-green-700' :
            status === 'Shipped'   ? 'bg-blue-900/40 text-blue-300 border-blue-700' :
            status === 'Printing'  ? 'bg-purple-900/40 text-purple-300 border-purple-700' :
            status === 'Delayed'   ? 'bg-orange-900/40 text-orange-300 border-orange-700' :
            status === 'Cancelled' ? 'bg-red-900/40 text-red-300 border-red-700' :
            'bg-slate-700 text-slate-300 border-slate-600'
          }`}>
            {STATUS_ICONS[status]} {status}
          </span>
          {isRefunded && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-900/40 text-pink-300 border border-pink-700">
              💸 Refunded
            </span>
          )}
          {isPaid && !isRefunded && (
            <button onClick={() => setShowRefund(!showRefund)}
              className="ml-auto px-4 py-2 bg-red-700 hover:bg-red-600 active:scale-95 text-white rounded-xl font-semibold text-sm transition-all">
              💸 Issue Refund
            </button>
          )}
        </div>

        {/* Refund panel */}
        {showRefund && (
          <div className="mb-6 p-5 bg-red-950/40 border border-red-700/50 rounded-2xl">
            <h3 className="text-red-300 font-bold mb-2">Issue Refund — {order.order_number}</h3>
            <p className="text-slate-400 text-sm mb-4">
              This marks the order as Refunded + Cancelled in the system.
              Remember to also send the money back to the customer manually.
            </p>
            <div className="mb-4">
              <label className="text-slate-400 text-xs font-semibold block mb-1">REASON (optional)</label>
              <input value={refundReason} onChange={e => setRefundReason(e.target.value)}
                placeholder="Customer request, damaged item, etc."
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowRefund(false)}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold text-sm">
                Cancel
              </button>
              <button onClick={handleRefund} disabled={refunding}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition-colors">
                {refunding ? 'Processing…' : '💸 Confirm Refund'}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-5">

            {/* Status update */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-white font-bold text-lg mb-4">Update Status</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {ORDER_STATUSES.map(s => (
                  <button key={s} onClick={() => setStatus(s)}
                    className={`p-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                      status === s
                        ? 'border-green-400 bg-green-900/30 text-green-300'
                        : 'border-slate-600 text-slate-400 hover:border-slate-500'
                    }`}>
                    {STATUS_ICONS[s]} {s}
                  </button>
                ))}
              </div>
              <div className="mb-4">
                <label className="text-slate-400 text-xs font-semibold block mb-1">NOTE FOR CUSTOMER</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                  placeholder="e.g. Your item is now printing!"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
              </div>
              <div className="mb-4">
                <label className="text-slate-400 text-xs font-semibold block mb-1">INTERNAL NOTE (admin only)</label>
                <textarea value={internalNote} onChange={e => setInternalNote(e.target.value)} rows={2}
                  placeholder="Private notes…"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
              </div>
              {status === 'Delayed' && (
                <div className="mb-4 p-4 bg-orange-900/20 border border-orange-700/40 rounded-xl">
                  <label className="text-orange-300 text-xs font-semibold block mb-1">DELAY REASON (shown to customer)</label>
                  <textarea value={delayReason} onChange={e => setDelayReason(e.target.value)} rows={2}
                    placeholder="e.g. Filament delay — back on track Friday."
                    className="w-full bg-slate-700 border border-orange-600/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
                </div>
              )}
            </div>

            {/* Shipping */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-white font-bold text-lg mb-4">Shipping Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1">CARRIER</label>
                  <select value={carrier} onChange={e => setCarrier(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                    <option value="">Select carrier…</option>
                    {['USPS','UPS','FedEx','DHL','Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1">TRACKING NUMBER</label>
                  <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
                    placeholder="9400111…"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1">ESTIMATED DELIVERY</label>
                  <input type="date" value={estimatedDelivery} onChange={e => setEstimatedDelivery(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
              </div>
            </div>

            <button onClick={handleSave} disabled={saving}
              className="w-full py-4 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold rounded-xl text-lg transition-colors">
              {saving ? 'Saving…' : '💾 Save Changes'}
            </button>

            {/* Items */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700">
                <h2 className="text-white font-bold text-lg">Order Items</h2>
              </div>
              {items.length === 0 ? (
                <div className="px-6 py-8 text-center text-slate-500 text-sm">No items</div>
              ) : items.map((item: any) => (
                <div key={item.id} className="px-6 py-4 flex items-center gap-4 border-b border-slate-700 last:border-0">
                  <div className="w-12 h-12 bg-green-900/30 rounded-xl flex items-center justify-center text-2xl shrink-0">🟢</div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{item.product_name}</p>
                    <p className="text-slate-400 text-xs">Qty: {item.quantity}</p>
                    {item.customization && Object.keys(item.customization).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.values(item.customization).filter(Boolean).map((v: any, i: number) => (
                          <span key={i} className="text-xs bg-green-900/40 text-green-300 px-2 py-0.5 rounded-full">{v}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-white text-sm">{formatDollars(item.unit_price * item.quantity)}</p>
                    <p className="text-slate-500 text-xs">+{formatDollars(item.shipping_price || 0)} ship</p>
                  </div>
                </div>
              ))}
              <div className="px-6 py-4 bg-slate-900/50 space-y-1">
                <div className="flex justify-between text-sm text-slate-400"><span>Subtotal</span><span>{formatDollars(order.subtotal || 0)}</span></div>
                <div className="flex justify-between text-sm text-slate-400"><span>Shipping</span><span>{formatDollars(order.shipping_total || 0)}</span></div>
                {(order.discount > 0) && (
                  <div className="flex justify-between text-sm text-green-400"><span>Discount</span><span>−{formatDollars(order.discount)}</span></div>
                )}
                <div className="flex justify-between font-bold text-white text-base pt-1 border-t border-slate-700 mt-1">
                  <span>Total</span><span className="text-green-400">{formatDollars(order.total || 0)}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            {history.length > 0 && (
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                <h2 className="text-white font-bold text-lg mb-5">Status History</h2>
                <div className="relative pl-6">
                  <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-slate-700" />
                  {[...history].reverse().map((ev: any, i: number) => (
                    <div key={i} className="relative mb-5 last:mb-0">
                      <div className="absolute -left-4 top-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-slate-800" />
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-white font-semibold text-sm">{STATUS_ICONS[ev.status] || ''} {ev.status}</p>
                          {ev.note && <p className="text-slate-400 text-xs mt-0.5">{ev.note}</p>}
                          {ev.changed_by && <p className="text-slate-600 text-xs">by {ev.changed_by}</p>}
                        </div>
                        <span className="text-slate-500 text-xs shrink-0">{timeAgo(ev.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
              <h3 className="text-white font-bold mb-3">Customer</h3>
              <p className="text-white font-semibold">{order.customer_name}</p>
              <a href={`mailto:${order.customer_email}`} className="text-green-400 text-sm hover:underline">
                {order.customer_email}
              </a>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
              <h3 className="text-white font-bold mb-3">Ship To</h3>
              <div className="text-slate-300 text-sm space-y-0.5">
                <p className="font-semibold">{order.shipping_address?.full_name}</p>
                <p>{order.shipping_address?.line1}</p>
                {order.shipping_address?.line2 && <p>{order.shipping_address.line2}</p>}
                <p>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip}</p>
              </div>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
              <h3 className="text-white font-bold mb-3">Payment</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className={`font-bold ${
                    isRefunded ? 'text-pink-400' :
                    isPaid     ? 'text-green-400' :
                    'text-yellow-400'
                  }`}>
                    {isRefunded ? '💸 Refunded' : isPaid ? '✅ Paid' : '⏳ ' + order.payment_status}
                  </span>
                </div>
                {order.card_last4 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Card</span>
                    <span className="text-slate-300 font-mono text-xs">{order.card_brand} •••• {order.card_last4}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-slate-700">
                  <span className="text-slate-500">Total</span>
                  <span className="text-green-400 font-bold">{formatDollars(order.total || 0)}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
              <h3 className="text-white font-bold mb-3">Printer Assignment</h3>
              <select className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                <option value="">Unassigned</option>
                {printers.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.status})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  )
}