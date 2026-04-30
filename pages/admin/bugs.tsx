import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import AdminLayout from '@/components/layout/AdminLayout'
import { timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

type Severity = 'low' | 'medium' | 'high' | 'critical'
type BugStatus = 'open' | 'in_progress' | 'fixed' | 'wont_fix'

interface Bug {
  id: string
  title: string
  description: string
  severity: Severity
  category: string
  status: BugStatus
  reported_by: string
  page_url: string | null
  steps_to_reproduce: string | null
  expected_behavior: string | null
  actual_behavior: string | null
  fixed_by: string | null
  fixed_at: string | null
  fix_notes: string | null
  created_at: string
  updated_at: string
}

const SEVERITY_STYLE: Record<Severity, string> = {
  low:      'bg-slate-700 text-slate-300 border-slate-600',
  medium:   'bg-yellow-900/50 text-yellow-300 border-yellow-700',
  high:     'bg-orange-900/50 text-orange-300 border-orange-700',
  critical: 'bg-red-900/50 text-red-300 border-red-700',
}

const STATUS_STYLE: Record<BugStatus, string> = {
  open:        'bg-blue-900/50 text-blue-300 border-blue-700',
  in_progress: 'bg-purple-900/50 text-purple-300 border-purple-700',
  fixed:       'bg-green-900/50 text-green-300 border-green-700',
  wont_fix:    'bg-slate-700 text-slate-400 border-slate-600',
}

const SEVERITY_ICON: Record<Severity, string> = {
  low: '🔵', medium: '🟡', high: '🟠', critical: '🔴',
}

const emptyForm = {
  title: '', description: '', severity: 'medium' as Severity,
  category: 'general', page_url: '', steps_to_reproduce: '',
  expected_behavior: '', actual_behavior: '',
}

export default function AdminBugsPage() {
  const [bugs, setBugs]               = useState<Bug[]>([])
  const [loading, setLoading]         = useState(true)
  const [showNew, setShowNew]         = useState(false)
  const [selected, setSelected]       = useState<Bug | null>(null)
  const [form, setForm]               = useState(emptyForm)
  const [fixNotes, setFixNotes]       = useState('')
  const [statusFilter, setStatus]     = useState('all')
  const [severityFilter, setSeverity] = useState('all')
  const [saving, setSaving]           = useState(false)

  const fetchBugs = async () => {
    const params = new URLSearchParams()
    if (statusFilter !== 'all')   params.append('status', statusFilter)
    if (severityFilter !== 'all') params.append('severity', severityFilter)
    const res  = await fetch(`/api/admin/bugs?${params}`)
    const data = await res.json()
    setBugs(data.bugs || [])
    setLoading(false)
  }

  useEffect(() => { fetchBugs() }, [statusFilter, severityFilter])

  const handleCreate = async () => {
    if (!form.title || !form.description) { toast.error('Title and description required'); return }
    setSaving(true)
    try {
      const res  = await fetch('/api/admin/bugs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      toast.success('Bug reported!')
      setShowNew(false)
      setForm(emptyForm)
      fetchBugs()
    } finally { setSaving(false) }
  }

  const handleStatus = async (bug: Bug, newStatus: BugStatus) => {
    const res = await fetch(`/api/admin/bugs/${bug.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, fix_notes: newStatus === 'fixed' ? fixNotes : undefined }),
    })
    if (res.ok) {
      toast.success(`Marked as ${newStatus}`)
      fetchBugs()
      setSelected(null)
      setFixNotes('')
    } else toast.error('Failed to update')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this bug report?')) return
    const res = await fetch(`/api/admin/bugs/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Deleted'); fetchBugs(); setSelected(null) }
    else toast.error('Failed to delete')
  }

  const f = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const open   = bugs.filter(b => b.status === 'open')
  const inProg = bugs.filter(b => b.status === 'in_progress')
  const fixed  = bugs.filter(b => b.status === 'fixed' || b.status === 'wont_fix')

  return (
    <>
      <Head><title>Bug Reports — Admin</title></Head>
      <AdminLayout title="Bug Reports 🐛">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Open',        value: bugs.filter(b => b.status === 'open').length,        color: 'text-blue-400' },
            { label: 'In Progress', value: bugs.filter(b => b.status === 'in_progress').length, color: 'text-purple-400' },
            { label: 'Fixed',       value: bugs.filter(b => b.status === 'fixed').length,       color: 'text-green-400' },
            { label: 'Critical',    value: bugs.filter(b => b.severity === 'critical').length,  color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-800 rounded-2xl border border-slate-700 p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex gap-2 flex-wrap">
            <select value={statusFilter} onChange={e => setStatus(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="fixed">Fixed</option>
              <option value="wont_fix">Won't Fix</option>
            </select>
            <select value={severityFilter} onChange={e => setSeverity(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
              <option value="all">All Severity</option>
              <option value="critical">🔴 Critical</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🔵 Low</option>
            </select>
          </div>
          <button onClick={() => setShowNew(true)}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold text-sm transition-colors">
            🐛 Report Bug
          </button>
        </div>

        {/* Report form */}
        {showNew && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-bold text-lg mb-5">Report a Bug</h2>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1">TITLE *</label>
                <input value={form.title} onChange={e => f('title', e.target.value)} placeholder="Brief description of the bug"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1">DESCRIPTION *</label>
                <textarea value={form.description} onChange={e => f('description', e.target.value)} rows={3}
                  placeholder="What is broken?"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1">SEVERITY</label>
                  <select value={form.severity} onChange={e => f('severity', e.target.value as Severity)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
                    <option value="low">🔵 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🟠 High</option>
                    <option value="critical">🔴 Critical</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1">CATEGORY</label>
                  <select value={form.category} onChange={e => f('category', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
                    {['general','checkout','products','orders','admin','auth','cart','api','mobile','printing'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1">PAGE URL</label>
                  <input value={form.page_url} onChange={e => f('page_url', e.target.value)} placeholder="/admin/products"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1">STEPS TO REPRODUCE</label>
                  <textarea value={form.steps_to_reproduce} onChange={e => f('steps_to_reproduce', e.target.value)} rows={3}
                    placeholder="1. Go to..&#10;2. Click...&#10;3. See error"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1">EXPECTED vs ACTUAL</label>
                  <textarea value={form.expected_behavior} onChange={e => f('expected_behavior', e.target.value)} rows={1.5 as any}
                    placeholder="Expected: Product saves..."
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-2" />
                  <textarea value={form.actual_behavior} onChange={e => f('actual_behavior', e.target.value)} rows={1.5 as any}
                    placeholder="Actual: 500 error..."
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowNew(false)} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white rounded-xl font-semibold transition-colors">
                {saving ? 'Saving…' : '🐛 Submit Bug Report'}
              </button>
            </div>
          </div>
        )}

        {/* Bug list */}
        {loading ? (
          <div className="text-center py-16 text-slate-500">Loading bug reports…</div>
        ) : bugs.length === 0 ? (
          <div className="text-center py-16 bg-slate-800 rounded-2xl border border-slate-700">
            <p className="text-5xl mb-3">✅</p>
            <p className="text-white font-semibold text-lg mb-1">No bugs found</p>
            <p className="text-slate-500 text-sm">No bug reports match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Bug list */}
            <div className="xl:col-span-2 space-y-3">
              {bugs.map(bug => (
                <div key={bug.id} onClick={() => setSelected(bug)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${selected?.id === bug.id ? 'border-green-400 bg-green-900/10' : 'border-slate-700 bg-slate-800 hover:border-slate-600'}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${SEVERITY_STYLE[bug.severity]}`}>
                        {SEVERITY_ICON[bug.severity]} {bug.severity}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${STATUS_STYLE[bug.status]}`}>
                        {bug.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{bug.category}</span>
                    </div>
                    <span className="text-slate-500 text-xs shrink-0">{timeAgo(bug.created_at)}</span>
                  </div>
                  <p className="text-white font-semibold">{bug.title}</p>
                  <p className="text-slate-400 text-sm mt-1 line-clamp-2">{bug.description}</p>
                  {bug.page_url && <p className="text-slate-500 text-xs mt-1 font-mono">{bug.page_url}</p>}
                </div>
              ))}
            </div>

            {/* Detail panel */}
            <div>
              {selected ? (
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 sticky top-24 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold">Bug Details</h3>
                    <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white text-xl">×</button>
                  </div>

                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${SEVERITY_STYLE[selected.severity]}`}>{selected.severity}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${STATUS_STYLE[selected.status]}`}>{selected.status}</span>
                    </div>
                    <p className="text-white font-bold text-base">{selected.title}</p>
                    <p className="text-slate-400 text-sm mt-1">{selected.description}</p>
                  </div>

                  {selected.steps_to_reproduce && (
                    <div>
                      <p className="text-slate-500 text-xs font-semibold mb-1">STEPS TO REPRODUCE</p>
                      <p className="text-slate-300 text-sm whitespace-pre-wrap">{selected.steps_to_reproduce}</p>
                    </div>
                  )}
                  {selected.expected_behavior && (
                    <div>
                      <p className="text-slate-500 text-xs font-semibold mb-1">EXPECTED</p>
                      <p className="text-slate-300 text-sm">{selected.expected_behavior}</p>
                    </div>
                  )}
                  {selected.actual_behavior && (
                    <div>
                      <p className="text-slate-500 text-xs font-semibold mb-1">ACTUAL</p>
                      <p className="text-red-300 text-sm">{selected.actual_behavior}</p>
                    </div>
                  )}
                  {selected.page_url && (
                    <div>
                      <p className="text-slate-500 text-xs font-semibold mb-1">PAGE</p>
                      <p className="text-slate-300 text-sm font-mono">{selected.page_url}</p>
                    </div>
                  )}
                  {selected.fix_notes && (
                    <div className="p-3 bg-green-900/20 border border-green-700/40 rounded-xl">
                      <p className="text-slate-500 text-xs font-semibold mb-1">FIX NOTES</p>
                      <p className="text-green-300 text-sm">{selected.fix_notes}</p>
                      {selected.fixed_by && <p className="text-slate-500 text-xs mt-1">Fixed by {selected.fixed_by}</p>}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="border-t border-slate-700 pt-4 space-y-3">
                    <p className="text-slate-400 text-xs font-semibold">CHANGE STATUS</p>
                    {selected.status !== 'fixed' && (
                      <>
                        <textarea value={fixNotes} onChange={e => setFixNotes(e.target.value)} rows={2}
                          placeholder="Fix notes (optional)…"
                          className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
                        <div className="flex gap-2 flex-wrap">
                          {selected.status === 'open' && (
                            <button onClick={() => handleStatus(selected, 'in_progress')}
                              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold">
                              🔄 In Progress
                            </button>
                          )}
                          <button onClick={() => handleStatus(selected, 'fixed')}
                            className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded-lg text-xs font-semibold">
                            ✅ Mark Fixed
                          </button>
                          <button onClick={() => handleStatus(selected, 'wont_fix')}
                            className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-xs font-semibold">
                            🚫 Won't Fix
                          </button>
                        </div>
                      </>
                    )}
                    {selected.status === 'fixed' && (
                      <button onClick={() => handleStatus(selected, 'open')}
                        className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold">
                        🔄 Reopen
                      </button>
                    )}
                    <button onClick={() => handleDelete(selected.id)}
                      className="w-full py-2 bg-red-900/40 hover:bg-red-900 text-red-300 rounded-xl text-xs font-semibold transition-colors">
                      🗑 Delete Report
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center">
                  <p className="text-3xl mb-2">👆</p>
                  <p className="text-slate-500 text-sm">Click a bug to view details</p>
                </div>
              )}
            </div>
          </div>
        )}

      </AdminLayout>
    </>
  )
}
