import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { code, subtotal } = req.body
  if (!code) return res.status(400).json({ error: 'Code is required' })

  const supabase = getSupabaseAdmin()
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.trim().toUpperCase())
    .eq('is_active', true)
    .single()

  if (error || !coupon) return res.status(404).json({ error: 'Invalid or expired coupon code' })

  const now = new Date()
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return res.status(400).json({ error: 'This coupon has expired' })
  }
  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    return res.status(400).json({ error: 'This coupon has reached its usage limit' })
  }
  if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
    return res.status(400).json({
      error: `Minimum order of $${coupon.min_order_amount.toFixed(2)} required for this coupon`
    })
  }

  let discount = 0
  if (coupon.type === 'percent') {
    discount = (subtotal * coupon.value) / 100
    if (coupon.max_discount_amount) discount = Math.min(discount, coupon.max_discount_amount)
  } else {
    discount = Math.min(coupon.value, subtotal)
  }

  return res.status(200).json({
    valid: true,
    coupon: {
      id:       coupon.id,
      code:     coupon.code,
      type:     coupon.type,
      value:    coupon.value,
      discount: parseFloat(discount.toFixed(2)),
    },
  })
}
