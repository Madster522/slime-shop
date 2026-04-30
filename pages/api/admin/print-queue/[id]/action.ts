import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getSupabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.isAdmin) return res.status(403).json({ error: 'Forbidden' })

  const { id } = req.query
  const { action, failure_reason } = req.body

  const statusMap: Record<string, string> = {
    start:    'sent_to_printer',
    printing: 'printing',
    ready:    'ready_for_removal',
    complete: 'completed',
    fail:     'failed',
    retry:    'waiting',
    pause:    'paused',
    cancel:   'cancelled',
  }

  const newStatus = statusMap[action]
  if (!newStatus) return res.status(400).json({ error: 'Invalid action' })

  const supabase = getSupabaseAdmin()
  const update: Record<string, any> = { status: newStatus, updated_at: new Date().toISOString() }

  if (action === 'start' || action === 'printing') update.started_at = new Date().toISOString()
  if (action === 'complete') update.completed_at = new Date().toISOString()
  if (action === 'fail') update.failure_reason = failure_reason || 'Unknown'
  if (action === 'retry') {
    const { data: job } = await supabase.from('print_jobs').select('retry_count').eq('id', id as string).single()
    update.retry_count = (job?.retry_count || 0) + 1
    update.failure_reason = null
  }

  const { data: updatedJob, error } = await supabase
    .from('print_jobs').update(update).eq('id', id as string).select().single()

  if (error) return res.status(500).json({ error: error.message })

  if (action === 'ready') {
    const { data: nextJob } = await supabase
      .from('print_jobs').select('*').eq('status', 'waiting')
      .order('queue_position', { ascending: true }).limit(1).maybeSingle()

    if (nextJob) {
      await supabase.from('print_jobs').update({
        status: 'sent_to_printer',
        started_at: new Date().toISOString(),
      }).eq('id', nextJob.id)

      return res.status(200).json({
        job: updatedJob,
        nextJob: { id: nextJob.id, product_name: nextJob.product_name },
        message: `Next job "${nextJob.product_name}" sent to printer`,
      })
    }
    return res.status(200).json({ job: updatedJob, nextJob: null, message: 'No more jobs. Printer idle.' })
  }

  return res.status(200).json({ job: updatedJob })
}
