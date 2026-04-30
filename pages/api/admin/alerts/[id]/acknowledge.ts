import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getSupabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.isAdmin) return res.status(403).json({ error: 'Forbidden' })

  const { id } = req.query
  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from('ai_alerts')
    .update({
      acknowledged: true,
      acknowledged_by: session.user.email,
      acknowledged_at: new Date().toISOString(),
    })
    .eq('id', id as string)

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ success: true })
}
