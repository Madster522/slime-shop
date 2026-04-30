import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import toast from 'react-hot-toast'
import { SUPPORT_EMAILS, DISCORD_LINKS } from '@/config/constants'

const FAQS = [
  { q: 'How long does printing take?', a: 'Most items print and ship within 3–5 business days. Complex items may take up to 7 days.' },
  { q: 'Can I customize my order?', a: 'Yes! Most products support custom colors, text, and more. Look for the ✨ Custom badge on the product page.' },
  { q: 'What material do you use?', a: 'We primarily use PLA and PETG filaments. They\'re strong, safe, and eco-friendly.' },
  { q: 'Do you accept returns?', a: 'If your item arrives damaged or is defective, we\'ll reprint or refund it. Just contact us with photos.' },
  { q: 'How do I track my order?', a: 'Visit the Track Order page and enter your order number. You\'ll see live status updates.' },
  { q: 'Can I change my order after placing it?', a: 'Contact us within 1 hour of placing your order — once printing starts, changes aren\'t possible.' },
]

export default function ContactPage() {
  const [form, setForm]     = useState({ name: '', email: '', subject: 'General Inquiry', message: '', order_number: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) { toast.error('Please fill in all required fields'); return }
    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to send'); return }
      setSent(true)
      toast.success("Message sent! We'll reply within 24 hours. 💚")
    } finally { setSending(false) }
  }

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  return (
    <>
      <Head><title>Contact — Slime Shop</title></Head>
      <Navbar />
      <main className="pt-20 pb-20 min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3">Get in Touch 👋</h1>
            <p className="text-slate-500 text-lg">We reply within 24 hours. Check the FAQ below first!</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-14">
            {/* Contact methods */}
            <div className="space-y-4">
              {[
                { icon: '📧', title: 'Email Us', value: SUPPORT_EMAILS.primary, href: `mailto:${SUPPORT_EMAILS.primary}`, desc: 'Replies within 24h' },
                { icon: '💬', title: 'Join Discord', value: 'Get instant help', href: DISCORD_LINKS.joinServer, desc: 'Fastest way to reach us' },
                { icon: '📦', title: 'Track Order', value: 'Order status', href: '/track', desc: 'Check live updates' },
              ].map(card => (
                <a key={card.title} href={card.href} target={card.href.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-green-300 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:bg-green-100 transition-colors">{card.icon}</div>
                  <div>
                    <p className="font-bold text-slate-800">{card.title}</p>
                    <p className="text-green-600 text-sm font-semibold">{card.value}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{card.desc}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Contact form */}
            <div className="lg:col-span-2">
              {sent ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-green-200 shadow-sm">
                  <div className="text-6xl mb-4">💚</div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Message Sent!</h2>
                  <p className="text-slate-500 mb-6">We'll get back to you within 24 hours.</p>
                  <button onClick={() => setSent(false)} className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold">Send Another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">Send a Message</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="label">Your Name *</label>
                      <input value={form.name} onChange={e => f('name', e.target.value)} placeholder="Jane Doe" className="input" />
                    </div>
                    <div>
                      <label className="label">Email *</label>
                      <input type="email" value={form.email} onChange={e => f('email', e.target.value)} placeholder="jane@example.com" className="input" />
                    </div>
                    <div>
                      <label className="label">Subject</label>
                      <select value={form.subject} onChange={e => f('subject', e.target.value)} className="input bg-white">
                        {['General Inquiry','Order Issue','Product Question','Customization Request','Shipping Question','Other'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Order Number (if applicable)</label>
                      <input value={form.order_number} onChange={e => f('order_number', e.target.value)} placeholder="SS-XXXX-XX" className="input font-mono" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">Message *</label>
                      <textarea value={form.message} onChange={e => f('message', e.target.value)} rows={5} placeholder="How can we help?"
                        className="input resize-none" />
                    </div>
                  </div>
                  <button type="submit" disabled={sending}
                    className="w-full py-4 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold rounded-xl text-lg transition-colors">
                    {sending ? 'Sending…' : 'Send Message 💚'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4">
                    <span className="font-semibold text-slate-800">{faq.q}</span>
                    <svg className={`w-5 h-5 text-green-500 transition-transform shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  {openFaq === i && <div className="px-5 pb-4 text-slate-600 text-sm leading-relaxed">{faq.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
