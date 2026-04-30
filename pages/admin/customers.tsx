import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import AdminLayout from '@/components/layout/AdminLayout'
import { timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    // Derive unique customers from orders
    fetch('/api/admin/orders?per_page=100')
      .then(r => r.json())
      .then(d => {
        const orders = d.orders || []
        const map = new Map<string, any>()
        orders.forEach((o: any) => {
          if (!map.has(o.customer_email)) {
            map.set(o.customer_email, {
              id: o.customer_email,
              name: o.customer_name,
              email: o.customer_email,
              orders: 0,
              total_spent: 0,
              last_order: o.created_at,
            })
          }
          const c = map.get(o.customer_email)
          c.orders += 1
          c.total_spent += o.total || 0
          if (new Date(o.created_at) > new Date(c.last_order)) c.last_order = o.created_at
        })
        setCustomers(Array.from(map.values()))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  )

  const selectedCustomer = customers.find(c => c.id === selected)

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <>
      <Head><title>Customers — Admin</title></Head>
      <AdminLayout title="Customers">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <div className="mb-4">
              <input className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-slate-400"
                placeholder="Search customers…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
              {loading ? (
                <div className="text-center py-16 text-slate-500 text-sm">Loading customers…</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">👥</p>
                  <p className="text-slate-500 text-sm">No customers yet</p>
                  <p className="text-slate-600 text-xs mt-1">Customers appear here once they place orders</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        {['Customer','Orders','Spent','Last Order'].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {filtered.map(c => (
                        <tr key={c.id} onClick={() => setSelected(c.id)}
                          className={`hover:bg-slate-700/40 transition-colors cursor-pointer ${selected === c.id ? 'bg-green-900/20' : ''}`}>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-green-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                {getInitials(c.name)}
                              </div>
                              <div>
                                <p className="text-white font-semibold text-sm">{c.name}</p>
                                <p className="text-slate-500 text-xs">{c.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-300 text-sm">{c.orders}</td>
                          <td className="px-5 py-4 text-green-400 font-bold text-sm">${c.total_spent.toFixed(2)}</td>
                          <td className="px-5 py-4 text-slate-500 text-xs">{timeAgo(c.last_order)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div>
            {selectedCustomer ? (
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-green-700 flex items-center justify-center text-white font-bold text-lg">
                    {getInitials(selectedCustomer.name)}
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg">{selectedCustomer.name}</h2>
                    <a href={`mailto:${selectedCustomer.email}`} className="text-green-400 text-xs hover:underline">{selectedCustomer.email}</a>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                    <p className="text-green-400 text-xl font-bold">{selectedCustomer.orders}</p>
                    <p className="text-slate-500 text-xs">Orders</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                    <p className="text-green-400 text-xl font-bold">${selectedCustomer.total_spent.toFixed(2)}</p>
                    <p className="text-slate-500 text-xs">Total Spent</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={`mailto:${selectedCustomer.email}`}
                    className="flex-1 py-2 bg-green-700 hover:bg-green-600 text-white rounded-xl text-xs font-semibold transition-colors text-center">
                    📧 Email
                  </a>
                  <a href={`/admin/orders?search=${encodeURIComponent(selectedCustomer.email)}`}
                    className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition-colors text-center">
                    📦 Orders
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center">
                <div className="text-4xl mb-3">👆</div>
                <p className="text-slate-500 text-sm">Select a customer to view details</p>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  )

  function getInitials(name: string) {
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  }
}
