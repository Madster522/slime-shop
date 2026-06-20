import { useState } from 'react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { getCustomizationKey, useCart } from '@/context/CartContext'
import { formatMoney } from '@/lib/utils'

export default function CartPage() {
  const { items, subtotal, discount, total, coupon, setCoupon, updateQuantity, removeItem } = useCart()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  async function applyCoupon() {
    setLoading(true)
    try {
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not apply coupon')
      setCoupon(data.coupon)
      toast.success(data.coupon.message || 'Coupon applied')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_420px]">
        <div>
          <h1 className="text-4xl font-black">Cart</h1>
          <div className="mt-8 grid gap-4">
            {!items.length ? <div className="slime-card p-8 text-center text-slate-400">Your cart is empty. <Link href="/shop" className="text-green-300">Shop now</Link>.</div> : null}
            {items.map(item => {
              const key = getCustomizationKey(item.customization)
              return (
                <div key={`${item.product.id}-${key}`} className="slime-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-green-500/10 text-4xl">🧪</div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-black">{item.product.name}</h2>
                    <p className="text-green-300 font-bold">{formatMoney(item.product.price)}</p>
                    {item.customization ? <p className="mt-2 text-sm text-slate-400">Custom: {Object.entries(item.customization).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(', ') || 'None'}</p> : null}
                  </div>
                  <input type="number" min={1} value={item.quantity} onChange={e => updateQuantity(item.product.id, Number(e.target.value), key)} className="slime-input sm:w-24" />
                  <button onClick={() => removeItem(item.product.id, key)} className="slime-button-secondary">Remove</button>
                </div>
              )
            })}
          </div>
        </div>
        <aside className="slime-card h-fit p-6">
          <h2 className="text-2xl font-black">Order Summary</h2>
          <div className="mt-5 space-y-3 text-slate-300">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div>
            <div className="flex justify-between"><span>Discount {coupon ? `(${coupon.code})` : ''}</span><span>-{formatMoney(discount)}</span></div>
            <div className="border-t border-white/10 pt-3 flex justify-between text-xl font-black text-white"><span>Total</span><span>{formatMoney(total)}</span></div>
          </div>
          <div className="mt-6 flex gap-2">
            <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Coupon code" className="slime-input" />
            <button onClick={applyCoupon} disabled={loading || !items.length} className="slime-button">Apply</button>
          </div>
          <p className="mt-3 text-xs text-slate-500">Coupons are capped so your total never goes below $0.00.</p>
          <Link href="/checkout" className={`mt-6 w-full ${items.length ? 'slime-button' : 'slime-button opacity-50 pointer-events-none'}`}>Checkout</Link>
        </aside>
      </section>
    </main>
  )
}
