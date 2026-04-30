import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'

const NAV = [
  { href: '/admin',                 label: 'Dashboard',       icon: '📊' },
  { href: '/admin/orders',          label: 'Orders',          icon: '📦' },
  { href: '/admin/products',        label: 'Products',        icon: '🟢' },
  { href: '/admin/customers',       label: 'Customers',       icon: '👥' },
  { href: '/admin/reviews',         label: 'Reviews',         icon: '⭐' },
  { href: '/admin/coupons',         label: 'Coupons',         icon: '🎟️' },
  { href: '/admin/printers',        label: 'Printers',        icon: '🖨️' },
  { href: '/admin/print-queue',     label: 'Print Queue',     icon: '⏳' },
  { href: '/admin/monitoring',      label: 'Monitoring',      icon: '📡' },
  { href: '/admin/gcode',           label: 'G-Code',          icon: '💾' },
  { href: '/admin/camera',          label: 'Camera',          icon: '📷' },
  { href: '/admin/thank-you-cards', label: 'Thank You Cards', icon: '💌' },
  { href: '/admin/bugs',            label: 'Bug Reports',     icon: '🐛' },
  { href: '/admin/settings',        label: 'Settings',        icon: '⚙️' },
]

interface Props { mobileOpen?: boolean; onClose?: () => void }

export default function AdminSidebar({ mobileOpen, onClose }: Props) {
  const router = useRouter()
  const { data: session } = useSession()

  const isActive = (href: string) =>
    href === '/admin' ? router.pathname === '/admin' : router.pathname.startsWith(href)

  const Content = () => (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700/50">
      <div className="p-5 border-b border-slate-700/50">
        <Link href="/" className="flex items-center gap-3" onClick={onClose}>
          <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center text-lg shrink-0">🟢</div>
          <div>
            <div className="text-white font-bold text-sm leading-none">Slime Shop</div>
            <div className="text-slate-500 text-xs mt-0.5">Admin Panel</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-0.5">
          {NAV.map(item => (
            <Link key={item.href} href={item.href} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive(item.href)
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}>
              <span className="text-base w-5 text-center shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        {session?.user && (
          <div className="flex items-center gap-3 mb-3">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0">
                {session.user.name?.[0]?.toUpperCase() || 'A'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{session.user.name}</p>
              <p className="text-slate-500 text-xs truncate">{session.user.email}</p>
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <Link href="/" className="flex-1 text-center py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors font-semibold">🌐 Shop</Link>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="flex-1 py-1.5 text-xs text-red-400 hover:text-red-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors font-semibold">Sign Out</button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 z-40"><Content /></div>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={onClose} />
          <div className="relative w-64 h-full"><Content /></div>
        </div>
      )}
    </>
  )
}
