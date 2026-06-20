import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { formatMoney } from '@/lib/utils'

export default function CheckoutPage() {
  const { items, total } = useCart()
  const [acceptingOrders, setAcceptingOrders] = useState(true)
  const [maintenance, setMaintenance] = useState(false)

  useEffect(() => {
    fetch('/api/site-settings')
      .then(r => r.json())
      .then(data => {
        setAcceptingOrders(Boolean(data.status?.accepting_orders))
        setMaintenance(Boolean(data.status?.maintenance_mode))
      })
      .catch(() => {})
  }, [])

  const blocked = !acceptingOrders || maintenance

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-3xl slime-card p-8">
        <h1 className="text-4xl font-black">Checkout</h1>
        {blocked ? (
          <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5 text-yellow-100">
            Checkout is currently paused. Check the store status page for updates.
          </div>
        ) : null}
        <div className="mt-6 space-y-3 text-slate-300">
          <div className="flex justify-between"><span>Items</span><span>{items.length}</span></div>
          <div className="flex justify-between text-xl font-black text-white"><span>Total</span><span>{formatMoney(total)}</span></div>
        </div>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-300">
          Payment placeholder: connect your Stripe/Square payment code here. The cart, customizations, coupon safety, and checkout block are already set up.
        </div>
        <div className="mt-6 flex gap-3">
          <Link href="/cart" className="slime-button-secondary">Back to Cart</Link>
          <button disabled={blocked || !items.length} className="slime-button">Place Test Order</button>
        </div>
      </section>
    </main>
  )
}
