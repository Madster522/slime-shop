import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getSupabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.isAdmin) return res.status(403).json({ error: 'Admin access required' })

  const { id } = req.query
  const { status, note, internal_note, tracking_number, carrier, estimated_delivery, delay_reason } = req.body

  if (!status) return res.status(400).json({ error: 'status is required' })

  const supabase = getSupabaseAdmin()

  const orderUpdate: Record<string, any> = { status, updated_at: new Date().toISOString() }
  if (tracking_number !== undefined) orderUpdate.tracking_number = tracking_number || null
  if (carrier !== undefined) orderUpdate.carrier = carrier || null
  if (estimated_delivery !== undefined) orderUpdate.estimated_delivery = estimated_delivery || null
  if (delay_reason !== undefined) orderUpdate.delay_reason = delay_reason || null

  const { error: updateError } = await supabase
    .from('orders')
    .update(orderUpdate)
    .eq('id', id as string)

  if (updateError) return res.status(500).json({ error: updateError.message })

  await supabase.from('order_status_history').insert({
    order_id: id as string,
    status,
    note: note || null,
    internal_note: internal_note || null,
    changed_by: session.user.email,
  })

  return res.status(200).json({ success: true })
}
