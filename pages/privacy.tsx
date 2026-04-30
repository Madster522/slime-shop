import React from 'react'
import Head from 'next/head'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SUPPORT_EMAILS } from '@/config/constants'

export default function PrivacyPage() {
  return (
    <>
      <Head><title>Privacy Policy — Slime Shop</title></Head>
      <Navbar />
      <main className="pt-24 pb-20 min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="font-display text-4xl text-slate-900 mb-8">Privacy Policy</h1>
          <div className="card prose prose-slate max-w-none font-body">
            <p className="text-slate-600 leading-relaxed mb-4">Last updated: {new Date().toLocaleDateString()}</p>
            <h2 className="font-display text-2xl text-slate-800 mt-6 mb-3">Information We Collect</h2>
            <p className="text-slate-600 leading-relaxed mb-4">We collect your name and email address via Google sign-in, shipping addresses for order fulfillment, and order history associated with your account.</p>
            <h2 className="font-display text-2xl text-slate-800 mt-6 mb-3">Payment Information</h2>
            <p className="text-slate-600 leading-relaxed mb-4">Payments are processed by Stripe. We store only the card brand and last 4 digits for your records. We never store full card numbers or CVV codes.</p>
            <h2 className="font-display text-2xl text-slate-800 mt-6 mb-3">How We Use Your Information</h2>
            <p className="text-slate-600 leading-relaxed mb-4">We use your information solely to process and fulfill your orders, send order confirmations, and respond to your support inquiries.</p>
            <h2 className="font-display text-2xl text-slate-800 mt-6 mb-3">Contact</h2>
            <p className="text-slate-600 leading-relaxed">Questions? Email us at <a href={`mailto:${SUPPORT_EMAILS.primary}`} className="text-green-600 hover:underline">{SUPPORT_EMAILS.primary}</a></p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
