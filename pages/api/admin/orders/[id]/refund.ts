import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getSupabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.isAdmin) return res.status(403).json({ error: 'Admin only' })

  const { id } = req.query
  const { reason } = req.body

  const supabase = getSupabaseAdmin()

  const { data: order, error } = await supabase
    .from('orders').select('*').eq('id', id as string).single()

  if (error || !order) return res.status(404).json({ error: 'Order not found' })
  if (order.payment_status === 'refunded') return res.status(400).json({ error: 'Already refunded' })

  await supabase.from('orders').update({
    payment_status: 'refunded',
    status:         'Cancelled',
    updated_at:     new Date().toISOString(),
  }).eq('id', id as string)

  await supabase.from('order_status_history').insert({
    order_id:      id as string,
    status:        'Cancelled',
    note:          `Refund issued${reason ? ': ' + reason : ''}`,
    internal_note: `Refunded by ${session.user.email}`,
    changed_by:    session.user.email,
  })

  return res.status(200).json({ success: true })
}