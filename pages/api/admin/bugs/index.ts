import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getSupabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.isAdmin) return res.status(403).json({ error: 'Forbidden' })

  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const { status, severity } = req.query
    let query = supabase.from('bug_reports').select('*').order('created_at', { ascending: false })
    if (status && status !== 'all') query = query.eq('status', status as string)
    if (severity && severity !== 'all') query = query.eq('severity', severity as string)
    const { data, error } = await query
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ bugs: data || [] })
  }

  if (req.method === 'POST') {
    const { title, description, severity, category, page_url, steps_to_reproduce, expected_behavior, actual_behavior } = req.body
    if (!title || !description) return res.status(400).json({ error: 'title and description are required' })

    const { data, error } = await supabase.from('bug_reports').insert({
      title, description,
      severity:            severity || 'medium',
      category:            category || 'general',
      page_url:            page_url || null,
      steps_to_reproduce:  steps_to_reproduce || null,
      expected_behavior:   expected_behavior || null,
      actual_behavior:     actual_behavior || null,
      reported_by:         session.user.email!,
      status:              'open',
    }).select().single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ bug: data })
  }

  return res.status(405).end()
}
