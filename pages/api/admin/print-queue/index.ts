import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getSupabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.isAdmin) return res.status(403).json({ error: 'Forbidden' })

  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('print_jobs')
      .select('*, orders(order_number, customer_name, customer_email)')
      .order('queue_position', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ jobs: data || [] })
  }

  if (req.method === 'POST') {
    const { order_id, printer_id, product_name, customization, estimated_minutes } = req.body

    const { data: lastJob } = await supabase
      .from('print_jobs')
      .select('queue_position')
      .order('queue_position', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextPosition = (lastJob?.queue_position ?? 0) + 1

    const { data, error } = await supabase
      .from('print_jobs')
      .insert({
        order_id: order_id || null,
        printer_id: printer_id || null,
        product_name,
        customization: customization || {},
        estimated_minutes: estimated_minutes || 60,
        status: 'waiting',
        queue_position: nextPosition,
      })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ job: data })
  }

  return res.status(405).end()
}
