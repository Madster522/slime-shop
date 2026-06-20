import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase'

function money(value: number) {
  return Math.round(value * 100) / 100
}

function safeNumber(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const code = String(req.body.code || '').trim().toUpperCase()
  const subtotal = money(Math.max(0, safeNumber(req.body.subtotal)))

  if (!code) return res.status(400).json({ error: 'Coupon code is required' })
  if (subtotal <= 0) return res.status(400).json({ error: 'Add items before using a coupon' })

  const supabase = getSupabaseAdmin()
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single()

  if (error || !coupon) return res.status(404).json({ error: 'Coupon not found or inactive' })

  const now = new Date()
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return res.status(400).json({ error: 'This coupon is not active yet' })
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return res.status(400).json({ error: 'This coupon has expired' })
  }
  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    return res.status(400).json({ error: 'This coupon has reached its use limit' })
  }
  if (coupon.min_order_amount && subtotal < Number(coupon.min_order_amount)) {
    return res.status(400).json({ error: `Minimum order is $${Number(coupon.min_order_amount).toFixed(2)}` })
  }

  let discount = 0
  const value = Math.max(0, Number(coupon.value || 0))

  if (coupon.type === 'percent') {
    const percent = Math.min(value, 100)
    discount = subtotal * (percent / 100)
    if (coupon.max_discount_amount) discount = Math.min(discount, Number(coupon.max_discount_amount))
  } else if (coupon.type === 'fixed') {
    discount = value
  } else {
    return res.status(400).json({ error: 'Invalid coupon type' })
  }

  // IMPORTANT: never let a coupon make the store owe money to the customer.
  discount = money(Math.min(Math.max(0, discount), subtotal))
  const total = money(Math.max(0, subtotal - discount))

  return res.status(200).json({
    coupon: {
      code: coupon.code,
      type: coupon.type,
      value,
      subtotal,
      discount,
      total,
      message: total === 0 ? 'Coupon applied. Order total is $0.00, not negative.' : 'Coupon applied.',
    },
  })
}
