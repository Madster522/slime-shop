import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="text-2xl font-black">Slime Shop</div>
          <p className="mt-3 max-w-xl text-slate-400">Custom 3D printed products with a clean checkout, order tracking, and transparent store status.</p>
        </div>
        <div>
          <div className="font-bold">Company</div>
          <div className="mt-3 flex flex-col gap-2 text-slate-400">
            <Link href="/status">Status</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
        </div>
        <div>
          <div className="font-bold">Shop</div>
          <div className="mt-3 flex flex-col gap-2 text-slate-400">
            <Link href="/shop">Products</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/track">Track Order</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-4 text-center text-sm text-slate-500">© {new Date().getFullYear()} Slime Shop. All rights reserved.</div>
    </footer>
  )
}
