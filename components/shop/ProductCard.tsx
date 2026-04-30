import React from 'react'
import Link from 'next/link'
import { formatDollars } from '@/lib/utils'
import type { Product } from '@/types'

interface Props { product: Product; index?: number }

const STOCK: Record<string, { label: string; cls: string }> = {
  in_stock:      { label: '✅ In Stock',       cls: 'bg-green-100 text-green-700' },
  out_of_stock:  { label: '❌ Out of Stock',   cls: 'bg-red-100 text-red-700' },
  made_to_order: { label: '🖨️ Made to Order', cls: 'bg-blue-100 text-blue-700' },
}

export default function ProductCard({ product }: Props) {
  const stock = STOCK[product.stock_status] || STOCK.made_to_order
  const unavailable = product.stock_status === 'out_of_stock'
  const img = product.images?.[0]

  return (
    <div className="group bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative h-52 sm:h-56 bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => {
              const t = e.target as HTMLImageElement
              t.style.display = 'none'
              t.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-7xl">🟢</div>'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl">🟢</div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${stock.cls}`}>{stock.label}</span>
        </div>
        {product.has_customization && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">✨ Custom</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-lg text-slate-900 leading-tight">{product.name}</h3>
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full shrink-0">{product.category}</span>
        </div>
        <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">{product.description || 'Custom 3D printed just for you!'}</p>

        {/* Price */}
        <div className="bg-slate-50 rounded-2xl p-3 mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-500">Item</span>
            <span className="font-semibold text-slate-800">{formatDollars(product.price)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Shipping</span>
            <span className="text-slate-500">+{formatDollars(product.shipping_price || 0)}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-slate-200 pt-2">
            <span className="text-slate-700">Total</span>
            <span className="text-green-600 text-lg">{formatDollars((product.price || 0) + (product.shipping_price || 0))}</span>
          </div>
        </div>

        <Link
          href={unavailable ? '#' : `/product/${product.slug}`}
          className={`w-full inline-flex items-center justify-center py-3 px-6 rounded-2xl font-bold text-sm transition-all ${
            unavailable
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none'
              : 'bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md active:scale-95'
          }`}
        >
          {unavailable ? 'Out of Stock' : 'View Product →'}
        </Link>
      </div>
    </div>
  )
}
