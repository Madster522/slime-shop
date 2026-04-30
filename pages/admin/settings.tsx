import React, { useState } from 'react'
import Head from 'next/head'
import AdminLayout from '@/components/layout/AdminLayout'
import toast from 'react-hot-toast'

const ADMIN_EMAILS = ['zach17732@gmail.com', 'slimestudio04@gmail.com', 'charlieslimestudios@gmail.com']
const SUPPORT_EMAILS = { primary: 'slimestudio04@gmail.com', secondary: 'charlieslimestudios@gmail.com' }

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<'general'|'admins'|'discord'|'shipping'>('general')
  const [discord, setDiscord] = useState({
    joinServer:   'https://discord.gg/slimeshop',
    orderSupport: 'https://discord.gg/slimeshop-support',
    community:    'https://discord.gg/slimeshop-community',
  })
  const [shipping, setShipping] = useState({ default: '4', express: '12', freeThreshold: '30' })
  const [siteName, setSiteName] = useState('Slime Shop')
  const [tagline, setTagline] = useState('Custom 3D Printed Slime Goodies 🟢')

  const save = () => toast.success('Settings saved! (connect to Supabase to persist)')

  const inputCls = 'w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400'
  const labelCls = 'text-slate-400 text-xs font-semibold block mb-1'

  const tabs = [
    { key: 'general',  label: '⚙️ General' },
    { key: 'admins',   label: '👑 Admins' },
    { key: 'discord',  label: '💬 Discord' },
    { key: 'shipping', label: '📦 Shipping' },
  ]

  return (
    <>
      <Head><title>Settings — Admin</title></Head>
      <AdminLayout title="Settings">

        <div className="flex flex-wrap gap-2 mb-8 bg-slate-800 rounded-2xl p-1.5 border border-slate-700 w-fit">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.key ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="max-w-2xl space-y-6">

          {/* General */}
          {tab === 'general' && (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4">
              <h2 className="text-white font-bold text-xl mb-4">General Settings</h2>
              <div>
                <label className={labelCls}>SITE NAME</label>
                <input className={inputCls} value={siteName} onChange={e => setSiteName(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>TAGLINE</label>
                <input className={inputCls} value={tagline} onChange={e => setTagline(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>PRIMARY SUPPORT EMAIL</label>
                <input className={inputCls} defaultValue={SUPPORT_EMAILS.primary} />
              </div>
              <div>
                <label className={labelCls}>SECONDARY SUPPORT EMAIL</label>
                <input className={inputCls} defaultValue={SUPPORT_EMAILS.secondary} />
              </div>
              <button onClick={save} className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold text-sm transition-colors">
                Save Changes
              </button>
            </div>
          )}

          {/* Admins */}
          {tab === 'admins' && (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-white font-bold text-xl mb-2">Admin Accounts</h2>
              <p className="text-slate-500 text-xs mb-5">
                To add or remove admins, update the <code className="text-green-400">ADMIN_EMAILS</code> array in
                <code className="text-green-400"> pages/api/auth/[...nextauth].ts</code> and redeploy.
              </p>
              <div className="space-y-3">
                {ADMIN_EMAILS.map((email, i) => (
                  <div key={email} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-700 flex items-center justify-center text-white font-bold text-sm">
                        {email[0].toUpperCase()}
                      </div>
                      <span className="text-white text-sm">{email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {i === 0 && <span className="text-xs bg-yellow-900/50 text-yellow-400 px-2 py-0.5 rounded-full">Owner</span>}
                      <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded-full">Admin</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discord */}
          {tab === 'discord' && (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4">
              <h2 className="text-white font-bold text-xl mb-4">Discord Links</h2>
              {[
                { key: 'joinServer',   label: 'JOIN SERVER LINK' },
                { key: 'orderSupport', label: 'ORDER SUPPORT LINK' },
                { key: 'community',    label: 'COMMUNITY LINK' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className={labelCls}>{label}</label>
                  <input className={inputCls} value={(discord as any)[key]}
                    onChange={e => setDiscord(d => ({ ...d, [key]: e.target.value }))}
                    placeholder="https://discord.gg/..." />
                </div>
              ))}
              <button onClick={save} className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold text-sm transition-colors">
                Save Links
              </button>
            </div>
          )}

          {/* Shipping */}
          {tab === 'shipping' && (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4">
              <h2 className="text-white font-bold text-xl mb-4">Shipping Rates</h2>
              <div>
                <label className={labelCls}>DEFAULT SHIPPING ($)</label>
                <input className={inputCls} type="number" step="0.01" value={shipping.default} onChange={e => setShipping(s => ({ ...s, default: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>EXPRESS SHIPPING ($)</label>
                <input className={inputCls} type="number" step="0.01" value={shipping.express} onChange={e => setShipping(s => ({ ...s, express: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>FREE SHIPPING THRESHOLD ($)</label>
                <input className={inputCls} type="number" step="1" value={shipping.freeThreshold} onChange={e => setShipping(s => ({ ...s, freeThreshold: e.target.value }))} />
                <p className="text-slate-600 text-xs mt-1">Orders above this amount get free shipping</p>
              </div>
              <button onClick={save} className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold text-sm transition-colors">
                Save Shipping
              </button>
            </div>
          )}
        </div>

      </AdminLayout>
    </>
  )
}
