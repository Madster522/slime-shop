import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getSupabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.email) return res.status(401).json({ error: 'Not authenticated' })

  const { id } = req.query
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), order_status_history(*)')
    .eq('id', id as string)
    .eq('customer_email', session.user.email)
    .single()

  if (error || !data) return res.status(404).json({ error: 'Order not found' })

  const { internal_notes, ...safe } = data
  return res.status(200).json({ order: safe })
}
