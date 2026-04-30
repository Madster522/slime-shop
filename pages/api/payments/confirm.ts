import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getSupabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.email) return res.status(401).json({ error: 'Not authenticated' })

  const { orderId, card_last4, card_brand } = req.body
  if (!orderId) return res.status(400).json({ error: 'orderId required' })

  const supabase = getSupabaseAdmin()

  // Mark as paid and move to Processing
  await supabase.from('orders').update({
    payment_status: 'paid',
    status:         'Processing',
    card_last4:     card_last4 || null,
    card_brand:     card_brand || null,
    updated_at:     new Date().toISOString(),
  }).eq('id', orderId)

  // Add status history entry
  await supabase.from('order_status_history').insert({
    order_id:   orderId,
    status:     'Processing',
    note:       'Payment received',
    changed_by: session.user.email,
  })

  return res.status(200).json({ success: true })
}