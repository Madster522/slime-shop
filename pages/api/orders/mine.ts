import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getSupabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.email) return res.status(401).json({ error: 'Not authenticated' })

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), order_status_history(*)')
    .eq('customer_email', session.user.email)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  const safeOrders = (data || []).map((o: any) => {
    const { internal_notes, ...rest } = o
    return rest
  })

  return res.status(200).json({ orders: safeOrders })
}
