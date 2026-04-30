import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import AdminLayout from '@/components/layout/AdminLayout'
import toast from 'react-hot-toast'

// ── UPDATE THESE ──────────────────────────────
const LINKS = {
  website: 'https://slimeshop.com',
  discord: 'https://discord.gg/W4TB6aVNZm',
  roblox:  'https://www.roblox.com/share/g/713401891',
}
const SHOP_NAME  = 'Slime Shop'
const TAGLINE    = 'Custom 3D Printed Slime Goodies'
const FOOTER_MSG = 'Made with love, one print at a time 🖨️'

// ── STYLES ────────────────────────────────────
const STYLES = {
  green:  { bg:'#f0fdf4', accent:'#16a34a', text:'#14532d', sub:'#166534', border:'#86efac', label:'💚 Green'  },
  purple: { bg:'#faf5ff', accent:'#7c3aed', text:'#4c1d95', sub:'#5b21b6', border:'#c4b5fd', label:'💜 Purple' },
  pink:   { bg:'#fdf2f8', accent:'#db2777', text:'#831843', sub:'#9d174d', border:'#f9a8d4', label:'🩷 Pink'   },
  yellow: { bg:'#fefce8', accent:'#ca8a04', text:'#713f12', sub:'#854d0e', border:'#fde68a', label:'💛 Yellow' },
  dark:   { bg:'#0f172a', accent:'#22c55e', text:'#f1f5f9', sub:'#94a3b8', border:'#334155', label:'🖤 Dark'   },
} as const

type CardStyle = keyof typeof STYLES

// ── QR CODE (SVG generated without npm package) ──
function makeQRUrl(text: string, size = 80): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&bgcolor=ffffff&color=000000&margin=2`
}

// ── BUILD CARD HTML ───────────────────────────
function buildCardHTML(
  customerName: string,
  productName: string,
  orderNumber: string,
  customization: string,
  message: string,
  style: CardStyle,
  opts: { qrWeb: boolean; qrDiscord: boolean; qrRoblox: boolean; showOrderNum: boolean; showCustom: boolean }
): string {
  const s = STYLES[style]
  const qrs = []
  if (opts.qrWeb)     qrs.push({ url: LINKS.website, label: '🌐 Website', color: '000000' })
  if (opts.qrDiscord) qrs.push({ url: LINKS.discord, label: '💬 Discord', color: '5865F2' })
  if (opts.qrRoblox)  qrs.push({ url: LINKS.roblox,  label: '🎮 Roblox',  color: 'e60026' })

  const qrHTML = qrs.map(q => `
    <div style="text-align:center;">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent(q.url)}&color=${q.color}&margin=2"
        width="70" height="70" style="border-radius:6px; border:1px solid ${s.border}; display:block;" />
      <div style="font-size:7px; color:${s.sub}; margin-top:3px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">${q.label}</div>
    </div>`).join('')

  return `
    <div style="
      background-color:${s.bg};
      border:2px solid ${s.border};
      border-radius:12px;
      padding:16px;
      font-family:'Segoe UI',Arial,sans-serif;
      page-break-inside:avoid;
      break-inside:avoid;
    ">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:22px;">🟢</span>
          <div>
            <div style="font-size:15px;font-weight:900;color:${s.accent};line-height:1;">${SHOP_NAME}</div>
            <div style="font-size:8px;color:${s.sub};margin-top:1px;">${TAGLINE}</div>
          </div>
        </div>
        <span style="font-size:18px;">💌</span>
      </div>

      <div style="height:1.5px;background-color:${s.border};margin-bottom:10px;border-radius:2px;"></div>

      <div style="margin-bottom:8px;">
        <div style="font-size:8px;color:${s.sub};font-weight:700;text-transform:uppercase;letter-spacing:0.6px;">Thank you,</div>
        <div style="font-size:18px;font-weight:900;color:${s.accent};margin-top:2px;line-height:1.1;">${customerName} 🎉</div>
      </div>

      <div style="background-color:${s.border};border-radius:8px;padding:8px 10px;margin-bottom:10px;">
        <div style="font-size:8px;color:${s.sub};font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;">Your Order:</div>
        <div style="font-size:13px;font-weight:800;color:${s.text};line-height:1.2;">${productName}</div>
        ${opts.showCustom && customization ? `<div style="font-size:10px;color:${s.sub};margin-top:3px;">✨ ${customization}</div>` : ''}
        ${opts.showOrderNum && orderNumber ? `<div style="font-size:9px;color:${s.sub};margin-top:3px;font-family:monospace;">#${orderNumber}</div>` : ''}
      </div>

      <div style="font-size:10px;color:${s.text};line-height:1.6;margin-bottom:10px;font-style:italic;opacity:0.9;">
        "${message}"
      </div>

      ${qrs.length > 0 ? `
        <div style="height:1px;background-color:${s.border};margin-bottom:10px;"></div>
        <div style="display:flex;justify-content:center;gap:12px;align-items:flex-end;flex-wrap:wrap;">
          ${qrHTML}
        </div>
      ` : ''}

      <div style="margin-top:10px;padding-top:8px;border-top:1px solid ${s.border};text-align:center;font-size:8px;color:${s.sub};">
        ${FOOTER_MSG}
      </div>
    </div>`
}

// ── PRINT FUNCTION ────────────────────────────
function printCards(cards: string[], cols: number) {
  const win = window.open('', '_blank')
  if (!win) { alert('Allow popups to print cards'); return }

  const grid = `
    <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:8mm;padding:6mm;">
      ${cards.join('')}
    </div>`

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Thank You Cards — ${SHOP_NAME}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: white; font-family: 'Segoe UI', Arial, sans-serif; }
    @media print {
      @page { margin: 6mm; size: A4; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>${grid}</body>
</html>`)
  win.document.close()

  // Wait for QR images to load then print
  setTimeout(() => {
    win.focus()
    win.print()
  }, 1500)
}

// ── MAIN PAGE ─────────────────────────────────
export default function ThankYouCardsPage() {
  const [orders, setOrders]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [cardStyle, setCardStyle] = useState<CardStyle>('green')
  const [message, setMessage] = useState('Thank you so much for your order! 💚 Your support means the world to us.')
  const [qrWeb, setQrWeb]     = useState(true)
  const [qrDiscord, setQrDiscord] = useState(true)
  const [qrRoblox, setQrRoblox]   = useState(true)
  const [showOrderNum, setShowOrderNum] = useState(true)
  const [showCustom, setShowCustom]     = useState(true)
  const [cols, setCols]       = useState(2)
  const [tab, setTab]         = useState<'orders'|'manual'>('orders')
  const [manualName, setManualName]     = useState('')
  const [manualProduct, setManualProduct] = useState('')
  const [manualOrder, setManualOrder]   = useState('')
  const [manualCustom, setManualCustom] = useState('')

  useEffect(() => {
    fetch('/api/admin/orders?per_page=50&sort=newest')
      .then(r => r.json())
      .then(d => { setOrders(d.orders || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const opts = { qrWeb, qrDiscord, qrRoblox, showOrderNum, showCustom }

  const getCardHTMLs = (): string[] => {
    if (tab === 'manual') {
      return [buildCardHTML(
        manualName || 'Valued Customer',
        manualProduct || 'Your Order',
        manualOrder, manualCustom, message, cardStyle, opts
      )]
    }
    return orders
      .filter(o => selected.includes(o.id))
      .map(o => buildCardHTML(
        o.customer_name,
        o.order_items?.[0]?.product_name || 'Your Order',
        o.order_number,
        Object.values(o.order_items?.[0]?.customization || {}).filter(Boolean).join(' · '),
        message, cardStyle, opts
      ))
  }

  const handlePrint = () => {
    const cards = getCardHTMLs()
    if (cards.length === 0) { toast.error('Select at least one order or fill in manual details'); return }
    toast.success(`Opening print window with ${cards.length} card${cards.length !== 1 ? 's' : ''}…`)
    printCards(cards, cols)
  }

  const s = STYLES[cardStyle]

  // Preview HTML for one card
  const previewCards = getCardHTMLs().slice(0, 4)

  const Toggle = ({ val, set, label }: { val: boolean; set: (v: boolean) => void; label: string }) => (
    <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => set(!val)}>
      <div className={`w-9 h-5 rounded-full transition-all relative shrink-0 ${val ? 'bg-green-500' : 'bg-slate-600'}`}>
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${val ? 'left-[18px]' : 'left-0.5'}`} />
      </div>
      <span className="text-slate-300 text-sm">{label}</span>
    </div>
  )

  return (
    <>
      <Head><title>Thank You Cards — Admin</title></Head>
      <AdminLayout title="Thank You Cards 💌">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Controls */}
          <div className="xl:col-span-1 space-y-4">

            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
              <h3 className="text-white font-bold mb-3">Card Style</h3>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(STYLES) as CardStyle[]).map(k => (
                  <button key={k} onClick={() => setCardStyle(k)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all ${cardStyle === k ? 'border-green-400 bg-green-900/20 text-green-300' : 'border-slate-600 text-slate-400 hover:border-slate-500'}`}>
                    {STYLES[k].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
              <h3 className="text-white font-bold mb-3">QR Codes</h3>
              <div className="space-y-3">
                <Toggle val={qrWeb}     set={setQrWeb}     label="🌐 Website" />
                <Toggle val={qrDiscord} set={setQrDiscord} label="💬 Discord" />
                <Toggle val={qrRoblox}  set={setQrRoblox}  label="🎮 Roblox" />
              </div>
              <p className="text-slate-600 text-xs mt-3">Update links at top of <code className="text-green-500">thank-you-cards.tsx</code></p>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
              <h3 className="text-white font-bold mb-3">Options</h3>
              <div className="space-y-3">
                <Toggle val={showOrderNum} set={setShowOrderNum} label="Show Order Number" />
                <Toggle val={showCustom}   set={setShowCustom}   label="Show Customization" />
              </div>
              <div className="mt-4">
                <label className="text-slate-400 text-xs font-semibold block mb-1">CARDS PER ROW</label>
                <select value={cols} onChange={e => setCols(Number(e.target.value))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                  <option value={1}>1 per row (large)</option>
                  <option value={2}>2 per row</option>
                  <option value={3}>3 per row (small)</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
              <h3 className="text-white font-bold mb-2">Message</h3>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
            </div>

            <button onClick={handlePrint}
              className="w-full py-4 bg-green-500 hover:bg-green-600 active:scale-95 text-white font-bold rounded-xl text-lg transition-all shadow-lg">
              🖨️ Print {getCardHTMLs().length > 0 ? `${getCardHTMLs().length} Card${getCardHTMLs().length !== 1 ? 's' : ''}` : 'Cards'}
            </button>
            <p className="text-slate-600 text-xs text-center">Opens a new window — allow popups if blocked</p>
          </div>

          {/* Right side */}
          <div className="xl:col-span-2">
            <div className="flex gap-2 mb-5 bg-slate-800 rounded-xl p-1.5 border border-slate-700 w-fit">
              {[{ k:'orders', l:'📦 From Orders' },{ k:'manual', l:'✏️ Manual Card' }].map(t => (
                <button key={t.k} onClick={() => setTab(t.k as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.k ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                  {t.l}
                </button>
              ))}
            </div>

            {tab === 'orders' && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-slate-400 text-sm">{selected.length} selected</p>
                  <button onClick={() => setSelected(selected.length === orders.length ? [] : orders.map(o => o.id))}
                    className="text-green-400 hover:text-green-300 text-sm font-semibold">
                    {selected.length === orders.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                {loading ? (
                  <div className="text-center py-16 text-slate-500">Loading…</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16 bg-slate-800 rounded-2xl border border-slate-700">
                    <p className="text-4xl mb-3">📦</p>
                    <p className="text-slate-500 text-sm">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1 mb-6">
                    {orders.map(order => {
                      const isSel    = selected.includes(order.id)
                      const product  = order.order_items?.[0]?.product_name || 'Order'
                      const custom   = Object.values(order.order_items?.[0]?.customization || {}).filter(Boolean).join(' · ')
                      return (
                        <div key={order.id} onClick={() => setSelected(p => p.includes(order.id) ? p.filter(x => x !== order.id) : [...p, order.id])}
                          className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${isSel ? 'border-green-400 bg-green-900/20' : 'border-slate-700 bg-slate-800 hover:border-slate-600'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${isSel ? 'bg-green-500 border-green-500' : 'border-slate-500'}`}>
                              {isSel && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12"><path d="M10.28 1.28L3.989 7.575 1.695 5.28A1 1 0 00.28 6.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 1.28z"/></svg>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex gap-2 items-center">
                                <span className="font-mono text-xs text-white font-bold">{order.order_number}</span>
                                <span className="text-slate-300 text-sm">{order.customer_name}</span>
                              </div>
                              <p className="text-slate-500 text-xs truncate">{product}{custom ? ` · ${custom}` : ''}</p>
                            </div>
                            <span className="text-xs text-slate-500">{order.status}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {tab === 'manual' && (
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 mb-6 space-y-4">
                <p className="text-slate-400 text-sm">Create a card without needing an order in the system.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 text-xs font-semibold block mb-1">CUSTOMER NAME *</label>
                    <input value={manualName} onChange={e => setManualName(e.target.value)} placeholder="Jane Doe"
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs font-semibold block mb-1">PRODUCT NAME *</label>
                    <input value={manualProduct} onChange={e => setManualProduct(e.target.value)} placeholder="Slime Keychain"
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs font-semibold block mb-1">ORDER NUMBER (optional)</label>
                    <input value={manualOrder} onChange={e => setManualOrder(e.target.value)} placeholder="SS-ABC1-XY"
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-400" />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs font-semibold block mb-1">CUSTOMIZATION (optional)</label>
                    <input value={manualCustom} onChange={e => setManualCustom(e.target.value)} placeholder="Green · Alex"
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Live preview */}
            <div>
              <h3 className="text-white font-bold text-base mb-3">Preview <span className="text-slate-500 text-xs font-normal">(QR codes load when printing)</span></h3>
              <div className="bg-white rounded-2xl p-4">
                {previewCards.length > 0 ? (
                  <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(cols, previewCards.length)}, 1fr)`, gap:'8px' }}>
                    {previewCards.map((html, i) => (
                      <div key={i} dangerouslySetInnerHTML={{ __html: html }} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-4xl mb-2">💌</p>
                    <p className="text-sm">Select orders or fill in manual card to preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  )
}