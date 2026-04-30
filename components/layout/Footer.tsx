import React, { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { SUPPORT_EMAILS, DISCORD_LINKS } from '@/config/constants'

export default function Footer() {
  const [email, setEmail]         = useState('')
  const [subscribing, setSub] = useState(false)

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSub(true)
    try {
      const res = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      const d = await res.json()
      if (res.ok) { toast.success(d.message || "Subscribed! 🎉"); setEmail('') }
      else toast.error(d.error || 'Failed')
    } finally { setSub(false) }
  }

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🟢</span>
              <span className="text-white font-bold text-lg">Slime Shop</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">Custom 3D printed slime-themed products — keychains, figures, and more. Made fresh just for you.</p>
            <a href={`mailto:${SUPPORT_EMAILS.primary}`} className="text-green-400 text-sm hover:underline">{SUPPORT_EMAILS.primary}</a>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="text-white font-bold mb-4">Shop</h4>
            <div className="space-y-2 text-sm">
              {[['/', 'Home'], ['/shop', 'All Products'], ['/cart', 'Cart'], ['/track', 'Track Order'], ['/account', 'My Account']].map(([href, label]) => (
                <Link key={href} href={href} className="block hover:text-white hover:translate-x-1 transition-all">{label}</Link>
              ))}
            </div>
          </div>

          {/* Support links */}
          <div>
            <h4 className="text-white font-bold mb-4">Support</h4>
            <div className="space-y-2 text-sm">
              {[['/contact', 'Contact Us'], ['/faq', 'FAQ'], ['/privacy', 'Privacy Policy'], ['/terms', 'Terms of Service']].map(([href, label]) => (
                <Link key={href} href={href} className="block hover:text-white hover:translate-x-1 transition-all">{label}</Link>
              ))}
              <a href={DISCORD_LINKS.joinServer} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white hover:translate-x-1 transition-all">
                <span>💬</span> Discord Server
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold mb-4">Stay Updated 📬</h4>
            <p className="text-sm mb-3">New products and exclusive deals, right in your inbox.</p>
            <form onSubmit={subscribe} className="space-y-2">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" />
              <button type="submit" disabled={subscribing}
                className="w-full py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors">
                {subscribing ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-slate-700/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Slime Shop. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-slate-500">
            <span>🔒 Secured by Square</span>
            <span>✅ PCI Compliant</span>
            <span>🚚 Fast Shipping</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
