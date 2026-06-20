import Link from 'next/link'
import { useEffect, useState } from 'react'
import ProductCard from '@/components/shop/ProductCard'
import { fallbackProducts } from '@/lib/mockData'
import type { Product } from '@/types/shop'
import Head from 'next/head'
import Image from 'next/image'

<Head>
  <title>Slime Shop | Custom 3D Prints</title>
  <meta name="description" content="Custom 3D prints, custom products, and a real-looking online store." />
  <link rel="icon" href="/logo.png" />
</Head>

export default function Home() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts)

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        if (data.products?.length) setProducts(data.products)
      })
      .catch(() => {})
  }, [])

  const featured = products.filter(p => p.is_featured).slice(0, 3)

  return (
    <div className="max-w-xl">
      <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-green-300">
        SLIME SHOP
      </p>

      <h1 className="text-5xl font-extrabold leading-tight text-white md:text-7xl">
        Custom products made for real people.
      </h1>

      <p className="mt-6 text-lg text-gray-300">
        Shop custom 3D prints, personalize products, use coupons safely, and check live store status anytime.
      </p>

      <div className="mt-8 flex gap-4">
        <a
          href="/shop"
          className="rounded-xl bg-green-500 px-6 py-3 font-semibold text-black hover:bg-green-400"
        >
          Shop Products
        </a>

        <a
          href="/status"
          className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10"
        >
          View Store Status
        </a>
      </div>
    </div>
  )
}
