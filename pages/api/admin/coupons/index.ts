import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getSupabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.isAdmin) return res.status(403).json({ error: 'Forbidden' })
  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ coupons: data || [] })
  }

  if (req.method === 'POST') {
    const { code, type, value, min_order_amount, max_discount_amount, max_uses, expires_at, description } = req.body
    if (!code || !type || !value) return res.status(400).json({ error: 'code, type, value required' })
    const { data, error } = await supabase.from('coupons').insert({
      code: code.trim().toUpperCase(),
      type, value: Number(value),
      min_order_amount: min_order_amount ? Number(min_order_amount) : null,
      max_discount_amount: max_discount_amount ? Number(max_discount_amount) : null,
      max_uses: max_uses ? Number(max_uses) : null,
      expires_at: expires_at || null,
      description: description || null,
      is_active: true, used_count: 0,
    }).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ coupon: data })
  }
  return res.status(405).end()
}
