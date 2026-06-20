import Link from 'next/link'
import React from 'react'
import AdminGuard from '@/components/ui/AdminGuard'

const links = [
  ['/admin', 'Dashboard'],
  ['/admin/products', 'Products'],
  ['/admin/coupons', 'Coupons'],
  ['/admin/settings', 'Company Settings'],
]

export default function AdminLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <AdminGuard>
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
          <aside className="hidden w-64 shrink-0 md:block">
            <div className="slime-card sticky top-24 p-4">
              <div className="px-3 pb-4 text-xl font-black">Admin Panel</div>
              <nav className="flex flex-col gap-2">
                {links.map(([href, label]) => (
                  <Link key={href} href={href} className="rounded-xl px-3 py-2 font-semibold text-slate-300 hover:bg-white/10 hover:text-white">{label}</Link>
                ))}
              </nav>
            </div>
          </aside>
          <section className="min-w-0 flex-1">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-3xl font-black">{title}</h1>
              <Link href="/" className="slime-button-secondary">View Store</Link>
            </div>
            {children}
          </section>
        </div>
      </main>
    </AdminGuard>
  )
}
