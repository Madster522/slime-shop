import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function OrderConfirmationPage() {
  const router = useRouter()
  const { number, id } = router.query
  const [show, setShow] = useState(false)

  useEffect(() => { setTimeout(() => setShow(true), 100) }, [])

  if (!number) return null

  return (
    <>
      <Head><title>Order Confirmed! — Slime Shop</title></Head>
      <Navbar />
      <main className="pt-24 pb-20 min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4">
        <div className={`text-center max-w-md w-full transition-all duration-700 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Checkmark */}
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-300/50">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-slate-900 mb-2">Order Confirmed! 🎉</h1>
          <p className="text-slate-500 mb-6">Thank you for your order — we'll start printing soon!</p>

          {/* Order number */}
          <div className="bg-white rounded-2xl border border-green-200 p-5 mb-8 shadow-sm">
            <p className="text-slate-500 text-sm mb-1">Your Order Number</p>
            <p className="font-mono font-bold text-2xl text-green-600">{number}</p>
            <p className="text-slate-400 text-xs mt-2">Save this to track your order</p>
          </div>

          {/* What's next */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-8 text-left shadow-sm">
            <h3 className="font-bold text-slate-800 mb-3">What happens next?</h3>
            <div className="space-y-3">
              {[
                { icon: '🖨️', text: "We'll start 3D printing your order" },
                { icon: '📦', text: "It'll be carefully packed and shipped" },
                { icon: '📧', text: 'Track your order with your order number' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="text-lg">{s.icon}</span>
                  <span>{s.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={`/track?order=${number}`}
              className="flex-1 py-3.5 bg-green-500 hover:bg-green-600 active:scale-95 text-white font-bold rounded-2xl transition-all text-center">
              Track Order 📦
            </Link>
            <Link href="/shop"
              className="flex-1 py-3.5 border-2 border-slate-200 hover:border-green-400 text-slate-700 font-bold rounded-2xl transition-all text-center">
              Keep Shopping 🛍️
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
