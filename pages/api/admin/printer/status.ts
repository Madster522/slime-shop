import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getSupabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.isAdmin) return res.status(403).json({ error: 'Forbidden' })

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('printers').select('*').order('created_at')
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ printers: data || [] })
}
