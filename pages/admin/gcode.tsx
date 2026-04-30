import React, { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { useDropzone } from 'react-dropzone'
import AdminLayout from '@/components/layout/AdminLayout'
import toast from 'react-hot-toast'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function formatMinutes(min: number): string {
  if (!min) return '—'
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60); const m = min % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export default function AdminGcodePage() {
  const [printers, setPrinters] = useState<any[]>([])
  const [files, setFiles] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<any | null>(null)
  const [assignPrinter, setAssignPrinter] = useState('')
  const [assignOrder, setAssignOrder] = useState('')

  useEffect(() => {
    fetch('/api/admin/printers')
      .then(r => r.json())
      .then(d => setPrinters(d.printers || []))
      .catch(() => {})
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    if (!file.name.endsWith('.gcode') && !file.name.endsWith('.gco') && !file.name.endsWith('.g')) {
      toast.error('Please upload a .gcode file')
      return
    }
    // Parse mock metadata from filename
    const estimated_time = Math.floor(Math.random() * 180) + 30
    const layer_count = Math.floor(Math.random() * 400) + 50
    const filament_usage = Math.floor(Math.random() * 50) + 5
    const warnings = file.name.includes('large') ? ['File may exceed printer build volume'] : []
    setPreview({ name: file.name, size: file.size, estimated_time, layer_count, filament_usage, warnings })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'text/plain': ['.gcode', '.gco', '.g'] }, maxFiles: 1, maxSize: 50 * 1024 * 1024,
  })

  const handleUpload = async () => {
    if (!preview) return
    setUploading(true)
    try {
      const res = await fetch('/api/admin/gcode/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: preview.name, file_size: preview.size, printer_id: assignPrinter || null, order_id: assignOrder || null }),
      })
      const data = await res.json()
      if (res.ok) {
        setFiles(prev => [data.data, ...prev])
        setPreview(null); setAssignPrinter(''); setAssignOrder('')
        toast.success('G-code uploaded!')
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch { toast.error('Network error') }
    finally { setUploading(false) }
  }

  const handleSend = async (file: any) => {
    if (!file.printer_id) { toast.error('Assign a printer first'); return }
    try {
      const res = await fetch('/api/admin/jobs/send-to-printer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: file.order_id, printer_id: file.printer_id, gcode_file_id: file.id, auto_clear: true }),
      })
      if (res.ok) { toast.success('Job sent to printer queue!'); setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'queued' } : f)) }
      else toast.error('Failed to send')
    } catch { toast.error('Network error') }
  }

  const statusColors: Record<string, string> = {
    uploaded: 'bg-slate-700 text-slate-300',
    queued:   'bg-blue-900/50 text-blue-300',
    printing: 'bg-green-900/50 text-green-300',
    done:     'bg-slate-600 text-slate-400',
  }

  return (
    <>
      <Head><title>G-Code — Admin</title></Head>
      <AdminLayout title="G-Code Manager">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1 space-y-5">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-white font-bold text-lg mb-4">Upload G-Code</h2>
              <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-green-400 bg-green-900/20' : 'border-slate-600 hover:border-green-600 hover:bg-slate-700/30'}`}>
                <input {...getInputProps()} />
                <div className="text-4xl mb-3">{isDragActive ? '⬇️' : '📂'}</div>
                <p className="text-slate-300 text-sm font-semibold mb-1">{isDragActive ? 'Drop it!' : 'Drag & drop G-code file'}</p>
                <p className="text-slate-500 text-xs">or click to browse · .gcode · Max 50MB</p>
              </div>

              {preview && (
                <div className="mt-4 p-4 bg-slate-700/50 rounded-2xl space-y-3">
                  <h3 className="text-white font-semibold text-sm truncate">{preview.name}</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-800 rounded-xl p-2"><span className="text-slate-500">Est. Time</span><p className="text-green-400 font-semibold">{formatMinutes(preview.estimated_time)}</p></div>
                    <div className="bg-slate-800 rounded-xl p-2"><span className="text-slate-500">Layers</span><p className="text-blue-400 font-semibold">{preview.layer_count}</p></div>
                    <div className="bg-slate-800 rounded-xl p-2"><span className="text-slate-500">Filament</span><p className="text-purple-400 font-semibold">{preview.filament_usage}g</p></div>
                    <div className="bg-slate-800 rounded-xl p-2"><span className="text-slate-500">Size</span><p className="text-slate-300 font-semibold">{formatFileSize(preview.size)}</p></div>
                  </div>
                  {preview.warnings.length > 0 && preview.warnings.map((w: string, i: number) => <p key={i} className="text-xs text-yellow-400">⚠️ {w}</p>)}
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Assign Printer</label>
                    <select className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-green-400" value={assignPrinter} onChange={e => setAssignPrinter(e.target.value)}>
                      <option value="">Select printer…</option>
                      {printers.map(p => <option key={p.id} value={p.id}>{p.name} ({p.status})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Assign Order ID (optional)</label>
                    <input className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-green-400" value={assignOrder} onChange={e => setAssignOrder(e.target.value)} placeholder="ord-001" />
                  </div>
                  <button onClick={handleUpload} disabled={uploading} className="w-full py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors">
                    {uploading ? 'Uploading…' : '⬆️ Upload G-Code'}
                  </button>
                  <button onClick={() => setPreview(null)} className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-xs transition-colors">Cancel</button>
                </div>
              )}
            </div>
          </div>

          <div className="xl:col-span-2">
            <h2 className="text-white font-bold text-lg mb-4">Uploaded Files</h2>
            {files.length === 0 ? (
              <div className="text-center py-16 bg-slate-800 rounded-2xl border border-slate-700">
                <div className="text-5xl mb-3">💾</div>
                <p className="text-slate-500 text-sm">No G-code files uploaded yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {files.map((file: any) => (
                  <div key={file.id} className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl shrink-0">💾</span>
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{file.original_name}</p>
                          <p className="text-slate-500 text-xs">{formatFileSize(file.file_size || 0)}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold shrink-0 ${statusColors[file.status] || statusColors.uploaded}`}>{file.status}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4 text-xs text-center">
                      <div className="bg-slate-700/50 rounded-xl p-2"><p className="text-green-400 font-semibold">{formatMinutes(file.estimated_time)}</p><p className="text-slate-500">Est. Time</p></div>
                      <div className="bg-slate-700/50 rounded-xl p-2"><p className="text-blue-400 font-semibold">{file.layer_count}</p><p className="text-slate-500">Layers</p></div>
                      <div className="bg-slate-700/50 rounded-xl p-2"><p className="text-purple-400 font-semibold">{file.filament_usage}g</p><p className="text-slate-500">Filament</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <select value={file.printer_id || ''} onChange={e => setFiles(prev => prev.map(f => f.id === file.id ? { ...f, printer_id: e.target.value } : f))}
                        className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-green-400">
                        <option value="">Assign printer…</option>
                        {printers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <button onClick={() => handleSend(file)} disabled={file.status === 'printing' || file.status === 'done'}
                        className="px-4 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-40 text-green-200 rounded-xl text-xs font-semibold transition-colors">
                        🖨️ Send
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  )
}
