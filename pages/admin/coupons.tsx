import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import AdminLayout from '@/components/layout/AdminLayout'
import { formatDollars, timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

const empty = { code: '', type: 'percent', value: '', min_order_amount: '', max_discount_amount: '', max_uses: '', expires_at: '', description: '' }

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]       = useState(empty)
  const [saving, setSaving]   = useState(false)

  const fetchCoupons = () => fetch('/api/admin/coupons').then(r => r.json()).then(d => { setCoupons(d.coupons || []); setLoading(false) }).catch(() => setLoading(false))
  useEffect(() => { fetchCoupons() }, [])

  const handleCreate = async () => {
    if (!form.code || !form.value) { toast.error('Code and value are required'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      toast.success('Coupon created!')
      setShowForm(false); setForm(empty); fetchCoupons()
    } finally { setSaving(false) }
  }

  const toggle = async (c: any) => {
    await fetch(`/api/admin/coupons/${c.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !c.is_active }) })
    fetchCoupons()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this coupon?')) return
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    toast.success('Deleted'); fetchCoupons()
  }

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  return (
    <>
      <Head><title>Coupons — Admin</title></Head>
      <AdminLayout title="Discount Coupons 🎟️">
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-400 text-sm">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''}</p>
          <button onClick={() => setShowForm(!showForm)} className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold text-sm transition-colors">
            + New Coupon
          </button>
        </div>

        {showForm && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-bold text-lg mb-5">Create Coupon</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1">CODE *</label>
                <input value={form.code} onChange={e => f('code', e.target.value.toUpperCase())} placeholder="SLIME20"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1">TYPE</label>
                <select value={form.type} onChange={e => f('type', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                  <option value="percent">% Percent Off</option>
                  <option value="fixed">$ Fixed Amount Off</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1">VALUE * {form.type === 'percent' ? '(%)' : '($)'}</label>
                <input type="number" min="0" value={form.value} onChange={e => f('value', e.target.value)} placeholder={form.type === 'percent' ? '20' : '5.00'}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1">MIN ORDER ($)</label>
                <input type="number" min="0" value={form.min_order_amount} onChange={e => f('min_order_amount', e.target.value)} placeholder="0.00"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              {form.type === 'percent' && (
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1">MAX DISCOUNT ($)</label>
                  <input type="number" min="0" value={form.max_discount_amount} onChange={e => f('max_discount_amount', e.target.value)} placeholder="No limit"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
              )}
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1">MAX USES</label>
                <input type="number" min="0" value={form.max_uses} onChange={e => f('max_uses', e.target.value)} placeholder="Unlimited"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1">EXPIRES AT</label>
                <input type="datetime-local" value={form.expires_at} onChange={e => f('expires_at', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1">DESCRIPTION</label>
                <input value={form.description} onChange={e => f('description', e.target.value)} placeholder="Summer sale..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowForm(false); setForm(empty) }} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="px-5 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white rounded-xl font-semibold transition-colors">
                {saving ? 'Creating…' : 'Create Coupon'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-slate-500">Loading coupons…</div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16 bg-slate-800 rounded-2xl border border-slate-700">
            <p className="text-4xl mb-3">🎟️</p>
            <p className="text-white font-semibold mb-1">No coupons yet</p>
            <p className="text-slate-500 text-sm">Create a coupon to offer discounts to your customers</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {coupons.map(c => (
              <div key={c.id} className={`bg-slate-800 rounded-2xl border p-5 ${c.is_active ? 'border-slate-700' : 'border-slate-700 opacity-60'}`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-mono font-bold text-lg text-white">{c.code}</p>
                    {c.description && <p className="text-slate-400 text-xs mt-0.5">{c.description}</p>}
                  </div>
                  <button onClick={() => toggle(c)}
                    className={`w-10 h-6 rounded-full transition-all relative shrink-0 mt-1 ${c.is_active ? 'bg-green-500' : 'bg-slate-600'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${c.is_active ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div className="bg-slate-700/50 rounded-xl p-2.5">
                    <p className="text-green-400 font-bold text-base">
                      {c.type === 'percent' ? `${c.value}% off` : formatDollars(c.value)}
                    </p>
                    <p className="text-slate-500 text-xs">Discount</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-2.5">
                    <p className="text-white font-bold text-base">{c.used_count}</p>
                    <p className="text-slate-500 text-xs">{c.max_uses ? `of ${c.max_uses} uses` : 'uses'}</p>
                  </div>
                </div>

                <div className="space-y-1 text-xs mb-4">
                  {c.min_order_amount && <p className="text-slate-400">Min order: {formatDollars(c.min_order_amount)}</p>}
                  {c.max_discount_amount && <p className="text-slate-400">Max discount: {formatDollars(c.max_discount_amount)}</p>}
                  {c.expires_at && <p className="text-slate-400">Expires: {new Date(c.expires_at).toLocaleDateString()}</p>}
                </div>

                <button onClick={() => del(c.id)} className="w-full py-1.5 bg-red-900/40 hover:bg-red-900 text-red-300 rounded-xl text-xs font-semibold transition-colors">
                  🗑 Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </AdminLayout>
    </>
  )
}
