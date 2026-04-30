import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import AdminLayout from '@/components/layout/AdminLayout'
import { formatDollars } from '@/lib/utils'
import toast from 'react-hot-toast'

type StockStatus = 'in_stock' | 'out_of_stock' | 'made_to_order'

const CATEGORIES = ['Keychains','Figures','Home Decor','Accessories','Other']
const STOCK_OPTIONS = [
  { value: 'made_to_order', label: '🖨️ Made to Order' },
  { value: 'in_stock',      label: '✅ In Stock' },
  { value: 'out_of_stock',  label: '❌ Out of Stock' },
]

function formatMinutes(min: number): string {
  if (!min) return '—'
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60); const m = min % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

const emptyForm = {
  name: '', description: '', price: '', shipping_price: '',
  images: '', category: 'Keychains', stock_status: 'made_to_order' as StockStatus,
  is_active: true, has_customization: false, estimated_print_minutes: '60',
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      setProducts(data.products || [])
    } catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchProducts() }, [])

  const openNew = () => { setEditing(null); setForm(emptyForm); setErrors({}); setShowModal(true) }

  const openEdit = (p: any) => {
    setEditing(p)
    setForm({
      name: p.name || '', description: p.description || '',
      price: String(p.price || ''), shipping_price: String(p.shipping_price || 0),
      images: (p.images || []).join('\n'), category: p.category || 'Keychains',
      stock_status: p.stock_status || 'made_to_order', is_active: p.is_active ?? true,
      has_customization: p.has_customization || false,
      estimated_print_minutes: String(p.estimated_print_minutes || 60),
    })
    setErrors({}); setShowModal(true)
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.price || isNaN(Number(form.price))) e.price = 'Valid price is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const url = editing ? `/api/admin/products/${editing.id}` : '/api/admin/products'
      const method = editing ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(), description: form.description.trim(),
          price: Number(form.price), shipping_price: Number(form.shipping_price) || 0,
          images: form.images, category: form.category, stock_status: form.stock_status,
          is_active: form.is_active, has_customization: form.has_customization,
          estimated_print_minutes: Number(form.estimated_print_minutes) || 60,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to save'); return }
      toast.success(editing ? 'Product updated!' : 'Product created!')
      setShowModal(false)
      if (editing) { setProducts(prev => prev.map(p => p.id === editing.id ? data.product : p)) }
      else { setProducts(prev => [data.product, ...prev]) }
    } catch { toast.error('Network error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (res.ok) { setProducts(prev => prev.filter(p => p.id !== id)); toast.success('Deleted') }
      else toast.error('Failed to delete')
    } catch { toast.error('Network error') }
  }

  const toggleActive = async (product: any) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !product.is_active }),
      })
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p))
        toast.success(!product.is_active ? `${product.name} is now active` : `${product.name} hidden from shop`)
      }
    } catch { toast.error('Failed to update') }
  }

  const f = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  return (
    <>
      <Head><title>Products — Admin</title></Head>
      <AdminLayout title="Products">
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-400 text-sm">
            {loading ? 'Loading…' : `${products.length} products · ${products.filter(p => p.is_active).length} active`}
          </p>
          <button onClick={openNew} className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold text-sm transition-colors">
            + Add Product
          </button>
        </div>

        {!loading && products.length === 0 && (
          <div className="text-center py-24 bg-slate-800 rounded-2xl border border-slate-700">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-white font-bold text-lg mb-2">No products yet</p>
            <p className="text-slate-500 text-sm mb-6">Add your first product — it appears on the shop immediately.</p>
            <button onClick={openNew} className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold">Add First Product</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {products.map(product => (
            <div key={product.id} className={`bg-slate-800 rounded-2xl border overflow-hidden ${product.is_active ? 'border-slate-700' : 'border-slate-700 opacity-55'}`}>
              <div className="h-40 bg-slate-700 flex items-center justify-center relative overflow-hidden">
                {product.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : (
                  <span className="text-5xl opacity-40">🟢</span>
                )}
                <button onClick={() => toggleActive(product)} className="absolute top-3 right-3">
                  <div className={`w-10 h-6 rounded-full transition-all relative ${product.is_active ? 'bg-green-500' : 'bg-slate-600'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${product.is_active ? 'left-[18px]' : 'left-0.5'}`} />
                  </div>
                </button>
                <div className="absolute bottom-2 left-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    product.stock_status === 'in_stock' ? 'bg-green-900/80 text-green-300' :
                    product.stock_status === 'out_of_stock' ? 'bg-red-900/80 text-red-300' :
                    'bg-blue-900/80 text-blue-300'
                  }`}>
                    {STOCK_OPTIONS.find(s => s.value === product.stock_status)?.label || product.stock_status}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-white font-bold text-base leading-tight">{product.name}</h3>
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full shrink-0">{product.category}</span>
                </div>
                <p className="text-slate-500 text-xs mb-1 font-mono">/shop/{product.slug}</p>
                <p className="text-slate-400 text-xs mb-4 line-clamp-2">{product.description || 'No description'}</p>
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="bg-slate-700/50 rounded-xl p-2">
                    <p className="text-green-400 font-bold text-sm">{formatDollars(product.price)}</p>
                    <p className="text-slate-500 text-xs">Price</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-2">
                    <p className="text-blue-400 font-bold text-sm">{formatDollars(product.shipping_price || 0)}</p>
                    <p className="text-slate-500 text-xs">Shipping</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-2">
                    <p className="text-purple-400 font-bold text-sm">{formatMinutes(product.estimated_print_minutes)}</p>
                    <p className="text-slate-500 text-xs">Print</p>
                  </div>
                </div>
                {product.images?.length > 0 && <p className="text-slate-600 text-xs mb-3">📷 {product.images.length} image{product.images.length !== 1 ? 's' : ''}</p>}
                <div className="flex gap-2">
                  <button onClick={() => openEdit(product)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition-colors">✏️ Edit</button>
                  <button onClick={() => handleDelete(product.id, product.name)} className="flex-1 py-2 bg-red-900/50 hover:bg-red-900 text-red-300 rounded-xl text-xs font-semibold transition-colors">🗑 Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
            <div className="bg-slate-800 rounded-3xl border border-slate-700 p-8 max-w-xl w-full my-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <h2 className="text-white font-bold text-2xl mb-6">{editing ? `Edit: ${editing.name}` : 'New Product'}</h2>
              <div className="space-y-5">
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1">PRODUCT NAME *</label>
                  <input value={form.name} onChange={e => f('name', e.target.value)} placeholder="e.g. Slime Keychain"
                    className={`w-full bg-slate-700 border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400 ${errors.name ? 'border-red-500' : 'border-slate-600'}`} />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                  {form.name && <p className="text-slate-600 text-xs mt-1 font-mono">slug: /{form.name.toLowerCase().replace(/[^\w\s-]/g,'').replace(/[\s_-]+/g,'-').trim()}</p>}
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1">DESCRIPTION</label>
                  <textarea value={form.description} onChange={e => f('description', e.target.value)} placeholder="Describe your product…" rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 text-xs font-semibold block mb-1">PRICE ($) *</label>
                    <input type="number" min="0" step="0.01" value={form.price} onChange={e => f('price', e.target.value)} placeholder="1.00"
                      className={`w-full bg-slate-700 border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400 ${errors.price ? 'border-red-500' : 'border-slate-600'}`} />
                    {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs font-semibold block mb-1">SHIPPING ($)</label>
                    <input type="number" min="0" step="0.01" value={form.shipping_price} onChange={e => f('shipping_price', e.target.value)} placeholder="4.00"
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1">IMAGE URLS (one per line)</label>
                  <textarea value={form.images} onChange={e => f('images', e.target.value)} placeholder={`https://example.com/image1.jpg\nhttps://example.com/image2.jpg`} rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
                  {form.images.split('\n').filter(u => u.trim()).length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {form.images.split('\n').filter(u => u.trim()).slice(0, 4).map((url, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={url.trim()} alt={`Preview ${i+1}`} className="w-14 h-14 object-cover rounded-lg border border-slate-600"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      ))}
                    </div>
                  )}
                  <p className="text-slate-600 text-xs mt-1">First image is the thumbnail. Paste hosted image URLs.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 text-xs font-semibold block mb-1">CATEGORY</label>
                    <select value={form.category} onChange={e => f('category', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs font-semibold block mb-1">STOCK STATUS</label>
                    <select value={form.stock_status} onChange={e => f('stock_status', e.target.value as StockStatus)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                      {STOCK_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1">EST. PRINT TIME (minutes)</label>
                  <input type="number" min="1" value={form.estimated_print_minutes} onChange={e => f('estimated_print_minutes', e.target.value)} placeholder="60"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div className="flex items-center gap-6 pt-2">
                  {[
                    { key: 'is_active', label: 'Active', sub: form.is_active ? 'Visible in shop' : 'Hidden from shop' },
                    { key: 'has_customization', label: 'Customizable', sub: 'Allows custom text/color' },
                  ].map(toggle => (
                    <label key={toggle.key} className="flex items-center gap-3 cursor-pointer">
                      <div onClick={() => f(toggle.key, !(form as any)[toggle.key])}
                        className={`w-10 h-6 rounded-full transition-all relative cursor-pointer ${(form as any)[toggle.key] ? 'bg-green-500' : 'bg-slate-600'}`}>
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${(form as any)[toggle.key] ? 'left-[18px]' : 'left-0.5'}`} />
                      </div>
                      <div>
                        <p className="text-slate-300 text-sm font-semibold">{toggle.label}</p>
                        <p className="text-slate-600 text-xs">{toggle.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white rounded-xl font-semibold transition-colors">
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  )
}
