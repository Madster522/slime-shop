import Link from 'next/link'
import AdminLayout from '@/components/layout/AdminLayout'

const cards = [
  { title: 'Products', href: '/admin/products', body: 'Add products, prices, categories, images, and customization options.' },
  { title: 'Coupons', href: '/admin/coupons', body: 'Create safe discount codes that never make totals negative.' },
  { title: 'Company Settings', href: '/admin/settings', body: 'Control maintenance mode, online status, banners, and company info.' },
]

export default function AdminDashboard() {
  return (
    <AdminLayout title="Dashboard">
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map(card => (
          <Link key={card.href} href={card.href} className="slime-card p-6 transition hover:-translate-y-1 hover:border-green-400/40">
            <h2 className="text-2xl font-black">{card.title}</h2>
            <p className="mt-3 text-slate-400">{card.body}</p>
          </Link>
        ))}
      </div>
      <div className="slime-card mt-8 p-6">
        <h2 className="text-2xl font-black">What changed</h2>
        <div className="mt-4 grid gap-3 text-slate-300 md:grid-cols-2">
          <p>✅ Maintenance mode blocks customers but still lets admins in.</p>
          <p>✅ Store status page looks more like a real company.</p>
          <p>✅ Products can be customizable with text, color, and size fields.</p>
          <p>✅ Coupons are capped at $0.00 so the shop never owes money.</p>
        </div>
      </div>
    </AdminLayout>
  )
}
