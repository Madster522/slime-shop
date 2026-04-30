import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useCart } from '@/context/CartContext'
import { formatDollars, timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'

function Stars({ rating, size = 'md', interactive = false, onRate }: { rating: number; size?: 'sm'|'md'|'lg'; interactive?: boolean; onRate?: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  const sz = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-lg'
  return (
    <span className={`flex gap-0.5 ${sz}`}>
      {[1,2,3,4,5].map(i => (
        <span key={i}
          className={`${interactive ? 'cursor-pointer transition-transform hover:scale-110' : ''} ${(interactive ? (hover || rating) >= i : rating >= i) ? 'text-yellow-400' : 'text-slate-300'}`}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate?.(i)}>
          ★
        </span>
      ))}
    </span>
  )
}

export default function ProductPage() {
  const router = useRouter()
  const { slug } = router.query
  const { addItem } = useCart()
  const { data: session } = useSession()

  const [product, setProduct]       = useState<any>(null)
  const [loading, setLoading]       = useState(true)
  const [qty, setQty]               = useState(1)
  const [customization, setCustomization] = useState<Record<string, string>>({})
  const [activeImg, setActiveImg]   = useState(0)
  const [added, setAdded]           = useState(false)

  // Reviews
  const [reviews, setReviews]       = useState<any[]>([])
  const [avgRating, setAvgRating]   = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [myRating, setMyRating]     = useState(0)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewBody, setReviewBody] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/products/${slug}`).then(r => r.json()).then(d => { setProduct(d.product || null); setLoading(false) }).catch(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!slug) return
    fetch(`/api/reviews?slug=${slug}`).then(r => r.json()).then(d => {
      setReviews(d.reviews || [])
      setAvgRating(d.avg_rating || 0)
      setReviewCount(d.count || 0)
    })
  }, [slug])

  const handleAddToCart = () => {
    const missing = (product.customization_options || []).filter((o: any) => o.required && !customization[o.id])
    if (missing.length > 0) { toast.error(`Please choose: ${missing.map((o: any) => o.name).join(', ')}`); return }
    addItem(product, qty, customization)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const submitReview = async () => {
    if (!myRating) { toast.error('Please select a star rating'); return }
    if (!session)  { toast.error('Sign in to leave a review'); return }
    setSubmittingReview(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, rating: myRating, title: reviewTitle, body: reviewBody }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      toast.success(data.message || 'Review submitted!')
      setShowReviewForm(false); setMyRating(0); setReviewTitle(''); setReviewBody('')
    } finally { setSubmittingReview(false) }
  }

  if (loading) return (
    <><Navbar /><main className="min-h-screen bg-slate-50 pt-24 flex items-center justify-center"><div className="w-8 h-8 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" /></main><Footer /></>
  )

  if (!product) return (
    <><Head><title>Not Found — Slime Shop</title></Head><Navbar />
    <main className="min-h-screen bg-slate-50 pt-24 flex items-center justify-center px-4">
      <div className="text-center"><p className="text-7xl mb-6">😢</p><h1 className="text-3xl font-bold text-slate-800 mb-4">Product not found</h1>
        <Link href="/shop" className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold">Back to Shop</Link></div>
    </main><Footer /></>
  )

  const images = product.images || []
  const total  = ((product.price || 0) + (product.shipping_price || 0)) * qty

  return (
    <>
      <Head><title>{product.name} — Slime Shop</title><meta name="description" content={product.description} /></Head>
      <Navbar />
      <main className="pt-24 pb-20 min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-green-600">Home</Link><span>/</span>
            <Link href="/shop" className="hover:text-green-600">Shop</Link><span>/</span>
            <span className="text-slate-800 font-semibold">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Images */}
            <div>
              <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 aspect-square flex items-center justify-center border border-green-100 mb-4 relative">
                {images[activeImg] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
                ) : <span className="text-9xl">🟢</span>}
                {product.has_customization && <div className="absolute top-4 right-4 bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-bold">✨ Customizable</div>}
              </div>
              {images.length > 1 && (
                <div className="flex gap-3">
                  {images.map((img: string, i: number) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-green-500' : 'border-slate-200 hover:border-green-300'}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-bold">{product.category}</span>
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${product.stock_status === 'made_to_order' ? 'bg-blue-100 text-blue-700' : product.stock_status === 'in_stock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {product.stock_status === 'made_to_order' ? '🖨️ Made to Order' : product.stock_status === 'in_stock' ? '✅ In Stock' : '❌ Out of Stock'}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-slate-900 mb-2">{product.name}</h1>

              {/* Rating summary */}
              {reviewCount > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <Stars rating={avgRating} size="sm" />
                  <span className="text-slate-600 text-sm">{avgRating.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
                </div>
              )}

              <p className="text-slate-600 leading-relaxed mb-6">{product.description}</p>

              {/* Pricing */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                <div className="flex justify-between text-sm text-slate-500 mb-1"><span>Item</span><span className="font-semibold text-slate-800">{formatDollars(product.price)}</span></div>
                <div className="flex justify-between text-sm text-slate-500 mb-2"><span>Shipping</span><span>+{formatDollars(product.shipping_price || 0)}</span></div>
                <div className="flex justify-between font-bold border-t border-slate-200 pt-2">
                  <span className="text-slate-700">Total ×{qty}</span>
                  <span className="text-green-600 text-xl">{formatDollars(total)}</span>
                </div>
              </div>

              {/* Customizations */}
              {product.has_customization && (product.customization_options || []).map((opt: any) => (
                <div key={opt.id} className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{opt.name} {opt.required && <span className="text-red-500">*</span>}</label>
                  {opt.type === 'color' && (
                    <div className="flex flex-wrap gap-2">
                      {(opt.options || []).map((color: string) => (
                        <button key={color} onClick={() => setCustomization(p => ({ ...p, [opt.id]: color }))}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${customization[opt.id] === color ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-600 hover:border-green-300'}`}>
                          {color}
                        </button>
                      ))}
                    </div>
                  )}
                  {opt.type === 'text' && (
                    <input className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                      placeholder={`Enter ${opt.name.toLowerCase()}…`} value={customization[opt.id] || ''} onChange={e => setCustomization(p => ({ ...p, [opt.id]: e.target.value }))} maxLength={30} />
                  )}
                  {opt.type === 'select' && (
                    <select value={customization[opt.id] || ''} onChange={e => setCustomization(p => ({ ...p, [opt.id]: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm">
                      <option value="">Choose {opt.name}…</option>
                      {(opt.options || []).map((o: string) => <option key={o}>{o}</option>)}
                    </select>
                  )}
                </div>
              ))}

              {/* Qty + Add */}
              <div className="flex gap-3 items-center mb-4">
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-3 text-slate-600 hover:bg-slate-50 font-bold text-lg transition-colors">−</button>
                  <span className="px-5 py-3 font-bold text-slate-800 min-w-[40px] text-center">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(10, q + 1))} className="px-4 py-3 text-slate-600 hover:bg-slate-50 font-bold text-lg transition-colors">+</button>
                </div>
                <button onClick={handleAddToCart} disabled={product.stock_status === 'out_of_stock'}
                  className={`flex-1 py-4 px-6 font-bold rounded-2xl text-lg transition-all shadow-sm ${added ? 'bg-green-600 text-white scale-95' : product.stock_status === 'out_of_stock' ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white hover:shadow-md active:scale-95'}`}>
                  {added ? '✓ Added!' : '🛒 Add to Cart'}
                </button>
              </div>
              <Link href="/cart" className="block text-center text-sm text-green-600 hover:underline mb-4">View Cart →</Link>
              {product.estimated_print_minutes > 0 && (
                <p className="text-sm text-slate-500">⏱️ Est. print time: <strong>{product.estimated_print_minutes < 60 ? `${product.estimated_print_minutes}m` : `${Math.floor(product.estimated_print_minutes / 60)}h ${product.estimated_print_minutes % 60}m`}</strong></p>
              )}
            </div>
          </div>

          {/* Reviews section */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Customer Reviews</h2>
                {reviewCount > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <Stars rating={avgRating} />
                    <span className="text-slate-600 text-sm">{avgRating.toFixed(1)} out of 5 · {reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
              {session && !showReviewForm && (
                <button onClick={() => setShowReviewForm(true)}
                  className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors text-sm">
                  ✍️ Write a Review
                </button>
              )}
              {!session && (
                <p className="text-slate-400 text-sm"><Link href="/auth/signin" className="text-green-600 hover:underline">Sign in</Link> to leave a review</p>
              )}
            </div>

            {/* Review form */}
            {showReviewForm && (
              <div className="mb-8 p-5 bg-green-50 border border-green-200 rounded-2xl">
                <h3 className="font-bold text-slate-800 mb-4">Your Review</h3>
                <div className="mb-3">
                  <label className="label">Rating *</label>
                  <Stars rating={myRating} size="lg" interactive onRate={setMyRating} />
                </div>
                <div className="mb-3">
                  <label className="label">Title</label>
                  <input value={reviewTitle} onChange={e => setReviewTitle(e.target.value)} placeholder="Great product!" className="input" maxLength={100} />
                </div>
                <div className="mb-4">
                  <label className="label">Review</label>
                  <textarea value={reviewBody} onChange={e => setReviewBody(e.target.value)} rows={4} placeholder="Tell others about your experience…" className="input resize-none" maxLength={1000} />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowReviewForm(false)} className="px-5 py-2.5 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-slate-300">Cancel</button>
                  <button onClick={submitReview} disabled={submittingReview || !myRating}
                    className="px-5 py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors">
                    {submittingReview ? 'Submitting…' : 'Submit Review'}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">Reviews are published after approval by our team.</p>
              </div>
            )}

            {/* Reviews list */}
            {reviews.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-4xl mb-3">⭐</p>
                <p className="text-slate-500">No reviews yet — be the first!</p>
              </div>
            ) : (
              <div className="space-y-5">
                {reviews.map((r: any) => (
                  <div key={r.id} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <Stars rating={r.rating} size="sm" />
                        {r.title && <p className="font-bold text-slate-800 mt-1">{r.title}</p>}
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">{timeAgo(r.created_at)}</span>
                    </div>
                    {r.body && <p className="text-slate-600 text-sm leading-relaxed mb-1">{r.body}</p>}
                    <p className="text-xs text-slate-400">— {r.reviewer_name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
