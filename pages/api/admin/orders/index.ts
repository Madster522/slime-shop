import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getSupabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.isAdmin) return res.status(403).json({ error: 'Forbidden' })

  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const { status, search, sort = 'newest', page = '1', per_page = '20' } = req.query

    let query = supabase
      .from('orders')
      .select('*, order_items(*)', { count: 'exact' })

    if (status && status !== 'all') query = query.eq('status', status as string)
    if (search) {
      query = query.or(
        `order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`
      )
    }

    switch (sort) {
      case 'oldest':     query = query.order('created_at', { ascending: true });  break
      case 'total_high': query = query.order('total',      { ascending: false }); break
      case 'total_low':  query = query.order('total',      { ascending: true });  break
      default:           query = query.order('created_at', { ascending: false })
    }

    const pageNum = parseInt(page as string)
    const perPage = parseInt(per_page as string)
    const from = (pageNum - 1) * perPage
    query = query.range(from, from + perPage - 1)

    const { data, error, count } = await query
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({
      orders: data || [],
      meta: { page: pageNum, per_page: perPage, total: count || 0 },
    })
  }

  return res.status(405).end()
}
