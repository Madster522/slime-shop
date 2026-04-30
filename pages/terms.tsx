import React from 'react'
import Head from 'next/head'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SUPPORT_EMAILS } from '@/config/constants'

export default function TermsPage() {
  return (
    <>
      <Head><title>Terms of Service — Slime Shop</title></Head>
      <Navbar />
      <main className="pt-24 pb-20 min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="font-display text-4xl text-slate-900 mb-8">Terms of Service</h1>
          <div className="card font-body">
            <p className="text-slate-600 leading-relaxed mb-4">Last updated: {new Date().toLocaleDateString()}</p>
            <h2 className="font-display text-2xl text-slate-800 mt-6 mb-3">Orders</h2>
            <p className="text-slate-600 leading-relaxed mb-4">All products are made to order. By placing an order, you agree that production begins promptly and cancellations are only accepted within 1 hour of ordering.</p>
            <h2 className="font-display text-2xl text-slate-800 mt-6 mb-3">Refunds</h2>
            <p className="text-slate-600 leading-relaxed mb-4">We offer refunds or reprints for items that arrive damaged or defective. Contact us within 7 days of delivery.</p>
            <h2 className="font-display text-2xl text-slate-800 mt-6 mb-3">Contact</h2>
            <p className="text-slate-600 leading-relaxed">Questions? Email <a href={`mailto:${SUPPORT_EMAILS.primary}`} className="text-green-600 hover:underline">{SUPPORT_EMAILS.primary}</a></p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
