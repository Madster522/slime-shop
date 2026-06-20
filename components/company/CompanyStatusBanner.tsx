import React, { useEffect, useState } from 'react'
import Link from 'next/link'

type PublicSettings = {
  status?: {
    store_online?: boolean
    accepting_orders?: boolean
    maintenance_mode?: boolean
    banner_enabled?: boolean
    banner_message?: string
  }
}

export default function CompanyStatusBanner() {
  const [settings, setSettings] = useState<PublicSettings | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/site-settings')
      .then(r => r.json())
      .then(data => {
        if (!cancelled) setSettings(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const status = settings?.status
  if (!status?.banner_enabled) return null

  const online = Boolean(status.store_online && status.accepting_orders && !status.maintenance_mode)
  const message = status.banner_message || (online ? 'Slime Shop is online and accepting orders.' : 'Slime Shop is currently limited.')

  return (
    <div className={`w-full border-b px-4 py-2 text-center text-sm font-semibold ${online ? 'bg-green-500/10 border-green-500/20 text-green-200' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-100'}`}>
      <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${online ? 'bg-green-400' : 'bg-yellow-300'}`} />
      {message}
      <Link href="/status" className="ml-3 underline decoration-dotted underline-offset-4">
        Status
      </Link>
    </div>
  )
}
