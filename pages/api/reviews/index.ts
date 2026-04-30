import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getSupabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const { product_id, slug } = req.query
    let query = supabase.from('reviews').select('*').eq('is_approved', true).order('created_at', { ascending: false })
    if (product_id) query = query.eq('product_id', product_id as string)
    if (slug) {
      const { data: product } = await supabase.from('products').select('id').eq('slug', slug as string).single()
      if (!product) return res.status(200).json({ reviews: [], avg_rating: 0, count: 0 })
      query = query.eq('product_id', product.id)
    }
    const { data, error } = await query
    if (error) return res.status(500).json({ error: error.message })
    const reviews = data || []
    const avg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
    return res.status(200).json({ reviews, avg_rating: Math.round(avg * 10) / 10, count: reviews.length })
  }

  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) return res.status(401).json({ error: 'Sign in to leave a review' })
    const { product_id, rating, title, body } = req.body
    if (!product_id || !rating) return res.status(400).json({ error: 'product_id and rating required' })
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' })

    // Check if user already reviewed
    const { data: existing } = await supabase.from('reviews')
      .select('id').eq('product_id', product_id).eq('reviewer_email', session.user.email).maybeSingle()
    if (existing) return res.status(400).json({ error: 'You already reviewed this product' })

    const { data, error } = await supabase.from('reviews').insert({
      product_id, rating: Number(rating),
      title: title?.trim().slice(0, 100) || null,
      body: body?.trim().slice(0, 1000) || null,
      reviewer_name:  session.user.name || 'Customer',
      reviewer_email: session.user.email,
      is_approved:    false, // admin must approve
    }).select().single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ review: data, message: 'Review submitted! It will appear after approval.' })
  }
  return res.status(405).end()
}
