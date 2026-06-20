import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import AdminLayout from '@/components/layout/AdminLayout'

const defaultCompany = {
  company_name: 'Slime Shop',
  tagline: 'Custom 3D printed slime products',
  support_email: '',
  discord_url: '',
  business_hours: '',
  announcement: '',
}

const defaultStatus = {
  store_online: true,
  accepting_orders: true,
  maintenance_mode: false,
  maintenance_title: 'Slime Shop is getting upgraded',
  maintenance_message: 'We are updating the store. Please check back soon.',
  banner_enabled: true,
  banner_message: 'Slime Shop is online and accepting custom orders.',
}

export default function AdminSettingsPage() {
  const [company, setCompany] = useState(defaultCompany)
  const [status, setStatus] = useState(defaultStatus)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/site-settings')
      .then(r => r.json())
      .then(data => {
        setCompany({ ...defaultCompany, ...(data.settings?.company || {}) })
        setStatus({ ...defaultStatus, ...(data.settings?.status || {}) })
      })
      .catch(() => {})
  }, [])

  async function save(key: 'company' | 'status', value: any) {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      toast.success('Saved')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout title="Company Settings">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="slime-card p-6">
          <h2 className="text-2xl font-black">Company Info</h2>
          <p className="mt-2 text-slate-400">This makes the site feel more like a real company.</p>
          <div className="mt-6 grid gap-4">
            <input className="slime-input" placeholder="Company name" value={company.company_name} onChange={e => setCompany({ ...company, company_name: e.target.value })} />
            <input className="slime-input" placeholder="Tagline" value={company.tagline} onChange={e => setCompany({ ...company, tagline: e.target.value })} />
            <input className="slime-input" placeholder="Support email" value={company.support_email} onChange={e => setCompany({ ...company, support_email: e.target.value })} />
            <input className="slime-input" placeholder="Discord URL" value={company.discord_url} onChange={e => setCompany({ ...company, discord_url: e.target.value })} />
            <input className="slime-input" placeholder="Business hours" value={company.business_hours} onChange={e => setCompany({ ...company, business_hours: e.target.value })} />
            <textarea className="slime-input min-h-28" placeholder="Announcement" value={company.announcement} onChange={e => setCompany({ ...company, announcement: e.target.value })} />
            <button disabled={loading} onClick={() => save('company', company)} className="slime-button">Save Company Info</button>
          </div>
        </section>
        <section className="slime-card p-6">
          <h2 className="text-2xl font-black">Online + Maintenance Status</h2>
          <p className="mt-2 text-slate-400">Turn the store on/off, pause orders, or show a maintenance page.</p>
          <div className="mt-6 grid gap-4">
            <Toggle label="Store online" checked={status.store_online} onChange={v => setStatus({ ...status, store_online: v })} />
            <Toggle label="Accepting orders" checked={status.accepting_orders} onChange={v => setStatus({ ...status, accepting_orders: v })} />
            <Toggle label="Maintenance mode" checked={status.maintenance_mode} onChange={v => setStatus({ ...status, maintenance_mode: v })} />
            <Toggle label="Show top banner" checked={status.banner_enabled} onChange={v => setStatus({ ...status, banner_enabled: v })} />
            <input className="slime-input" placeholder="Banner message" value={status.banner_message} onChange={e => setStatus({ ...status, banner_message: e.target.value })} />
            <input className="slime-input" placeholder="Maintenance title" value={status.maintenance_title} onChange={e => setStatus({ ...status, maintenance_title: e.target.value })} />
            <textarea className="slime-input min-h-28" placeholder="Maintenance message" value={status.maintenance_message} onChange={e => setStatus({ ...status, maintenance_message: e.target.value })} />
            <button disabled={loading} onClick={() => save('status', status)} className="slime-button">Save Status</button>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950 px-4 py-3">
      <span className="font-bold">{label}</span>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="h-5 w-5 accent-green-500" />
    </label>
  )
}
