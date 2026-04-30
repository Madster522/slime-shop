import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import AdminLayout from '@/components/layout/AdminLayout'
import toast from 'react-hot-toast'

type ConnectionType = 'octoprint' | 'bambu' | 'network' | 'usb'

const CONNECTION_TYPES: { value: ConnectionType; label: string; desc: string }[] = [
  { value: 'octoprint', label: 'OctoPrint',     desc: 'Raspberry Pi / OctoPrint on your network' },
  { value: 'bambu',     label: 'Bambu Lab',      desc: 'Bambu X1, P1, A1 via LAN mode' },
  { value: 'network',   label: 'Network / WiFi', desc: 'Generic network printer with IP address' },
  { value: 'usb',       label: 'USB',            desc: 'Printer connected directly via USB' },
]

const STATUS_COLORS: Record<string, string> = {
  idle:     'bg-green-900/40 text-green-300 border-green-700',
  printing: 'bg-blue-900/40 text-blue-300 border-blue-700',
  error:    'bg-red-900/40 text-red-300 border-red-700',
  offline:  'bg-slate-700 text-slate-400 border-slate-600',
  unknown:  'bg-slate-700 text-slate-400 border-slate-600',
}

const emptyForm = {
  name: '', type: 'FDM', connection_type: 'octoprint' as ConnectionType,
  ip_address: '', port: '80', api_key: '',
  access_code: '', serial_number: '', notes: '',
}

export default function AdminPrintersPage() {
  const [printers, setPrinters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [pinging, setPinging] = useState<string | null>(null)
  const [liveStatus, setLiveStatus] = useState<Record<string, any>>({})
  const [bridgeOnline, setBridgeOnline] = useState(false)

  const fetchPrinters = async () => {
    try {
      const res = await fetch('/api/admin/printers')
      const data = await res.json()
      setPrinters(data.printers || [])
    } catch { toast.error('Failed to load printers') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchPrinters()
    // Check local bridge
    fetch('http://localhost:5001/health', { signal: AbortSignal.timeout(2000) })
      .then(r => r.ok ? setBridgeOnline(true) : setBridgeOnline(false))
      .catch(() => setBridgeOnline(false))
  }, [])

  const handleAdd = async () => {
    if (!form.name || !form.connection_type) { toast.error('Name and connection type are required'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/printers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, type: form.type,
          connection_type: form.connection_type,
          ip_address: form.ip_address || null,
          port: form.port ? Number(form.port) : 80,
          api_key: form.api_key || null,
          access_code: form.access_code || null,
          serial_number: form.serial_number || null,
          notes: form.notes || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      toast.success(`${form.name} added!`)
      setShowAdd(false)
      setForm(emptyForm)
      fetchPrinters()
    } catch { toast.error('Network error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (printer: any) => {
    if (!confirm(`Delete "${printer.name}"? This cannot be undone.`)) return
    const res = await fetch(`/api/admin/printers/${printer.id}`, { method: 'DELETE' })
    if (res.ok) { toast.success(`${printer.name} deleted`); fetchPrinters() }
    else toast.error('Failed to delete')
  }

  const handlePing = async (printer: any) => {
    setPinging(printer.id)
    try {
      const res = await fetch(`/api/admin/printers/${printer.id}/ping`)
      const data = await res.json()
      setLiveStatus(prev => ({ ...prev, [printer.id]: data }))
      if (data.online) toast.success(`${printer.name} is ${data.status}`)
      else toast.error(`${printer.name} is offline or unreachable`)
    } catch { toast.error('Could not ping printer') }
    finally { setPinging(null) }
  }

  const f = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <>
      <Head><title>Printers — Admin</title></Head>
      <AdminLayout title="Printers">

        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-slate-400 text-sm">{loading ? 'Loading…' : `${printers.length} printer${printers.length !== 1 ? 's' : ''}`}</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)}
            className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-sm transition-colors">
            + Add Printer
          </button>
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-bold text-lg mb-5">Add New Printer</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1">PRINTER NAME *</label>
                <input value={form.name} onChange={e => f('name', e.target.value)} placeholder="e.g. Bambu X1 Carbon"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1">PRINTER TYPE</label>
                <select value={form.type} onChange={e => f('type', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                  {['FDM','SLA','MSLA','SLS','Inkjet','Laser'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Connection type */}
            <div className="mb-4">
              <label className="text-slate-400 text-xs font-semibold block mb-2">CONNECTION TYPE *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CONNECTION_TYPES.map(ct => (
                  <button key={ct.value} onClick={() => f('connection_type', ct.value)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${form.connection_type === ct.value ? 'border-green-400 bg-green-900/20' : 'border-slate-600 hover:border-slate-500'}`}>
                    <p className={`font-semibold text-sm ${form.connection_type === ct.value ? 'text-green-300' : 'text-white'}`}>{ct.label}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{ct.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* OctoPrint / Network fields */}
            {(form.connection_type === 'octoprint' || form.connection_type === 'network') && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="sm:col-span-2">
                  <label className="text-slate-400 text-xs font-semibold block mb-1">IP ADDRESS</label>
                  <input value={form.ip_address} onChange={e => f('ip_address', e.target.value)} placeholder="192.168.1.100"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1">PORT</label>
                  <input value={form.port} onChange={e => f('port', e.target.value)} placeholder="80"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                {form.connection_type === 'octoprint' && (
                  <div className="sm:col-span-3">
                    <label className="text-slate-400 text-xs font-semibold block mb-1">OCTOPRINT API KEY
                      <span className="text-slate-600 ml-2 font-normal">(OctoPrint → Settings → API)</span>
                    </label>
                    <input value={form.api_key} onChange={e => f('api_key', e.target.value)} placeholder="Paste API key"
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-400" />
                  </div>
                )}
              </div>
            )}

            {/* Bambu fields */}
            {form.connection_type === 'bambu' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1">IP ADDRESS
                    <span className="text-slate-600 ml-1 font-normal">(Bambu app → Device)</span>
                  </label>
                  <input value={form.ip_address} onChange={e => f('ip_address', e.target.value)} placeholder="192.168.1.x"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1">ACCESS CODE
                    <span className="text-slate-600 ml-1 font-normal">(on printer screen)</span>
                  </label>
                  <input value={form.access_code} onChange={e => f('access_code', e.target.value)} placeholder="12345678"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-slate-400 text-xs font-semibold block mb-1">SERIAL NUMBER
                    <span className="text-slate-600 ml-1 font-normal">(back of printer)</span>
                  </label>
                  <input value={form.serial_number} onChange={e => f('serial_number', e.target.value)} placeholder="01S00C123456789"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div className="sm:col-span-2 p-3 bg-blue-900/20 border border-blue-700/40 rounded-xl text-xs text-blue-300">
                  ℹ️ Enable LAN mode on your printer: Settings → LAN Mode → Enable. Also start the local bridge:
                  <code className="font-mono ml-1 bg-black/30 px-1 rounded">npm run bridge</code>
                </div>
              </div>
            )}

            {/* USB info */}
            {form.connection_type === 'usb' && (
              <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700/40 rounded-xl text-xs text-yellow-300">
                ℹ️ USB requires the local bridge service. Start it with:
                <code className="font-mono ml-1 bg-black/30 px-1 rounded">npm run bridge</code>
              </div>
            )}

            <div className="mb-4">
              <label className="text-slate-400 text-xs font-semibold block mb-1">NOTES (optional)</label>
              <input value={form.notes} onChange={e => f('notes', e.target.value)} placeholder="e.g. In the workshop, green filament loaded"
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setShowAdd(false); setForm(emptyForm) }}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors">
                Cancel
              </button>
              <button onClick={handleAdd} disabled={saving}
                className="px-5 py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white rounded-xl font-semibold transition-colors">
                {saving ? 'Adding…' : 'Add Printer'}
              </button>
            </div>
          </div>
        )}

        {/* Printer list */}
        {loading ? (
          <div className="text-center py-16 text-slate-500 text-sm">Loading printers…</div>
        ) : printers.length === 0 ? (
          <div className="text-center py-24 bg-slate-800 rounded-2xl border border-slate-700">
            <p className="text-5xl mb-4">🖨️</p>
            <p className="text-white font-semibold text-lg mb-2">No printers added yet</p>
            <p className="text-slate-500 text-sm mb-6">Add your first printer using the button above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {printers.map(printer => {
              const live = liveStatus[printer.id]
              const displayStatus = live?.status || printer.status
              return (
                <div key={printer.id} className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-white font-bold text-lg">{printer.name}</h3>
                      <p className="text-slate-400 text-sm">{printer.type} · {printer.connection_type}</p>
                      {printer.ip_address && (
                        <p className="text-slate-500 text-xs font-mono mt-0.5">{printer.ip_address}:{printer.port}</p>
                      )}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[displayStatus] || STATUS_COLORS.unknown}`}>
                      {displayStatus}
                    </span>
                  </div>

                  {/* Live job */}
                  {live?.job && (
                    <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700/40 rounded-xl">
                      <p className="text-blue-300 text-xs font-semibold mb-1">🖨️ {live.job.name}</p>
                      <div className="w-full bg-slate-700 rounded-full h-1.5 mb-1">
                        <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${live.job.progress}%` }} />
                      </div>
                      <p className="text-blue-400 text-xs">{Math.round(live.job.progress)}%</p>
                    </div>
                  )}

                  {/* Temperatures */}
                  {live?.temperatures && (
                    <div className="flex gap-3 mb-4 text-xs">
                      <span className="text-orange-400">🌡️ {live.temperatures.hotend}°C</span>
                      <span className="text-yellow-400">🛏️ {live.temperatures.bed}°C</span>
                    </div>
                  )}

                  {printer.notes && <p className="text-slate-500 text-xs mb-4">{printer.notes}</p>}

                  <div className="flex gap-2">
                    <button onClick={() => handlePing(printer)} disabled={pinging === printer.id}
                      className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors">
                      {pinging === printer.id ? '⟳ Pinging…' : '📡 Check Status'}
                    </button>
                    <button onClick={() => handleDelete(printer)}
                      className="px-4 py-2 bg-red-900/40 hover:bg-red-900 text-red-300 rounded-xl text-xs font-semibold transition-colors">
                      🗑 Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Bridge status */}
        <div className={`mt-6 p-4 rounded-xl border text-sm ${bridgeOnline ? 'bg-green-900/20 border-green-700/40 text-green-300' : 'bg-yellow-900/20 border-yellow-700/40 text-yellow-300'}`}>
          {bridgeOnline ? (
            <p>✅ Local bridge is running — USB and Bambu printers can connect</p>
          ) : (
            <p>⚠️ Local bridge not running — USB/Bambu won&apos;t connect. Start it:
              <code className="font-mono bg-black/30 px-1.5 py-0.5 rounded ml-2">npm run bridge</code>
            </p>
          )}
        </div>

      </AdminLayout>
    </>
  )
}
