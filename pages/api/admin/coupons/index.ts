import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getSupabaseAdmin } from '@/lib/supabase'

function positiveOrNull(value: unknown) {
  if (value === '' || value === null || value === undefined) return null
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.isAdmin) return res.status(403).json({ error: 'Admin access required' })

  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ coupons: data || [] })
  }

  if (req.method === 'POST') {
    const code = String(req.body.code || '').trim().toUpperCase()
    const type = String(req.body.type || '').trim()
    const value = Number(req.body.value)

    if (!/^[A-Z0-9_-]{3,32}$/.test(code)) {
      return res.status(400).json({ error: 'Coupon code must be 3-32 letters/numbers. Use A-Z, 0-9, _ or -.' })
    }
    if (!['percent', 'fixed'].includes(type)) {
      return res.status(400).json({ error: 'Coupon type must be percent or fixed' })
    }
    if (!Number.isFinite(value) || value <= 0) {
      return res.status(400).json({ error: 'Coupon value must be greater than 0' })
    }
    if (type === 'percent' && value > 100) {
      return res.status(400).json({ error: 'Percent coupons cannot be more than 100%' })
    }

    const min_order_amount = positiveOrNull(req.body.min_order_amount)
    const max_discount_amount = type === 'percent' ? positiveOrNull(req.body.max_discount_amount) : null
    const max_uses = positiveOrNull(req.body.max_uses)

    const { data, error } = await supabase
      .from('coupons')
      .insert({
        code,
        type,
        value,
        min_order_amount,
        max_discount_amount,
        max_uses,
        expires_at: req.body.expires_at || null,
        starts_at: req.body.starts_at || null,
        name: String(req.body.name || '').trim() || null,
        description: String(req.body.description || '').trim() || null,
        applies_to_shipping: false,
        is_active: true,
        used_count: 0,
      })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ coupon: data })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
