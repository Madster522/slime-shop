import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useCart } from '@/context/CartContext'
import { formatDollars } from '@/lib/utils'

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, shippingTotal, total, clearCart } = useCart()

  return (
    <>
      <Head><title>Cart — Slime Shop</title></Head>
      <Navbar />
      <main className="pt-20 pb-20 min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Your Cart 🛒</h1>
            {items.length > 0 && (
              <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-semibold">
                Clear Cart
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-slate-100">
              <div className="text-7xl mb-6">🛒</div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
              <p className="text-slate-500 mb-8">Add some awesome slime products!</p>
              <Link href="/shop" className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-colors text-lg">
                Browse Shop
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map(item => (
                  <div key={item.product.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 sm:p-5 flex gap-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-green-50 shrink-0">
                      {item.product.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">🟢</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-800 leading-tight">{item.product.name}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{item.product.category}</p>
                        </div>
                        <button onClick={() => removeItem(item.product.id)} className="text-slate-300 hover:text-red-400 transition-colors shrink-0 p-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>

                      {item.customization && Object.values(item.customization).some(Boolean) && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {Object.values(item.customization).filter(Boolean).map((v, i) => (
                            <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{v}</span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                        {/* Qty */}
                        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 font-bold transition-colors">−</button>
                          <span className="px-3 py-1.5 font-semibold text-slate-800 min-w-[32px] text-center text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 font-bold transition-colors">+</button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatDollars(item.product.price * item.quantity)}</p>
                          <p className="text-xs text-slate-400">+{formatDollars(item.product.shipping_price || 0)} ship</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div>
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sticky top-24">
                  <h3 className="font-bold text-xl text-slate-800 mb-5">Order Summary</h3>
                  <div className="space-y-2 mb-4">
                    {items.map(item => (
                      <div key={item.product.id} className="flex justify-between text-sm text-slate-600">
                        <span className="truncate mr-3">{item.product.name} ×{item.quantity}</span>
                        <span className="shrink-0">{formatDollars(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Subtotal</span><span>{formatDollars(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Shipping</span><span>{formatDollars(shippingTotal)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-800 text-lg pt-1 border-t border-slate-100">
                      <span>Total</span>
                      <span className="text-green-600 text-xl">{formatDollars(total)}</span>
                    </div>
                  </div>
                  <Link href="/checkout"
                    className="mt-5 w-full inline-flex items-center justify-center py-4 bg-green-500 hover:bg-green-600 active:scale-95 text-white font-bold rounded-2xl text-lg transition-all shadow-sm">
                    Checkout →
                  </Link>
                  <Link href="/shop" className="block text-center text-sm text-slate-400 hover:text-slate-600 mt-3 transition-colors">
                    ← Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
