import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import AdminLayout from '@/components/layout/AdminLayout'
import { formatDollars, timeAgo } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

const STATUS_COLORS: Record<string, string> = {
  idle:     'bg-green-900/40 text-green-300 border-green-700',
  printing: 'bg-blue-900/40 text-blue-300 border-blue-700',
  error:    'bg-red-900/40 text-red-300 border-red-700',
  offline:  'bg-slate-700 text-slate-400 border-slate-600',
  unknown:  'bg-slate-700 text-slate-400 border-slate-600',
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([])
  const [printers, setPrinters] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [loadingPrinters, setLoadingPrinters] = useState(true)

  useEffect(() => {
    fetch('/api/admin/orders')
      .then(r => r.json())
      .then(d => { setOrders(d.orders || []); setLoadingOrders(false) })
      .catch(() => setLoadingOrders(false))

    fetch('/api/admin/printers')
      .then(r => r.json())
      .then(d => { setPrinters(d.printers || []); setLoadingPrinters(false) })
      .catch(() => setLoadingPrinters(false))
  }, [])

  const totalSales = orders.reduce((s, o) => s + (o.total || 0), 0)
  const pendingCount = orders.filter(o => o.status === 'Pending').length
  const printingCount = orders.filter(o => o.status === 'Printing').length
  const activePrinters = printers.filter(p => p.status !== 'offline' && p.status !== 'unknown').length

  const stats = [
    { label: 'Total Sales',     value: formatDollars(totalSales), icon: '💰', color: 'from-green-500 to-emerald-400' },
    { label: 'Total Orders',    value: orders.length,             icon: '📦', color: 'from-blue-500 to-cyan-400' },
    { label: 'Active Printers', value: `${activePrinters}/${printers.length}`, icon: '🖨️', color: 'from-purple-500 to-pink-400' },
    { label: 'Pending',         value: pendingCount,              icon: '⏳', color: 'from-orange-500 to-amber-400' },
    { label: 'Printing Now',    value: printingCount,             icon: '🔄', color: 'from-indigo-500 to-blue-400' },
    { label: 'Delivered',       value: orders.filter(o => o.status === 'Delivered').length, icon: '✅', color: 'from-teal-500 to-green-400' },
  ]

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const salesByDay = DAYS.map((day, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dayOrders = orders.filter(o => new Date(o.created_at).toDateString() === date.toDateString())
    return { day, sales: dayOrders.reduce((s, o) => s + (o.total || 0), 0) }
  })

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <>
      <Head><title>Dashboard — Admin</title></Head>
      <AdminLayout title="Dashboard">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {stats.map(stat => (
            <div key={stat.label} className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-lg mb-3`}>{stat.icon}</div>
              <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
              <div className="text-xs text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div className="xl:col-span-2 bg-slate-800 rounded-2xl border border-slate-700 p-6">
            <h2 className="font-bold text-lg text-white mb-5">Sales This Week</h2>
            {loadingOrders ? (
              <div className="h-[220px] flex items-center justify-center text-slate-500 text-sm">Loading…</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={v => `$${v}`} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'Sales']} />
                  <Bar dataKey="sales" fill="#22c55e" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
            <h2 className="font-bold text-lg text-white mb-5">Orders by Status</h2>
            {Object.keys(statusCounts).length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">{status}</span>
                      <span className="text-white font-semibold">{count as number}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: orders.length > 0 ? `${((count as number) / orders.length) * 100}%` : '0%' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="font-bold text-lg text-white">Recent Orders</h2>
              <Link href="/admin/orders" className="text-green-400 hover:text-green-300 text-sm">View All →</Link>
            </div>
            {loadingOrders ? (
              <div className="px-6 py-8 text-center text-slate-500 text-sm">Loading…</div>
            ) : recentOrders.length === 0 ? (
              <div className="px-6 py-12 text-center"><p className="text-4xl mb-3">📦</p><p className="text-slate-500 text-sm">No orders yet</p></div>
            ) : (
              <div className="divide-y divide-slate-700">
                {recentOrders.map(order => (
                  <div key={order.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-700/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm text-white font-bold">{order.order_number}</p>
                      <p className="text-xs text-slate-400">{order.customer_name} · {timeAgo(order.created_at)}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-300 bg-slate-700 px-2 py-0.5 rounded-full">{order.status}</span>
                    <span className="text-green-400 font-bold">{formatDollars(order.total)}</span>
                    <Link href={`/admin/orders/${order.id}`} className="text-slate-400 hover:text-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="font-bold text-base text-white">Printers</h2>
              <Link href="/admin/printers" className="text-green-400 hover:text-green-300 text-xs">Manage →</Link>
            </div>
            {loadingPrinters ? (
              <div className="px-5 py-8 text-center text-slate-500 text-sm">Loading…</div>
            ) : printers.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-3xl mb-2">🖨️</p>
                <p className="text-slate-500 text-sm mb-3">No printers added</p>
                <Link href="/admin/printers" className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold">Add Printer</Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {printers.map(printer => (
                  <div key={printer.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-white font-semibold">{printer.name}</p>
                      <p className="text-xs text-slate-500">{printer.type} · {printer.connection_type}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${STATUS_COLORS[printer.status] || STATUS_COLORS.unknown}`}>
                      {printer.status}
                    </span>
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
