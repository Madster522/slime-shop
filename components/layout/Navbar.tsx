import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/context/CartContext'

const LINKS = [
  { href: '/',       label: 'Home' },
  { href: '/shop',   label: 'Shop' },
  { href: '/track',  label: 'Track Order' },
  { href: '/contact',label: 'Contact' },
]

export default function Navbar() {
  const { data: session } = useSession()
  const { itemCount } = useCart()
  const router = useRouter()

  const [scrolled, setScrolled]     = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menus on route change
  useEffect(() => { setMenuOpen(false); setProfileOpen(false) }, [router.pathname])

  const isActive = (href: string) => href === '/' ? router.pathname === '/' : router.pathname.startsWith(href)
  const isAdmin  = (session?.user as any)?.isAdmin

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur shadow-sm border-b border-slate-100' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
              <span className="text-2xl">🟢</span>
              <span>Slime Shop</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {LINKS.map(link => (
                <Link key={link.href} href={link.href}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isActive(link.href) ? 'text-green-600 bg-green-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link href="/admin"
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${router.pathname.startsWith('/admin') ? 'text-green-600 bg-green-50' : 'text-purple-600 hover:bg-purple-50'}`}>
                  Admin
                </Link>
              )}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Cart */}
              <Link href="/cart" className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>

              {/* Auth */}
              {session ? (
                <div className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-slate-100 transition-all">
                    {session.user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={session.user.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center font-bold text-sm">
                        {session.user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-slate-700 hidden sm:block max-w-[100px] truncate">
                      {session.user.name?.split(' ')[0]}
                    </span>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>

                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="font-semibold text-slate-800 text-sm truncate">{session.user.name}</p>
                          <p className="text-xs text-slate-400 truncate">{session.user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link href="/account" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                            <span>📦</span> My Orders
                          </Link>
                          <Link href="/track" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                            <span>📍</span> Track Order
                          </Link>
                          {isAdmin && (
                            <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-purple-600 hover:bg-purple-50 font-semibold">
                              <span>⚙️</span> Admin Panel
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-slate-100 py-1">
                          <button onClick={() => signOut({ callbackUrl: '/' })}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
                            <span>👋</span> Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link href="/auth/signin"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 active:scale-95 text-white font-semibold rounded-xl text-sm transition-all">
                  Sign In
                </Link>
              )}

              {/* Mobile menu button */}
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {menuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                  }
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 pb-4 pt-2 space-y-1 shadow-lg">
            {LINKS.map(link => (
              <Link key={link.href} href={link.href}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive(link.href) ? 'text-green-600 bg-green-50' : 'text-slate-700 hover:bg-slate-100'}`}>
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" className="flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-purple-600 hover:bg-purple-50">
                ⚙️ Admin Panel
              </Link>
            )}
            {session ? (
              <>
                <Link href="/account" className="flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  📦 My Orders
                </Link>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50">
                  👋 Sign Out
                </button>
              </>
            ) : (
              <Link href="/auth/signin" className="flex items-center justify-center px-4 py-3 bg-green-500 text-white font-bold rounded-xl">
                Sign In
              </Link>
            )}
          </div>
        )}
      </header>
    </>
  )
}
