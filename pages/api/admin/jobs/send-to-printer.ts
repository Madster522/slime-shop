import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getSupabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.isAdmin) return res.status(403).json({ error: 'Forbidden' })

  const { order_id, printer_id, product_name, customization, estimated_minutes } = req.body
  if (!product_name) return res.status(400).json({ error: 'product_name is required' })

  const supabase = getSupabaseAdmin()

  const { data: lastJob } = await supabase
    .from('print_jobs').select('queue_position').order('queue_position', { ascending: false }).limit(1).maybeSingle()

  const { data, error } = await supabase.from('print_jobs').insert({
    order_id:          order_id || null,
    printer_id:        printer_id || null,
    product_name,
    customization:     customization || {},
    estimated_minutes: estimated_minutes || 60,
    status:            'sent_to_printer',
    queue_position:    (lastJob?.queue_position ?? 0) + 1,
    started_at:        new Date().toISOString(),
  }).select().single()

  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json({ job: data })
}
