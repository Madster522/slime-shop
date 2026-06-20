import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import AdminLayout from '@/components/layout/AdminLayout'
import { formatMoney } from '@/lib/utils'

const blank = {
  code: '',
  name: '',
  description: '',
  type: 'percent',
  value: 10,
  min_order_amount: '',
  max_discount_amount: '',
  max_uses: '',
  starts_at: '',
  expires_at: '',
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [form, setForm] = useState<any>(blank)
  const [loading, setLoading] = useState(false)

  async function loadCoupons() {
    const res = await fetch('/api/admin/coupons')
    const data = await res.json()
    setCoupons(data.coupons || [])
  }

  useEffect(() => { loadCoupons().catch(() => {}) }, [])

  async function createCoupon() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not create coupon')
      toast.success('Coupon created')
      setForm(blank)
      await loadCoupons()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function toggle(coupon: any) {
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !coupon.is_active }),
    })
    if (!res.ok) return toast.error('Update failed')
    toast.success('Updated')
    loadCoupons().catch(() => {})
  }

  async function remove(id: string) {
    if (!confirm('Delete this coupon?')) return
    const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    if (!res.ok) return toast.error('Delete failed')
    toast.success('Deleted')
    loadCoupons().catch(() => {})
  }

  return (
    <AdminLayout title="Coupons">
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <section className="slime-card h-fit p-6">
          <h2 className="text-2xl font-black">Create Safe Coupon</h2>
          <p className="mt-2 text-sm text-slate-400">Coupons are checked so they never make the order total negative.</p>
          <div className="mt-5 grid gap-3">
            <input className="slime-input" placeholder="Code ex: SAVE10" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
            <input className="slime-input" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <textarea className="slime-input min-h-24" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <select className="slime-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="percent">Percent off</option>
              <option value="fixed">Fixed dollars off</option>
            </select>
            <input className="slime-input" type="number" min={0} max={form.type === 'percent' ? 100 : undefined} step="0.01" placeholder="Value" value={form.value} onChange={e => setForm({ ...form, value: Number(e.target.value) })} />
            <input className="slime-input" type="number" min={0} step="0.01" placeholder="Minimum order amount" value={form.min_order_amount} onChange={e => setForm({ ...form, min_order_amount: e.target.value })} />
            {form.type === 'percent' ? <input className="slime-input" type="number" min={0} step="0.01" placeholder="Max discount amount" value={form.max_discount_amount} onChange={e => setForm({ ...form, max_discount_amount: e.target.value })} /> : null}
            <input className="slime-input" type="number" min={0} placeholder="Max uses" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: e.target.value })} />
            <label className="text-sm text-slate-400">Starts at <input className="slime-input mt-1" type="datetime-local" value={form.starts_at} onChange={e => setForm({ ...form, starts_at: e.target.value })} /></label>
            <label className="text-sm text-slate-400">Expires at <input className="slime-input mt-1" type="datetime-local" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} /></label>
            <button disabled={loading} onClick={createCoupon} className="slime-button">Create Coupon</button>
          </div>
        </section>
        <section className="grid gap-4">
          {coupons.map(coupon => (
            <article key={coupon.id} className="slime-card p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h3 className="text-xl font-black">{coupon.code}</h3>
                  <p className="text-slate-400">{coupon.type === 'percent' ? `${coupon.value}% off` : `${formatMoney(Number(coupon.value))} off`} · Used {coupon.used_count || 0}{coupon.max_uses ? `/${coupon.max_uses}` : ''}</p>
                  <p className={coupon.is_active ? 'mt-1 text-sm font-bold text-green-300' : 'mt-1 text-sm font-bold text-yellow-200'}>{coupon.is_active ? 'Active' : 'Inactive'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggle(coupon)} className="slime-button-secondary">{coupon.is_active ? 'Disable' : 'Enable'}</button>
                  <button onClick={() => remove(coupon.id)} className="slime-button-secondary">Delete</button>
                </div>
              </div>
            </article>
          ))}
          {!coupons.length ? <div className="slime-card p-8 text-center text-slate-400">No coupons yet.</div> : null}
        </section>
      </div>
    </AdminLayout>
  )
}
