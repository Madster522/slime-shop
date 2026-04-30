import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import AdminLayout from '@/components/layout/AdminLayout'
import { timeAgo, formatMinutes } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUS_STYLE: Record<string, string> = {
  waiting:           'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  sent_to_printer:   'bg-blue-900/40 text-blue-300 border-blue-700',
  printing:          'bg-purple-900/40 text-purple-300 border-purple-700',
  ready_for_removal: 'bg-green-900/40 text-green-300 border-green-700',
  completed:         'bg-slate-700 text-slate-400 border-slate-600',
  failed:            'bg-red-900/40 text-red-300 border-red-700',
  paused:            'bg-orange-900/40 text-orange-300 border-orange-700',
  cancelled:         'bg-slate-700 text-slate-400 border-slate-600',
}

export default function PrintQueuePage() {
  const [jobs, setJobs]           = useState<any[]>([])
  const [printers, setPrinters]   = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [actioning, setActioning] = useState<string | null>(null)

  const fetchAll = async () => {
    try {
      const [jr, pr] = await Promise.all([
        fetch('/api/admin/print-queue'),
        fetch('/api/admin/printers'),
      ])
      const jd = await jr.json()
      const pd = await pr.json()
      setJobs(jd.jobs || [])
      setPrinters(pd.printers || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const doAction = async (jobId: string, action: string) => {
    setActioning(jobId)
    try {
      const res  = await fetch(`/api/admin/print-queue/${jobId}/action`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || `${action} done`)
        fetchAll()
      } else toast.error(data.error || 'Action failed')
    } finally { setActioning(null) }
  }

  const waiting    = jobs.filter(j => j.status === 'waiting')
  const active     = jobs.filter(j => ['sent_to_printer','printing','paused'].includes(j.status))
  const done       = jobs.filter(j => ['completed','cancelled','ready_for_removal','failed'].includes(j.status))

  const JobCard = ({ job }: { job: any }) => {
    const printer = printers.find(p => p.id === job.printer_id)
    return (
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold truncate">{job.product_name}</p>
            <p className="text-slate-500 text-xs mt-0.5">
              {printer ? `🖨️ ${printer.name}` : '🖨️ Unassigned'}
              {job.estimated_minutes ? ` · ${formatMinutes(job.estimated_minutes)}` : ''}
            </p>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border shrink-0 ${STATUS_STYLE[job.status] || STATUS_STYLE.waiting}`}>
            {job.status.replace(/_/g, ' ')}
          </span>
        </div>

        {job.failure_reason && (
          <p className="text-red-300 text-xs mb-3 p-2 bg-red-900/20 rounded-lg">⚠️ {job.failure_reason}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {job.status === 'waiting' && (
            <button onClick={() => doAction(job.id, 'start')} disabled={actioning === job.id}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
              ▶ Send to Printer
            </button>
          )}
          {(job.status === 'sent_to_printer' || job.status === 'printing') && (
            <>
              <button onClick={() => doAction(job.id, 'ready')} disabled={actioning === job.id}
                className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
                ✅ Mark Ready
              </button>
              <button onClick={() => doAction(job.id, 'pause')} disabled={actioning === job.id}
                className="px-3 py-1.5 bg-yellow-700 hover:bg-yellow-600 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
                ⏸ Pause
              </button>
              <button onClick={() => doAction(job.id, 'fail')} disabled={actioning === job.id}
                className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
                ✗ Mark Failed
              </button>
            </>
          )}
          {job.status === 'paused' && (
            <button onClick={() => doAction(job.id, 'start')} disabled={actioning === job.id}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
              ▶ Resume
            </button>
          )}
          {job.status === 'failed' && (
            <button onClick={() => doAction(job.id, 'retry')} disabled={actioning === job.id}
              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
              🔄 Retry
            </button>
          )}
        </div>
        <p className="text-slate-600 text-xs mt-2">{timeAgo(job.created_at)}</p>
      </div>
    )
  }

  return (
    <>
      <Head><title>Print Queue — Admin</title></Head>
      <AdminLayout title="Print Queue">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex gap-3 flex-wrap text-sm">
            <span className="bg-yellow-900/40 text-yellow-300 px-3 py-1 rounded-full">{waiting.length} waiting</span>
            <span className="bg-purple-900/40 text-purple-300 px-3 py-1 rounded-full">{active.length} active</span>
            <span className="bg-slate-700 text-slate-400 px-3 py-1 rounded-full">{done.length} done</span>
          </div>
          <button onClick={fetchAll} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs font-semibold transition-colors">
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-500">Loading queue…</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 bg-slate-800 rounded-2xl border border-slate-700">
            <p className="text-4xl mb-3">⏳</p>
            <p className="text-white font-semibold mb-1">Queue is empty</p>
            <p className="text-slate-500 text-sm">Jobs appear here when orders are placed</p>
          </div>
        ) : (
          <div className="space-y-8">
            {active.length > 0 && (
              <div>
                <h2 className="text-white font-bold text-base mb-3">🔄 Active ({active.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {active.map(j => <JobCard key={j.id} job={j} />)}
                </div>
              </div>
            )}
            {waiting.length > 0 && (
              <div>
                <h2 className="text-white font-bold text-base mb-3">⏳ Waiting ({waiting.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {waiting.map(j => <JobCard key={j.id} job={j} />)}
                </div>
              </div>
            )}
            {done.length > 0 && (
              <div>
                <h2 className="text-white font-bold text-base mb-3">✅ Completed ({done.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {done.slice(0, 9).map(j => <JobCard key={j.id} job={j} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </AdminLayout>
    </>
  )
}
