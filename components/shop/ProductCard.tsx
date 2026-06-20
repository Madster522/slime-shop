import Link from 'next/link'
import type { Product } from '@/types/shop'
import { formatMoney } from '@/lib/utils'

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.slug}`} className="slime-card group overflow-hidden transition hover:-translate-y-1 hover:border-green-400/40">
      <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-green-500/20 via-slate-900 to-slate-950 text-6xl">
        {product.image_url ? <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" /> : '🧪'}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-black text-lg group-hover:text-green-300">{product.name}</h3>
          <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-bold text-green-300">{formatMoney(product.price)}</span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-slate-400">{product.description || 'Custom 3D printed product.'}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {product.category ? <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">{product.category}</span> : null}
          {product.is_customizable ? <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-300">Customizable</span> : null}
        </div>
      </div>
    </Link>
  )
}
