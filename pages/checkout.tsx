import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Script from 'next/script'
import { useRouter } from 'next/router'
import { useSession, signIn } from 'next-auth/react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useCart } from '@/context/CartContext'
import { formatDollars } from '@/lib/utils'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

declare global { interface Window { google?: any; initAutocomplete?: () => void } }

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

const emptyAddr = { full_name:'', line1:'', line2:'', city:'', state:'', zip:'', country:'US', phone:'' }

// ── Stripe Payment Form ──────────────────────────
function StripePaymentForm({
  clientSecret, orderId, orderNumber, finalTotal, addr, onSuccess,
}: {
  clientSecret: string
  orderId: string
  orderNumber: string
  finalTotal: number
  addr: typeof emptyAddr
  onSuccess: () => void
}) {
  const stripe   = useStripe()
  const elements = useElements()
  const [paying, setPaying] = useState(false)
  const [error, setError]   = useState('')

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setPaying(true)
    setError('')

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation?number=${orderNumber}&id=${orderId}`,
        payment_method_data: {
          billing_details: {
            name:    addr.full_name,
            email:   undefined,
            address: {
              line1:       addr.line1,
              line2:       addr.line2 || undefined,
              city:        addr.city,
              state:       addr.state,
              postal_code: addr.zip,
              country:     'US',
            },
          },
        },
      },
    })

    if (stripeError) {
      setError(stripeError.message || 'Payment failed')
      setPaying(false)
    }
    // On success Stripe redirects to return_url automatically
  }

  return (
    <form onSubmit={handlePay}>
      <PaymentElement
        options={{
          layout: 'tabs',
          wallets: { applePay: 'auto', googlePay: 'auto' },
        }}
      />
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || !elements || paying}
        className="mt-6 w-full py-4 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold rounded-xl text-lg transition-colors flex items-center justify-center gap-2"
      >
        {paying ? (
          <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing…</>
        ) : (
          <>🔒 Pay {formatDollars(finalTotal)}</>
        )}
      </button>
      <p className="text-xs text-center text-slate-400 mt-3">
        🔒 Secured by Stripe · Supports Apple Pay & Google Pay
      </p>
    </form>
  )
}

// ── Main Checkout Page ───────────────────────────
export default function CheckoutPage() {
  const { data: session } = useSession()
  const { items, subtotal, shippingTotal, total, clearCart } = useCart()
  const router = useRouter()

  const [step, setStep]           = useState<'shipping'|'payment'>('shipping')
  const [addr, setAddr]           = useState({ ...emptyAddr })
  const [clientSecret, setClientSecret] = useState('')
  const [orderId, setOrderId]     = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [creatingOrder, setCreatingOrder] = useState(false)
  const line1Ref                  = useRef<HTMLInputElement>(null)
  const [mapsLoaded, setMapsLoaded] = useState(false)

  // Coupon
  const [couponCode, setCouponCode] = useState('')
  const [couponData, setCouponData] = useState<any>(null)
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const discount   = couponData?.discount || 0
  const finalTotal = Math.max(0, total - discount)

  useEffect(() => {
    if (session?.user?.name) {
      setAddr(p => ({ ...p, full_name: p.full_name || (session.user.name || '').slice(0, 45) }))
    }
  }, [session])

  // Google Maps autocomplete
  const initAutocomplete = () => {
    if (!line1Ref.current || !window.google) return
    const ac = new window.google.maps.places.Autocomplete(line1Ref.current, {
      componentRestrictions: { country: 'us' },
      fields: ['address_components'],
      types: ['address'],
    })
    ac.addListener('place_changed', () => {
      const place = ac.getPlace()
      if (!place.address_components) return
      let line1 = '', city = '', state = '', zip = ''
      for (const c of place.address_components) {
        const t = c.types[0]
        if (t === 'street_number') line1 = c.long_name + ' '
        if (t === 'route')         line1 += c.long_name
        if (t === 'locality')      city   = c.long_name
        if (t === 'administrative_area_level_1') state = c.short_name
        if (t === 'postal_code')   zip    = c.long_name
      }
      setAddr(p => ({ ...p, line1: line1.trim(), city, state, zip }))
      setTimeout(() => (document.getElementById('addr-line2') as HTMLInputElement)?.focus(), 100)
    })
  }

  useEffect(() => {
    if (mapsLoaded && step === 'shipping') setTimeout(initAutocomplete, 100)
  }, [mapsLoaded, step])

  const up = (k: string, v: string) => setAddr(p => ({ ...p, [k]: v }))
  const validateAddr = () => addr.full_name && addr.line1 && addr.city && addr.state && addr.zip

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setApplyingCoupon(true)
    try {
      const res  = await fetch('/api/coupons/apply', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      setCouponData(data.coupon)
      toast.success(`${formatDollars(data.coupon.discount)} off applied! 🎉`)
    } finally { setApplyingCoupon(false) }
  }

  const handleContinueToPayment = async () => {
    if (!validateAddr()) { toast.error('Fill in all required fields'); return }
    setCreatingOrder(true)
    try {
      // 1. Create order in Supabase
      const orderRes = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            product_id:     i.product.id,
            product_name:   i.product.name.slice(0, 200),
            quantity:       i.quantity,
            unit_price:     i.product.price,
            shipping_price: i.product.shipping_price || 0,
            customization:  i.customization || {},
          })),
          shipping_address: { ...addr, full_name: addr.full_name.slice(0, 45) },
          coupon_id: couponData?.id || null,
          discount,
        }),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) { toast.error(orderData.error || 'Failed to create order'); return }

      // 2. Create Stripe payment intent
      const intentRes = await fetch('/api/payments/create-intent', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotal.toFixed(2), orderId: orderData.order.id }),
      })
      const intentData = await intentRes.json()
      if (!intentRes.ok) { toast.error(intentData.error || 'Payment setup failed'); return }

      setOrderId(orderData.order.id)
      setOrderNumber(orderData.order.order_number)
      setClientSecret(intentData.clientSecret)
      clearCart()
      setStep('payment')
    } catch {
      toast.error('Something went wrong — please try again')
    } finally { setCreatingOrder(false) }
  }

  if (!session) {
    return (
      <>
        <Head><title>Checkout — Slime Shop</title></Head>
        <Navbar />
        <main className="pt-24 pb-20 min-h-screen bg-slate-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-sm border p-8 text-center max-w-sm w-full">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Sign in to checkout</h2>
            <p className="text-slate-500 mb-6">You need an account to place an order.</p>
            <button onClick={() => signIn('google', { callbackUrl: '/checkout' })}
              className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors">
              Sign in with Google
            </button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (items.length === 0 && step === 'shipping') {
    router.replace('/cart')
    return null
  }

  return (
    <>
      <Head><title>Checkout — Slime Shop</title></Head>

      {/* Google Maps */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''}&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => { setMapsLoaded(true); setTimeout(initAutocomplete, 100) }}
      />

      <Navbar />
      <main className="pt-20 pb-20 min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">Checkout</h1>

          {/* Step indicators */}
          <div className="flex items-center gap-3 mb-8">
            {(['shipping','payment'] as const).map((s, i) => {
              const done   = s === 'shipping' && step === 'payment'
              const active = step === s
              return (
                <React.Fragment key={s}>
                  <div className={`flex items-center gap-2 ${active ? 'text-slate-800' : done ? 'text-green-600' : 'text-slate-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${active ? 'bg-green-500 text-white ring-4 ring-green-200' : done ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span className="font-semibold text-sm capitalize">{s}</span>
                  </div>
                  {i < 1 && <div className={`flex-1 h-0.5 max-w-[60px] ${done ? 'bg-green-500' : 'bg-slate-200'}`} />}
                </React.Fragment>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">

              {/* ── SHIPPING ── */}
              {step === 'shipping' && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-1">Shipping Address</h2>
                  {mapsLoaded && (
                    <p className="text-xs text-green-600 mb-4">📍 Start typing your address for autocomplete</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="label">Full Name *</label>
                      <input value={addr.full_name} onChange={e => up('full_name', e.target.value.slice(0, 45))} placeholder="Jane Doe" className="input" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">
                        Address *
                        {mapsLoaded && <span className="ml-2 text-xs text-green-500 font-normal">🗺 Autocomplete on</span>}
                      </label>
                      <input ref={line1Ref} value={addr.line1} onChange={e => up('line1', e.target.value)}
                        placeholder="123 Main Street" className="input" autoComplete="off" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">Apt / Suite (optional)</label>
                      <input id="addr-line2" value={addr.line2 || ''} onChange={e => up('line2', e.target.value)} placeholder="Apt 4B" className="input" />
                    </div>
                    <div>
                      <label className="label">City *</label>
                      <input value={addr.city} onChange={e => up('city', e.target.value)} placeholder="Fort Myers" className="input" />
                    </div>
                    <div>
                      <label className="label">State *</label>
                      <select value={addr.state} onChange={e => up('state', e.target.value)} className="input bg-white">
                        <option value="">Select…</option>
                        {US_STATES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">ZIP *</label>
                      <input value={addr.zip} onChange={e => up('zip', e.target.value)} placeholder="33901" maxLength={10} className="input" />
                    </div>
                    <div>
                      <label className="label">Phone (optional)</label>
                      <input value={addr.phone || ''} onChange={e => up('phone', e.target.value)} placeholder="(555) 000-0000" className="input" />
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <button onClick={handleContinueToPayment} disabled={creatingOrder}
                      className="w-full sm:w-auto px-8 py-3.5 bg-green-500 hover:bg-green-600 disabled:opacity-60 active:scale-95 text-white font-bold rounded-xl transition-all flex items-center gap-2">
                      {creatingOrder ? (
                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Setting up payment…</>
                      ) : 'Continue to Payment →'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── PAYMENT ── */}
              {step === 'payment' && clientSecret && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Payment</h2>
                  <p className="text-slate-500 text-sm mb-5">
                    Powered by Stripe · Apple Pay & Google Pay supported
                  </p>

                  {/* Shipping summary */}
                  <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-xl text-sm">
                    <p className="font-semibold text-green-800 text-xs mb-0.5">📦 SHIPPING TO</p>
                    <p className="text-green-700">{addr.full_name} · {addr.line1}, {addr.city}, {addr.state} {addr.zip}</p>
                    <button onClick={() => { setStep('shipping'); setClientSecret('') }}
                      className="text-xs text-green-600 hover:underline mt-0.5">
                      Change address
                    </button>
                  </div>

                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: 'stripe',
                        variables: {
                          colorPrimary:       '#22c55e',
                          colorBackground:    '#ffffff',
                          colorText:          '#1e293b',
                          colorDanger:        '#ef4444',
                          fontFamily:         'ui-sans-serif, system-ui, sans-serif',
                          spacingUnit:        '4px',
                          borderRadius:       '12px',
                        },
                      },
                    }}
                  >
                    <StripePaymentForm
                      clientSecret={clientSecret}
                      orderId={orderId}
                      orderNumber={orderNumber}
                      finalTotal={finalTotal}
                      addr={addr}
                      onSuccess={() => {}}
                    />
                  </Elements>
                </div>
              )}

              {step === 'payment' && !clientSecret && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center">
                  <div className="w-8 h-8 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-500 text-sm">Loading payment form…</p>
                </div>
              )}
            </div>

            {/* Order summary */}
            <div>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 lg:sticky lg:top-24">
                <h3 className="font-bold text-lg text-slate-800 mb-4">Order Summary</h3>
                <div className="space-y-3 mb-4">
                  {items.map(item => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                        {item.product.images?.[0]
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                          : <span>🟢</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{item.product.name}</p>
                        <p className="text-xs text-slate-500">Qty {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-slate-700 shrink-0">
                        {formatDollars(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coupon — only on shipping step */}
                {step === 'shipping' && (
                  !couponData ? (
                    <div className="flex gap-2 mb-4">
                      <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Coupon code"
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-400" />
                      <button onClick={applyCoupon} disabled={applyingCoupon || !couponCode}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors">
                        {applyingCoupon ? '…' : 'Apply'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mb-4 p-2 bg-green-50 border border-green-200 rounded-xl">
                      <div>
                        <span className="font-mono font-bold text-green-700 text-sm">{couponData.code}</span>
                        <span className="text-green-600 text-xs ml-2">−{formatDollars(couponData.discount)}</span>
                      </div>
                      <button onClick={() => { setCouponData(null); setCouponCode('') }}
                        className="text-slate-400 hover:text-red-400 text-xs">
                        Remove
                      </button>
                    </div>
                  )
                )}

                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="flex justify-between text-sm text-slate-500"><span>Subtotal</span><span>{formatDollars(subtotal)}</span></div>
                  <div className="flex justify-between text-sm text-slate-500"><span>Shipping</span><span>{formatDollars(shippingTotal)}</span></div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-semibold">
                      <span>Discount</span><span>−{formatDollars(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-slate-800 text-lg pt-1 border-t border-slate-100">
                    <span>Total</span>
                    <span className="text-green-600">{formatDollars(finalTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}