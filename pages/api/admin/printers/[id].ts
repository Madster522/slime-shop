import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getSupabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.isAdmin) return res.status(403).json({ error: 'Forbidden' })

  const { id } = req.query
  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('printers').select('*').eq('id', id as string).single()
    if (error || !data) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json({ printer: data })
  }

  if (req.method === 'PATCH') {
    const updates = { ...req.body }
    delete updates.id
    delete updates.created_at
    updates.updated_at = new Date().toISOString()
    const { data, error } = await supabase.from('printers').update(updates).eq('id', id as string).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ printer: data })
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('printers').delete().eq('id', id as string)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  return res.status(405).end()
}
