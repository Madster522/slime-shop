import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/shop/ProductCard'
import toast from 'react-hot-toast'

const STEPS = [
  { icon: '🛒', title: 'Browse & Order',    desc: 'Pick your favorite and customize it.' },
  { icon: '🖨️', title: 'We 3D Print It',   desc: 'Fresh-printed just for you.' },
  { icon: '📦', title: 'Shipped Fast',      desc: 'Carefully packed and on its way.' },
  { icon: '💚', title: 'You Love It!',      desc: 'Track live and enjoy your creation.' },
]

const PERKS = [
  { icon: '🎨', title: 'Fully Custom',    desc: 'Colors, names, and styles — your way.' },
  { icon: '🖨️', title: 'Fresh Printed',  desc: 'Made on demand, never sitting in a warehouse.' },
  { icon: '⚡', title: '3–5 Day Shipping', desc: 'Fast turnaround from print to your door.' },
  { icon: '💚', title: '100% Guaranteed', desc: 'Damaged? We reprint or refund. No hassle.' },
]

const TESTIMONIALS = [
  { name: 'Sarah M.',    rating: 5, text: 'The keychain came out perfect! The green color is exactly what I wanted. Super fast shipping too.', product: 'Slime Keychain' },
  { name: 'Jake T.',     rating: 5, text: 'My kids absolutely love the slime figures. Great quality and really fun designs. Ordering again!', product: 'Slime Figure Pack' },
  { name: 'Alyssa R.',   rating: 5, text: 'Ordered a custom name keychain and it arrived in 4 days. The print quality is amazing!', product: 'Custom Keychain' },
]

function Stars({ n }: { n: number }) {
  return <span>{Array(n).fill('⭐').join('')}</span>
}

export default function HomePage() {
  const [featured, setFeatured]     = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [email, setEmail]           = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [openFaq, setOpenFaq]       = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/products?featured=true')
      .then(r => r.json())
      .then(d => {
        const prods = d.products || []
        if (prods.length === 0) return fetch('/api/products').then(r => r.json()).then(d2 => setFeatured((d2.products || []).slice(0, 3)))
        setFeatured(prods.slice(0, 3))
      })
      .catch(() => {})
      .finally(() => setLoadingProducts(false))
  }, [])

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubscribing(true)
    try {
      const res = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      const data = await res.json()
      if (res.ok) { toast.success(data.message || "You're subscribed! 🎉"); setEmail('') }
      else toast.error(data.error || 'Failed to subscribe')
    } finally { setSubscribing(false) }
  }

  const FAQS = [
    { q: 'How long does printing take?', a: '3–5 business days from order to your door.' },
    { q: 'Can I customize my order?', a: 'Yes! Most items support custom colors and text.' },
    { q: 'What materials do you use?', a: 'PLA and PETG filaments — strong, safe, and eco-friendly.' },
    { q: 'Do you accept returns?', a: 'Damaged item? We reprint or refund it, no questions asked.' },
  ]

  return (
    <>
      <Head>
        <title>Slime Shop — Custom 3D Printed Slime Goodies</title>
        <meta name="description" content="Custom 3D printed slime-themed products — keychains, figures, and more. Made fresh just for you!" />
      </Head>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 pt-16">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-10 w-64 h-64 bg-pink-300/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold mb-6 border border-green-200">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Fresh Prints Ready Now
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold text-slate-900 leading-none mb-6">
            Slime<span className="text-green-500"> Shop</span> 🟢
          </h1>
          <p className="text-xl sm:text-2xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Custom 3D printed slime-themed goodies. Keychains, figures, and more — made fresh just for you. 💚
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop" className="px-10 py-4 bg-green-500 hover:bg-green-600 active:scale-95 text-white font-bold rounded-2xl text-lg transition-all shadow-lg shadow-green-200">
              Shop Now 🛍️
            </Link>
            <Link href="/track" className="px-10 py-4 border-2 border-slate-200 hover:border-green-400 text-slate-700 font-bold rounded-2xl text-lg transition-all">
              Track Order 📦
            </Link>
          </div>
          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 text-slate-500 text-sm">
            <span>✅ 100% Custom Made</span>
            <span>🚚 Fast Shipping</span>
            <span>🔒 Secure Checkout</span>
            <span>💚 Satisfaction Guaranteed</span>
          </div>
        </div>
      </section>

      {/* ── Perks ── */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {PERKS.map((p, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl mb-3">{p.icon}</div>
              <h3 className="font-bold text-slate-800 mb-1">{p.title}</h3>
              <p className="text-slate-500 text-sm">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured products ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-2">Featured Products</h2>
              <p className="text-slate-500">Fresh off the printer — ready for you</p>
            </div>
            <Link href="/shop" className="hidden sm:inline-flex px-5 py-2.5 border-2 border-slate-200 hover:border-green-400 text-slate-700 font-semibold rounded-2xl transition-colors text-sm">
              View All →
            </Link>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-3xl border border-slate-100 overflow-hidden animate-pulse">
                  <div className="h-52 bg-slate-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                    <div className="h-10 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
              <p className="text-4xl mb-4">🛍️</p>
              <p className="text-slate-500 mb-4">Products coming soon!</p>
              <Link href="/shop" className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold">Browse Shop</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}

          <div className="text-center mt-8">
            <Link href="/shop" className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 active:scale-95 text-white font-bold rounded-2xl text-lg transition-all shadow-sm">
              Browse All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-slate-900 mb-3">How It Works</h2>
            <p className="text-slate-500">From click to doorstep in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((s, i) => (
              <div key={i} className="text-center group">
                <div className="w-20 h-20 mx-auto mb-4 bg-green-50 rounded-3xl flex items-center justify-center text-4xl shadow-sm group-hover:scale-110 transition-all border border-green-100">
                  {s.icon}
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center">{i+1}</span>
                  <h3 className="font-bold text-slate-800">{s.title}</h3>
                </div>
                <p className="text-slate-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-2">What Customers Say 💚</h2>
            <p className="text-slate-500">Real orders, real smiles</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <Stars n={t.rating} />
                <p className="text-slate-600 mt-3 mb-4 leading-relaxed text-sm">"{t.text}"</p>
                <div>
                  <p className="font-bold text-slate-800">{t.name}</p>
                  <p className="text-slate-400 text-xs">{t.product}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-2">FAQ</h2>
            <p className="text-slate-500">Quick answers to common questions</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4">
                  <span className="font-semibold text-slate-800 text-sm">{faq.q}</span>
                  <svg className={`w-5 h-5 text-green-500 transition-transform shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                {openFaq === i && <div className="px-5 pb-4 text-slate-600 text-sm">{faq.a}</div>}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/contact" className="text-green-600 font-semibold hover:underline">Have another question? Contact us →</Link>
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="py-16 bg-green-500">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Get Slime Updates 📬</h2>
          <p className="text-green-100 mb-8">New products, exclusive discounts, behind-the-scenes prints.</p>
          <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-5 py-3.5 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-200 text-sm"
            />
            <button type="submit" disabled={subscribing}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold rounded-xl transition-colors whitespace-nowrap">
              {subscribing ? 'Subscribing…' : 'Subscribe 💚'}
            </button>
          </form>
          <p className="text-green-200 text-xs mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      <Footer />
    </>
  )
}
