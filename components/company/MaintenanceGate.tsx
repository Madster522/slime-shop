import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'

type PublicSettings = {
  company?: {
    company_name?: string
    support_email?: string
    discord_url?: string
  }
  status?: {
    maintenance_mode?: boolean
    maintenance_title?: string
    maintenance_message?: string
  }
}

const ALLOWED_DURING_MAINTENANCE = ['/maintenance', '/status', '/auth/signin', '/auth/error']

export default function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [settings, setSettings] = useState<PublicSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetch('/api/site-settings')
      .then(r => r.json())
      .then(data => {
        if (!cancelled) setSettings(data)
      })
      .catch(() => {
        if (!cancelled) setSettings(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const path = router.pathname
  const isAdminRoute = path.startsWith('/admin')
  const isAllowed = ALLOWED_DURING_MAINTENANCE.includes(path) || isAdminRoute
  const isAdmin = Boolean(session?.user?.isAdmin)
  const maintenance = Boolean(settings?.status?.maintenance_mode)

  if (!loading && maintenance && !isAllowed && !isAdmin) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <section className="max-w-xl w-full rounded-3xl border border-green-500/30 bg-slate-900/90 p-8 shadow-2xl text-center">
          <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-green-500/15 flex items-center justify-center text-3xl">🛠️</div>
          <p className="text-green-300 text-sm font-bold uppercase tracking-[0.2em]">Maintenance Mode</p>
          <h1 className="mt-3 text-3xl font-black">{settings?.status?.maintenance_title || 'Slime Shop is getting upgraded'}</h1>
          <p className="mt-4 text-slate-300 leading-relaxed">{settings?.status?.maintenance_message || 'We are updating the store. Please check back soon.'}</p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/status" className="rounded-xl bg-green-500 px-5 py-3 font-bold text-slate-950 hover:bg-green-400 transition-colors">View Status</Link>
            {settings?.company?.discord_url ? (
              <a href={settings.company.discord_url} className="rounded-xl border border-white/10 px-5 py-3 font-bold hover:bg-white/10 transition-colors">Join Discord</a>
            ) : null}
          </div>
        </section>
      </main>
    )
  }

  return <>{children}</>
}
