import { useEffect, useState } from 'react'
import ProductCard from '@/components/shop/ProductCard'
import { fallbackProducts } from '@/lib/mockData'
import type { Product } from '@/types/shop'

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        if (data.products?.length) setProducts(data.products)
      })
      .catch(() => {})
  }, [])

  const filtered = products.filter(product => [product.name, product.category, product.description].join(' ').toLowerCase().includes(query.toLowerCase()))

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-green-300 font-bold">Shop</p>
            <h1 className="text-4xl font-black">Products</h1>
            <p className="mt-2 text-slate-400">Browse regular and customizable products.</p>
          </div>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products..." className="slime-input max-w-sm" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
    </main>
  )
}
