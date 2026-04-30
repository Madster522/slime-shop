import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import AdminLayout from '@/components/layout/AdminLayout'
import { timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-slate-600'}>★</span>
      ))}
    </span>
  )
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState<'all'|'pending'|'approved'>('pending')

  const fetchReviews = async () => {
    const url = filter === 'pending' ? '/api/admin/reviews?approved=false' : '/api/admin/reviews'
    const res  = await fetch(url)
    const data = await res.json()
    setReviews(data.reviews || [])
    setLoading(false)
  }
  useEffect(() => { setLoading(true); fetchReviews() }, [filter])

  const approve = async (id: string) => {
    await fetch(`/api/admin/reviews/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_approved: true }) })
    toast.success('Review approved!')
    fetchReviews()
  }

  const del = async (id: string) => {
    await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
    toast.success('Review deleted')
    fetchReviews()
  }

  const pending  = reviews.filter(r => !r.is_approved)
  const approved = reviews.filter(r => r.is_approved)

  return (
    <>
      <Head><title>Reviews — Admin</title></Head>
      <AdminLayout title="Product Reviews ⭐">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex gap-2 bg-slate-800 rounded-xl p-1.5 border border-slate-700">
            {(['pending','approved','all'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${filter === f ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                {f}
                {f === 'pending' && pending.length > 0 && <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pending.length}</span>}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-500">Loading reviews…</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 bg-slate-800 rounded-2xl border border-slate-700">
            <p className="text-4xl mb-3">⭐</p>
            <p className="text-white font-semibold">No reviews {filter !== 'all' ? `(${filter})` : ''}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className={`bg-slate-800 rounded-2xl border p-5 ${!r.is_approved ? 'border-yellow-700/50' : 'border-slate-700'}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <Stars rating={r.rating} />
                      {!r.is_approved && <span className="text-xs bg-yellow-900/50 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-700">Pending Approval</span>}
                      {r.is_approved  && <span className="text-xs bg-green-900/50 text-green-300 px-2 py-0.5 rounded-full border border-green-700">Published</span>}
                    </div>
                    {r.title && <p className="text-white font-semibold mb-1">{r.title}</p>}
                    {r.body  && <p className="text-slate-300 text-sm leading-relaxed mb-2">{r.body}</p>}
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>👤 {r.reviewer_name}</span>
                      {r.products?.name && <span>🟢 {r.products.name}</span>}
                      <span>🕐 {timeAgo(r.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!r.is_approved && (
                      <button onClick={() => approve(r.id)} className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded-lg text-xs font-semibold">
                        ✅ Approve
                      </button>
                    )}
                    <button onClick={() => del(r.id)} className="px-3 py-1.5 bg-red-900/50 hover:bg-red-900 text-red-300 rounded-lg text-xs font-semibold">
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminLayout>
    </>
  )
}
