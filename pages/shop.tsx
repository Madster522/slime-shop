import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/shop/ProductCard'

const CATEGORIES = ['All','Keychains','Figures','Home Decor','Accessories','Other']
const SORT_OPTIONS = [
  { value: 'default',    label: 'Featured' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name',       label: 'Name A–Z' },
]

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('default')
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (category && category !== 'All') params.append('category', category)
    if (sort !== 'default') params.append('sort', sort)

    fetch(`/api/products?${params}`)
      .then(r => r.json())
      .then(d => { setProducts(d.products || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [search, category, sort])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  return (
    <>
      <Head><title>Shop — Slime Shop</title></Head>
      <Navbar />
      <main className="pt-24 pb-20 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-display text-5xl md:text-6xl text-slate-900 mb-3">Our Products 🛍️</h1>
            <p className="font-body text-slate-500 text-lg">Every item is printed fresh, just for you.</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-4 items-center">
            <form onSubmit={handleSearch} className="flex-1 relative w-full">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
              </svg>
              <input className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                placeholder="Search products…" value={searchInput} onChange={e => setSearchInput(e.target.value)} />
            </form>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${category === cat ? 'bg-green-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-green-50 hover:text-green-600'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="w-full md:w-48 px-4 py-3 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-3xl border border-slate-100 overflow-hidden animate-pulse">
                  <div className="h-56 bg-slate-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                    <div className="h-10 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-7xl mb-6">😢</div>
              <h3 className="font-display text-2xl text-slate-700 mb-2">No products found</h3>
              <p className="font-body text-slate-500 mb-6">Try adjusting your search or filters.</p>
              <button onClick={() => { setSearch(''); setSearchInput(''); setCategory('All') }} className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-6">{products.length} product{products.length !== 1 ? 's' : ''}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
