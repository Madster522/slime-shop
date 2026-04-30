import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getSupabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.isAdmin) return res.status(403).json({ error: 'Forbidden' })
  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const { approved } = req.query
    let query = supabase.from('reviews').select('*, products(name, slug)').order('created_at', { ascending: false })
    if (approved === 'false') query = query.eq('is_approved', false)
    const { data, error } = await query
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ reviews: data || [] })
  }
  return res.status(405).end()
}
