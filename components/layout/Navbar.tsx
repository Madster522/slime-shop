import Link from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useCart } from '@/context/CartContext'
import Image from 'next/image'

export default function Navbar() {
  const { data: session } = useSession()
  const { count } = useCart()

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 font-black text-xl">
          <Image
            src="/logo.png"
            alt="Slime Shop Logo"
            width={36}
            height={36}
            className="rounded-full"
          />
          <span className="text-lg font-bold text-white">Slime Shop</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/cart" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold hover:bg-white/10">Cart {count ? `(${count})` : ''}</Link>
          {session ? (
            <button onClick={() => signOut()} className="hidden rounded-xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/15 sm:block">Sign out</button>
          ) : (
            <button onClick={() => signIn('google')} className="hidden rounded-xl bg-green-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-green-400 sm:block">Admin Login</button>
          )}
        </div>
      </div>
    </header>
  )
}
