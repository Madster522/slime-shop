import React, { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import AdminLayout from '@/components/layout/AdminLayout'
import { timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

const ALERT_TYPE_LABELS: Record<string, string> = {
  spaghetti_failure:   '🍝 Spaghetti Failure',
  timing_overrun:      '⏱️ Timing Overrun',
  failed_print:        '❌ Failed Print',
  idle_too_long:       '😴 Idle Too Long',
  job_overrun:         '📈 Job Overrun',
  maintenance_needed:  '🔧 Maintenance Needed',
  temperature_anomaly: '🌡️ Temp Anomaly',
  queue_backlog:       '📋 Queue Backlog',
}

const SEVERITY_BG: Record<string, string> = {
  critical: 'border-red-700 bg-red-950/30',
  high:     'border-orange-700 bg-orange-950/20',
  medium:   'border-yellow-700 bg-yellow-950/20',
  low:      'border-slate-600 bg-slate-800',
}

const SEVERITY_BADGE: Record<string, string> = {
  critical: 'bg-red-900/60 text-red-300 border-red-700',
  high:     'bg-orange-900/60 text-orange-300 border-orange-700',
  medium:   'bg-yellow-900/60 text-yellow-300 border-yellow-700',
  low:      'bg-slate-700 text-slate-300 border-slate-600',
}

const PRINTER_STATUS_COLORS: Record<string, string> = {
  idle:     'bg-green-900/40 text-green-300 border-green-700',
  printing: 'bg-blue-900/40 text-blue-300 border-blue-700',
  error:    'bg-red-900/40 text-red-300 border-red-700',
  offline:  'bg-slate-700 text-slate-400 border-slate-600',
  unknown:  'bg-slate-700 text-slate-400 border-slate-600',
}

export default function AdminMonitoringPage() {
  const [printers, setPrinters] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [printJobs, setPrintJobs] = useState<any[]>([])
  const [liveStatus, setLiveStatus] = useState<Record<string, any>>({})
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    try {
      const [printersRes, jobsRes, alertsRes] = await Promise.all([
        fetch('/api/admin/printers'),
        fetch('/api/admin/print-queue'),
        fetch('/api/admin/alerts'),
      ])
      const printersData = await printersRes.json()
      const jobsData = await jobsRes.json()
      const alertsData = await alertsRes.json()
      setPrinters(printersData.printers || [])
      setPrintJobs(jobsData.jobs || [])
      setAlerts(alertsData.alerts || [])
      setLastRefresh(new Date())
    } catch {
      // silent fail on auto-refresh
    } finally {
      setLoading(false)
    }
  }, [])

  const pingPrinter = useCallback(async (printer: any) => {
    try {
      const res = await fetch(`/api/admin/printers/${printer.id}/ping`)
      const data = await res.json()
      setLiveStatus(prev => ({ ...prev, [printer.id]: data }))
    } catch {
      setLiveStatus(prev => ({ ...prev, [printer.id]: { online: false, status: 'offline' } }))
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 30000)
    return () => clearInterval(interval)
  }, [fetchAll])

  useEffect(() => {
    if (printers.length > 0) printers.forEach(p => pingPrinter(p))
  }, [printers, pingPrinter])

  const handleAcknowledge = async (alertId: string) => {
    try {
      await fetch(`/api/admin/alerts/${alertId}/acknowledge`, { method: 'POST' })
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a))
      toast.success('Alert acknowledged')
    } catch {
      toast.error('Failed to acknowledge')
    }
  }

  const handlePrinterAction = async (action: string, printerId: string) => {
    const activeJob = printJobs.find(
      j => j.printer_id === printerId && (j.status === 'printing' || j.status === 'sent_to_printer')
    )
    if (!activeJob) { toast.error('No active job on this printer'); return }
    try {
      const res = await fetch(`/api/admin/print-queue/${activeJob.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) { toast.success(`${action} sent`); fetchAll() }
      else toast.error('Action failed')
    } catch {
      toast.error('Network error')
    }
  }

  const getActiveJob = (printerId: string) =>
    printJobs.find(j => j.printer_id === printerId && (j.status === 'printing' || j.status === 'sent_to_printer'))

  const unacknowledged = alerts.filter(a => !a.acknowledged)
  const alertsForPrinter = (printerId: string) => alerts.filter(a => a.printer_id === printerId && !a.acknowledged)
  const onlinePrinters = printers.filter(p => { const live = liveStatus[p.id]; return live ? live.online : p.status !== 'offline' })

  return (
    <>
      <Head><title>Monitoring — Admin</title></Head>
      <AdminLayout title="Printer Monitor">

        {/* Summary */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex gap-4 flex-wrap">
            {[
              { label: 'Active Alerts', value: unacknowledged.length, color: unacknowledged.length > 0 ? 'text-red-400' : 'text-green-400' },
              { label: 'Printers Online', value: `${onlinePrinters.length}/${printers.length}`, color: 'text-green-400' },
              { label: 'Printing Now', value: printJobs.filter(j => j.status === 'printing').length, color: 'text-blue-400' },
              { label: 'Jobs Waiting', value: printJobs.filter(j => j.status === 'waiting').length, color: 'text-yellow-400' },
            ].map(stat => (
              <div key={stat.label} className="bg-slate-800 rounded-2xl border border-slate-700 px-5 py-3 text-center min-w-[100px]">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchAll} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs font-semibold transition-colors">
              🔄 Refresh
            </button>
            <span className="text-xs text-slate-600">Last: {lastRefresh.toLocaleTimeString()} · auto every 30s</span>
          </div>
        </div>

        {/* Printer cards */}
        <h2 className="text-xl font-bold text-white mb-4">Printer Status</h2>

        {loading ? (
          <div className="text-center py-16 text-slate-500 text-sm">Loading printers…</div>
        ) : printers.length === 0 ? (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-10 text-center mb-10">
            <p className="text-4xl mb-3">🖨️</p>
            <p className="text-white font-semibold mb-2">No printers added yet</p>
            <p className="text-slate-500 text-sm mb-4">Add a printer to start monitoring</p>
            <a href="/admin/printers" className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold">Add Printer</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
            {printers.map(printer => {
              const live = liveStatus[printer.id]
              const activeJob = getActiveJob(printer.id)
              const printerAlerts = alertsForPrinter(printer.id)
              const displayStatus = live?.status || printer.status

              return (
                <div key={printer.id} className={`bg-slate-800 rounded-2xl border overflow-hidden ${printerAlerts.length > 0 ? 'border-red-700/60' : 'border-slate-700'}`}>
                  <div className="h-40 bg-black flex items-center justify-center relative border-b border-slate-700">
                    {live?.job ? (
                      <div className="text-center px-4 w-full">
                        <div className="text-2xl mb-1 animate-pulse">🖨️</div>
                        <p className="text-slate-400 text-xs truncate mb-2">{live.job.name}</p>
                        <div className="w-full bg-slate-700 rounded-full h-1.5">
                          <div className="bg-blue-400 h-1.5 rounded-full transition-all" style={{ width: `${live.job.progress || 0}%` }} />
                        </div>
                        <p className="text-blue-300 text-xs mt-1">{Math.round(live.job.progress || 0)}%</p>
                      </div>
                    ) : activeJob ? (
                      <div className="text-center">
                        <div className="text-2xl mb-1 animate-pulse">🖨️</div>
                        <p className="text-slate-400 text-xs">{activeJob.product_name}</p>
                        <p className="text-blue-300 text-xs mt-0.5">{activeJob.status}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-3xl mb-1 opacity-30">📷</div>
                        <p className="text-slate-700 text-xs">No active job</p>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${PRINTER_STATUS_COLORS[displayStatus] || PRINTER_STATUS_COLORS.unknown}`}>
                        {displayStatus}
                      </span>
                    </div>
                    {printerAlerts.length > 0 && (
                      <div className="absolute top-3 right-3">
                        <span className="w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                          {printerAlerts.length}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="text-white font-bold">{printer.name}</h3>
                      <p className="text-slate-500 text-xs">{printer.type} · {printer.connection_type}{printer.ip_address ? ` · ${printer.ip_address}` : ''}</p>
                    </div>
                    {live?.temperatures && (
                      <div className="flex gap-3 text-xs mb-3">
                        <span className="text-orange-400">🌡️ {live.temperatures.hotend}°C</span>
                        <span className="text-yellow-400">🛏️ {live.temperatures.bed}°C</span>
                      </div>
                    )}
                    {printerAlerts.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {printerAlerts.map((alert: any) => (
                          <div key={alert.id} className="p-2 bg-red-950/30 border border-red-800/40 rounded-xl">
                            <p className="text-red-300 text-xs font-semibold">{ALERT_TYPE_LABELS[alert.type] || alert.type}</p>
                            <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{alert.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => pingPrinter(printer)} className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs font-semibold transition-colors">📡 Ping</button>
                      <button onClick={() => handlePrinterAction('pause', printer.id)} className="flex-1 py-1.5 bg-yellow-900/40 hover:bg-yellow-900/60 text-yellow-300 rounded-lg text-xs font-semibold transition-colors">⏸ Pause</button>
                      <button onClick={() => handlePrinterAction('cancel', printer.id)} className="flex-1 py-1.5 bg-red-900/40 hover:bg-red-900/60 text-red-300 rounded-lg text-xs font-semibold transition-colors">⏹ Cancel</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Alert feed */}
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          Alert Feed
          {unacknowledged.length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">{unacknowledged.length} active</span>
          )}
        </h2>

        {alerts.length === 0 ? (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-10 text-center">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-white font-semibold mb-1">No alerts</p>
            <p className="text-slate-500 text-sm">Alerts appear here when printer issues are detected</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert: any) => {
              const printer = printers.find(p => p.id === alert.printer_id)
              return (
                <div key={alert.id} className={`rounded-2xl border p-5 transition-all ${alert.acknowledged ? 'border-slate-700 bg-slate-800 opacity-50' : SEVERITY_BG[alert.severity] || 'border-slate-700 bg-slate-800'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${SEVERITY_BADGE[alert.severity] || SEVERITY_BADGE.low}`}>{alert.severity}</span>
                        <span className="text-white text-sm font-semibold">{ALERT_TYPE_LABELS[alert.type] || alert.type}</span>
                        {printer && <span className="text-slate-500 text-xs">· {printer.name}</span>}
                      </div>
                      <p className="text-slate-300 text-sm mb-2">{alert.message}</p>
                      {alert.suggestion && (
                        <p className="text-green-400 text-xs bg-green-900/20 px-3 py-1.5 rounded-xl inline-block mb-2">💡 {alert.suggestion}</p>
                      )}
                      <p className="text-slate-600 text-xs">{timeAgo(alert.created_at)}</p>
                      {alert.acknowledged && <p className="text-slate-500 text-xs mt-1">✓ Acknowledged by {alert.acknowledged_by}</p>}
                    </div>
                    {!alert.acknowledged && (
                      <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={() => handleAcknowledge(alert.id)} className="px-3 py-1.5 bg-green-900/50 hover:bg-green-900 text-green-300 rounded-xl text-xs font-semibold transition-colors">✓ Acknowledge</button>
                        <button onClick={() => handlePrinterAction('pause', alert.printer_id)} className="px-3 py-1.5 bg-yellow-900/50 hover:bg-yellow-900 text-yellow-300 rounded-xl text-xs font-semibold transition-colors">⏸ Pause Job</button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-8 p-5 bg-slate-800/50 border border-slate-700 rounded-2xl">
          <p className="text-slate-400 text-sm font-semibold mb-2">ℹ️ About Monitoring</p>
          <div className="text-slate-600 text-xs space-y-1.5">
            <p>• Printer status is fetched live every 30 seconds.</p>
            <p>• OctoPrint printers show real job progress and temperatures.</p>
            <p>• Bambu and USB printers require the local bridge: <code className="font-mono bg-slate-800 px-1 rounded">node local-bridge/index.js</code></p>
            <p>• Alerts are empty until real printer events are logged to Supabase.</p>
          </div>
        </div>

      </AdminLayout>
    </>
  )
}
