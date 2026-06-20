import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import AdminLayout from '@/components/layout/AdminLayout'
import { slugify } from '@/lib/slugify'
import { formatMoney } from '@/lib/utils'
import type { Product } from '@/types/shop'

const blank = {
  name: '',
  slug: '',
  description: '',
  price: 0,
  image_url: '',
  category: '',
  is_active: true,
  is_featured: false,
  is_customizable: false,
  customization_schema: { allow_text: false, allow_color: false, allow_size: false },
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState<any>(blank)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function loadProducts() {
    const res = await fetch('/api/admin/products')
    const data = await res.json()
    setProducts(data.products || [])
  }

  useEffect(() => { loadProducts().catch(() => {}) }, [])

  function edit(product: Product) {
    setEditingId(product.id)
    setForm({
      ...blank,
      ...product,
      customization_schema: { allow_text: false, allow_color: false, allow_size: false, ...(product.customization_schema || {}) },
    })
  }

  function reset() {
    setEditingId(null)
    setForm(blank)
  }

  async function save() {
    setLoading(true)
    try {
      const method = editingId ? 'PATCH' : 'POST'
      const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products'
      const body = { ...form, slug: form.slug || slugify(form.name) }
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      toast.success(editingId ? 'Product updated' : 'Product created')
      reset()
      await loadProducts()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this product?')) return
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (!res.ok) return toast.error('Delete failed')
    toast.success('Deleted')
    loadProducts().catch(() => {})
  }

  return (
    <AdminLayout title="Products">
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <section className="slime-card h-fit p-6">
          <h2 className="text-2xl font-black">{editingId ? 'Edit Product' : 'Add Product'}</h2>
          <div className="mt-5 grid gap-3">
            <input className="slime-input" placeholder="Product name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} />
            <input className="slime-input" placeholder="Slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
            <input className="slime-input" placeholder="Category" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} />
            <input className="slime-input" type="number" min={0} step="0.01" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
            <input className="slime-input" placeholder="Image URL" value={form.image_url || ''} onChange={e => setForm({ ...form, image_url: e.target.value })} />
            <textarea className="slime-input min-h-28" placeholder="Description" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
            <Toggle label="Active" checked={form.is_active} onChange={v => setForm({ ...form, is_active: v })} />
            <Toggle label="Featured" checked={form.is_featured} onChange={v => setForm({ ...form, is_featured: v })} />
            <Toggle label="Customizable product" checked={form.is_customizable} onChange={v => setForm({ ...form, is_customizable: v })} />
            {form.is_customizable ? (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4">
                <p className="font-bold">Customer fields</p>
                <Toggle label="Allow custom text/name" checked={form.customization_schema.allow_text} onChange={v => setForm({ ...form, customization_schema: { ...form.customization_schema, allow_text: v } })} />
                <Toggle label="Allow preferred color" checked={form.customization_schema.allow_color} onChange={v => setForm({ ...form, customization_schema: { ...form.customization_schema, allow_color: v } })} />
                <Toggle label="Allow size choice" checked={form.customization_schema.allow_size} onChange={v => setForm({ ...form, customization_schema: { ...form.customization_schema, allow_size: v } })} />
              </div>
            ) : null}
            <button disabled={loading} onClick={save} className="slime-button">{editingId ? 'Update Product' : 'Create Product'}</button>
            {editingId ? <button onClick={reset} className="slime-button-secondary">Cancel Edit</button> : null}
          </div>
        </section>
        <section className="grid gap-4">
          {products.map(product => (
            <article key={product.id} className="slime-card p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h3 className="text-xl font-black">{product.name}</h3>
                  <p className="text-green-300 font-bold">{formatMoney(product.price)}</p>
                  <p className="mt-1 text-sm text-slate-400">/{product.slug} · {product.category || 'No category'} {product.is_customizable ? '· Customizable' : ''}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => edit(product)} className="slime-button-secondary">Edit</button>
                  <button onClick={() => remove(product.id)} className="slime-button-secondary">Delete</button>
                </div>
              </div>
            </article>
          ))}
          {!products.length ? <div className="slime-card p-8 text-center text-slate-400">No products yet. Add one using the form.</div> : null}
        </section>
      </div>
    </AdminLayout>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950 px-4 py-3"><span className="font-semibold">{label}</span><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="h-5 w-5 accent-green-500" /></label>
}
