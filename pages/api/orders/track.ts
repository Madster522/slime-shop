import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const { order_number, email } = req.query
  if (!order_number) return res.status(400).json({ error: 'order_number is required' })

  const supabase = getSupabaseAdmin()
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*), order_status_history(*)')
    .eq('order_number', order_number as string)
    .single()

  if (error || !order) return res.status(404).json({ error: 'Order not found' })

  if (email) {
    if (order.customer_email.toLowerCase() !== (email as string).toLowerCase()) {
      return res.status(403).json({ error: 'Email does not match this order' })
    }
  }

  const { internal_notes, ...safeOrder } = order
  const safeHistory = (order.order_status_history || []).map((h: any) => {
    const { internal_note, ...rest } = h
    return rest
  })

  return res.status(200).json({ order: { ...safeOrder, order_status_history: safeHistory } })
}
