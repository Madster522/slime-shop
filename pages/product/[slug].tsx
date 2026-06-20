import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { fallbackProducts } from '@/lib/mockData'
import { formatMoney } from '@/lib/utils'
import type { CartCustomization, Product } from '@/types/shop'

export default function ProductPage() {
  const router = useRouter()
  const slug = String(router.query.slug || '')
  const { addItem } = useCart()
  const [products, setProducts] = useState<Product[]>(fallbackProducts)
  const [quantity, setQuantity] = useState(1)
  const [customization, setCustomization] = useState<CartCustomization>({})

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        if (data.products?.length) setProducts(data.products)
      })
      .catch(() => {})
  }, [])

  const product = useMemo(() => products.find(p => p.slug === slug), [products, slug])

  if (!product) {
    return <main className="min-h-screen bg-slate-950 px-6 py-16 text-white"><div className="mx-auto max-w-3xl slime-card p-8">Product not found.</div></main>
  }

  const schema = product.customization_schema || {}

  function addToCart() {
    addItem(product, quantity, product.is_customizable ? customization : undefined)
    toast.success('Added to cart')
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2">
        <div className="slime-card flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-green-500/20 to-slate-950 text-8xl">
          {product.image_url ? <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" /> : '🧪'}
        </div>
        <div className="slime-card p-8">
          <Link href="/shop" className="text-sm font-bold text-green-300">← Back to shop</Link>
          <h1 className="mt-4 text-4xl font-black">{product.name}</h1>
          <p className="mt-3 text-3xl font-black text-green-300">{formatMoney(product.price)}</p>
          <p className="mt-5 text-slate-300 leading-relaxed">{product.description || 'Custom 3D printed product.'}</p>
          {product.is_customizable ? (
            <div className="mt-8 rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
              <h2 className="text-xl font-black">Customize this product</h2>
              <p className="mt-1 text-sm text-slate-400">These options will be saved with your cart item.</p>
              <div className="mt-5 grid gap-4">
                {schema.allow_text ? <input className="slime-input" placeholder="Custom text/name" value={customization.text || ''} onChange={e => setCustomization({ ...customization, text: e.target.value })} /> : null}
                {schema.allow_color ? <input className="slime-input" placeholder="Preferred color" value={customization.color || ''} onChange={e => setCustomization({ ...customization, color: e.target.value })} /> : null}
                {schema.allow_size ? <select className="slime-input" value={customization.size || ''} onChange={e => setCustomization({ ...customization, size: e.target.value })}>
                  <option value="">Choose size</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                </select> : null}
              </div>
            </div>
          ) : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input type="number" min={1} max={99} value={quantity} onChange={e => setQuantity(Math.max(1, Number(e.target.value)))} className="slime-input sm:w-28" />
            <button onClick={addToCart} className="slime-button flex-1">Add to Cart</button>
          </div>
        </div>
      </section>
    </main>
  )
}
