import { useEffect, useState } from 'react'

type Settings = any

export default function StatusPage() {
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    fetch('/api/site-settings').then(r => r.json()).then(setSettings).catch(() => {})
  }, [])

  const status = settings?.status || {}
  const company = settings?.company || {}
  const online = status.store_online && status.accepting_orders && !status.maintenance_mode

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-4xl">
        <div className="slime-card p-8">
          <p className="text-green-300 font-bold">Public Status</p>
          <h1 className="mt-2 text-4xl font-black">{company.company_name || 'Slime Shop'} Status</h1>
          <p className="mt-3 text-slate-400">{company.tagline || 'Live store status and company information.'}</p>
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-4">
              <span className={`h-5 w-5 rounded-full ${online ? 'bg-green-400' : 'bg-yellow-300'}`} />
              <div>
                <h2 className="text-2xl font-black">{online ? 'Online' : status.maintenance_mode ? 'Maintenance' : 'Limited'}</h2>
                <p className="text-slate-400">{online ? 'The store is online and accepting orders.' : 'The store is not fully accepting orders right now.'}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <StatusCard label="Website" value={status.store_online ? 'Online' : 'Offline'} good={status.store_online} />
            <StatusCard label="Orders" value={status.accepting_orders ? 'Accepting' : 'Paused'} good={status.accepting_orders} />
            <StatusCard label="Maintenance" value={status.maintenance_mode ? 'Enabled' : 'Off'} good={!status.maintenance_mode} />
          </div>
          <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950 p-5 text-slate-300">
            <h3 className="font-black text-white">Company Info</h3>
            <p className="mt-2">Hours: {company.business_hours || 'Not set'}</p>
            <p>Support: {company.support_email || 'Not set'}</p>
            {company.announcement ? <p className="mt-3 text-green-300">{company.announcement}</p> : null}
          </div>
        </div>
      </section>
    </main>
  )
}

function StatusCard({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={good ? 'mt-1 text-xl font-black text-green-300' : 'mt-1 text-xl font-black text-yellow-200'}>{value}</p>
    </div>
  )
}
