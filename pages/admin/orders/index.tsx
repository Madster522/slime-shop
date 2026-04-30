import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import AdminLayout from '@/components/layout/AdminLayout'
import { formatDollars, timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

const ORDER_STATUSES = ['Pending','Processing','Printing','Packed','Shipped','Delayed','Delivered','Cancelled']

const STATUS_COLORS: Record<string, string> = {
  Pending:    'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  Processing: 'bg-blue-900/40 text-blue-300 border-blue-700',
  Printing:   'bg-purple-900/40 text-purple-300 border-purple-700',
  Packed:     'bg-indigo-900/40 text-indigo-300 border-indigo-700',
  Shipped:    'bg-green-900/40 text-green-300 border-green-700',
  Delayed:    'bg-orange-900/40 text-orange-300 border-orange-700',
  Delivered:  'bg-emerald-900/40 text-emerald-300 border-emerald-700',
  Cancelled:  'bg-red-900/40 text-red-300 border-red-700',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.append('status', statusFilter)
    if (search) params.append('search', search)
    params.append('sort', sort)

    fetch(`/api/admin/orders?${params}`)
      .then(r => r.json())
      .then(d => { setOrders(d.orders || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [search, statusFilter, sort])

  const toggleSelect = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const selectAll = () =>
    setSelected(selected.length === orders.length ? [] : orders.map(o => o.id))

  const handleExportCSV = () => {
    const rows = [['Order #','Customer','Email','Status','Total','Date']]
    orders.forEach(o => rows.push([o.order_number, o.customer_name, o.customer_email, o.status, String(o.total), new Date(o.created_at).toLocaleDateString()]))
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'orders.csv'; a.click()
    toast.success('CSV exported')
  }

  return (
    <>
      <Head><title>Orders — Admin</title></Head>
      <AdminLayout title="Orders">
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
            </svg>
            <input className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-slate-400"
              placeholder="Search orders, customers…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400 w-40">
            <option value="all">All Statuses</option>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400 w-44">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="total_high">Highest Total</option>
            <option value="total_low">Lowest Total</option>
          </select>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-semibold transition-colors">
            ⬇️ Export CSV
          </button>
        </div>

        {selected.length > 0 && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-green-900/20 border border-green-700/30 rounded-xl">
            <span className="text-sm text-green-300">{selected.length} selected</span>
            <button onClick={() => setSelected([])} className="text-xs text-slate-400 hover:text-white">Clear</button>
          </div>
        )}

        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-slate-500 text-sm">Loading orders…</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-slate-500 text-sm">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 text-left">
                    <th className="p-4 w-10">
                      <input type="checkbox" className="rounded" checked={selected.length === orders.length && orders.length > 0} onChange={selectAll} />
                    </th>
                    {['Order #','Customer','Status','Total','Date',''].map(h => (
                      <th key={h} className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-700/40 transition-colors group">
                      <td className="p-4">
                        <input type="checkbox" className="rounded" checked={selected.includes(order.id)} onChange={() => toggleSelect(order.id)} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-white font-bold">{order.order_number}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-white font-semibold">{order.customer_name}</div>
                        <div className="text-xs text-slate-500">{order.customer_email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${STATUS_COLORS[order.status] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-green-400 font-bold">{formatDollars(order.total)}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{timeAgo(order.created_at)}</td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/orders/${order.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="px-6 py-4 border-t border-slate-700">
            <span className="text-sm text-slate-500">{orders.length} orders</span>
          </div>
        </div>
      </AdminLayout>
    </>
  )
}
